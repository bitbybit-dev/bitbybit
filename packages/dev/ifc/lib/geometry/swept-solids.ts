import type { Base } from "@bitbybit-dev/base";
import { axesToMatrix, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { pathTangents, roundedPath3, sweepMatrices, transportedAxes } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/paths";
import { cross3, dot3, length3, scale2, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { PARALLEL_TOLERANCE } from "../build/constants";
import { axisPlacementFrame, directionOf, pointOf } from "../build/placement";
import { radiansPerUnit } from "../build/project";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isReference, isTyped } from "../step/values";
import { arcSegments, type CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import type { CircleRegion, PolygonRegion, ProfileRegion, SweepBound } from "./geometry-types";
import { profileRegion } from "./profiles";
import { profileNode, regionSolid } from "./regions";
import type { RecipeBuilder } from "./recipe-builder";
import { FULL_TURN, IDENTITY_MATRIX, LENGTH_MEASURE, PARAMETER_RATIO, PYRAMID_TRIANGLES, TURN_SLACK, Y_TO_Z } from "./swept-solids.constants";

const Z_AXIS: Base.Vector3 = [0, 0, 1];
const NO_AXIS: Base.Vector3 = [0, 0, 0];

function squared(vector: Base.Vector3, to: Base.Vector3): Base.Vector3 | undefined {
    const across = subtract3(vector, scale3(to, dot3(vector, to)));
    const length = length3(across);
    return length > PARALLEL_TOLERANCE ? scale3(across, 1 / length) : undefined;
}

function boundOf(value: IfcValue): SweepBound | undefined {
    if (typeof value === "number") {
        return { value, byLength: false };
    }
    return isTyped(value) && typeof value.value === "number" ? { value: value.value, byLength: value.type.toUpperCase() === LENGTH_MEASURE } : undefined;
}

function moved(offset: Base.Vector3): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, offset[0], offset[1], offset[2], 1];
}

export class SweptSolids {
    private readonly model: ModelSnapshot;
    private readonly builder: RecipeBuilder;
    private readonly curves: CurveSampler;

    constructor(model: ModelSnapshot, builder: RecipeBuilder, curves: CurveSampler) {
        this.model = model;
        this.builder = builder;
        this.curves = curves;
    }

    revolved(item: number): number {
        const region = this.region(item, "SweptArea");
        const axis = this.model.attribute(item, "Axis");
        if (!isReference(axis)) {
            throw new UnsupportedGeometryError(`#${item} has no axis`);
        }
        const origin = pointOf(this.model, this.model.attribute(axis.ref, "Location"));
        const direction = directionOf(this.model, this.model.attribute(axis.ref, "Axis"), Z_AXIS);
        const length = length3(direction);
        if (!(length > 0) || Math.abs(direction[2]) > PARALLEL_TOLERANCE * length || Math.abs(origin[2]) > PARALLEL_TOLERANCE * Math.max(1, length3(origin))) {
            throw new UnsupportedGeometryError(`#${item} turns about an axis outside its profile's plane`);
        }
        const turn = this.number(item, "Angle") * radiansPerUnit(this.model);
        const sign = Math.sign(turn);
        const angle = Math.min(Math.abs(turn), FULL_TURN);
        if (!(angle > 0) || Math.abs(turn) > FULL_TURN * (1 + TURN_SLACK)) {
            throw new UnsupportedGeometryError(`#${item} turns by an angle that is not above zero and at most a whole turn`);
        }
        const solid = regionSolid(this.builder, region, this.flat(item, (profile) => this.builder.node({
            op: "revolve", profile, origin: [origin[0], origin[1]], direction: scale2([direction[0], direction[1]], sign), angle,
        })));
        return this.placed(item, solid);
    }

    tapered(item: number): number {
        const start = this.region(item, "SweptArea");
        const end = this.region(item, "EndSweptArea");
        const depth = this.number(item, "Depth");
        if (depth === 0) {
            throw new UnsupportedGeometryError(`#${item} has no depth`);
        }
        const direction = directionOf(this.model, this.model.attribute(item, "ExtrudedDirection"), Z_AXIS);
        const along = scale3(direction, depth / length3(direction));
        if (!(Math.abs(along[2]) > PARALLEL_TOLERANCE * Math.abs(depth))) {
            throw new UnsupportedGeometryError(`#${item} tapers along its profile's plane`);
        }
        const frames = this.builder.numbers([...IDENTITY_MATRIX, ...moved(along)]);
        const loft = (first: number, second: number): number => this.builder.node({ op: "loft", profiles: [first, second], frames });
        return this.placed(item, this.taperBetween(item, start, end, loft));
    }

    sweptDisk(item: number, polygonal: boolean): number {
        const radius = this.number(item, "Radius");
        const inner = this.model.attribute(item, "InnerRadius") === null ? 0 : this.number(item, "InnerRadius");
        if (!(radius > 0) || !(inner >= 0) || !(inner < radius)) {
            throw new UnsupportedGeometryError(`#${item} has a radius that is not above zero or an inner radius not inside it`);
        }
        let points = this.sweptPath(item);
        const fillet = polygonal && this.model.attribute(item, "FilletRadius") !== null ? this.number(item, "FilletRadius") : 0;
        if (fillet > 0) {
            points = roundedPath3(points, fillet, arcSegments);
        }
        const tangents = pathTangents(points, ...this.endsOf(item));
        const frames = this.builder.numbers(sweepMatrices(points, tangents, transportedAxes(points, tangents, NO_AXIS)).flat());
        const loft = (size: number): number => this.builder.node({ op: "loft", profiles: [this.builder.node({ op: "circle", center: [0, 0], radius: size })], frames });
        const solid = loft(radius);
        return inner > 0 ? this.builder.node({ op: "difference", of: solid, tools: [loft(inner)] }) : solid;
    }

    areaSweep(item: number, fixed: boolean): number {
        const region = this.region(item, "SweptArea");
        const points = this.sweptPath(item);
        const tangents = pathTangents(points, ...this.endsOf(item));
        const axes = fixed ? this.fixedAxes(item, tangents) : this.surfaceAxes(item, points, tangents, region);
        const frames = this.builder.numbers(sweepMatrices(points, tangents, axes).flat());
        const solid = regionSolid(this.builder, region, this.flat(item, (profile) => this.builder.node({ op: "loft", profiles: [profile], frames })));
        return this.placed(item, solid);
    }

    primitive(item: number, type: string): number {
        switch (type) {
            case "IfcBlock": {
                const [x, y, z] = [this.number(item, "XLength"), this.number(item, "YLength"), this.number(item, "ZLength")];
                const profile = this.builder.node({ op: "polygon", points: this.builder.numbers([0, 0, x, 0, x, y, 0, y]), holes: [] });
                return this.placed(item, this.builder.node({ op: "extrude", profile, direction: Z_AXIS, depth: z }));
            }
            case "IfcRightCircularCylinder": {
                const profile = this.builder.node({ op: "circle", center: [0, 0], radius: this.number(item, "Radius") });
                return this.placed(item, this.builder.node({ op: "extrude", profile, direction: Z_AXIS, depth: this.number(item, "Height") }));
            }
            case "IfcRightCircularCone": {
                const [radius, height] = [this.number(item, "BottomRadius"), this.number(item, "Height")];
                const profile = this.builder.node({ op: "polygon", points: this.builder.numbers([0, 0, radius, 0, 0, height]), holes: [] });
                const cone = this.builder.node({ op: "revolve", profile, origin: [0, 0], direction: [0, 1], angle: FULL_TURN });
                return this.placed(item, this.builder.node({ op: "transform", of: cone, matrix: Y_TO_Z }));
            }
            case "IfcSphere": {
                const radius = this.number(item, "Radius");
                const segments = arcSegments(Math.PI);
                const half = Array.from({ length: segments + 1 }, (_, at) => {
                    const angle = -Math.PI / 2 + (Math.PI * at) / segments;
                    return [radius * Math.cos(angle), radius * Math.sin(angle)];
                }).flat();
                const profile = this.builder.node({ op: "polygon", points: this.builder.numbers(half), holes: [] });
                return this.placed(item, this.builder.node({ op: "revolve", profile, origin: [0, 0], direction: [0, 1], angle: FULL_TURN }));
            }
            default:
                return this.placed(item, this.pyramid(item));
        }
    }

    private pyramid(item: number): number {
        const [x, y, height] = [this.number(item, "XLength"), this.number(item, "YLength"), this.number(item, "Height")];
        const positions = [0, 0, 0, x, 0, 0, x, y, 0, 0, y, 0, x / 2, y / 2, height];
        return this.builder.node({ op: "triangles", positions: this.builder.numbers(positions), indices: this.builder.indices(PYRAMID_TRIANGLES) });
    }

    private taperBetween(item: number, start: ProfileRegion, end: ProfileRegion, loft: (first: number, second: number) => number): number {
        if (start.kind === "circle" && end.kind === "circle") {
            const outer = loft(profileNode(this.builder, start), profileNode(this.builder, end));
            if (!(start.innerRadius > 0) && !(end.innerRadius > 0)) {
                return outer;
            }
            if (!(start.innerRadius > 0) || !(end.innerRadius > 0)) {
                throw new UnsupportedGeometryError(`#${item} tapers between a hollow and a solid circle`);
            }
            const inner = loft(profileNode(this.builder, start, start.innerRadius), profileNode(this.builder, end, end.innerRadius));
            return this.builder.node({ op: "difference", of: outer, tools: [inner] });
        }
        if (start.kind !== "polygon" || end.kind !== "polygon" || start.plane !== undefined || end.plane !== undefined) {
            throw new UnsupportedGeometryError(`#${item} tapers between profiles of different kinds, which is not supported yet`);
        }
        return loft(profileNode(this.builder, start), profileNode(this.builder, end));
    }

    private fixedAxes(item: number, tangents: readonly Base.Vector3[]): Base.Vector3[] {
        const reference = directionOf(this.model, this.model.attribute(item, "FixedReference"), [1, 0, 0]);
        return tangents.map((tangent) => {
            const axis = squared(reference, tangent);
            if (axis === undefined) {
                throw new UnsupportedGeometryError(`#${item} has a fixed reference along its directrix`);
            }
            return axis;
        });
    }

    private surfaceAxes(item: number, points: readonly Base.Point3[], tangents: readonly Base.Vector3[], region: ProfileRegion): Base.Vector3[] {
        const surface = this.model.attribute(item, "ReferenceSurface");
        const type = isReference(surface) ? this.model.entity(surface.ref).type : "";
        const normalAt = this.surfaceNormal(isReference(surface) ? surface.ref : 0, type);
        if (normalAt === undefined) {
            if (region.kind === "circle" && region.center[0] === 0 && region.center[1] === 0) {
                return transportedAxes(points, tangents, NO_AXIS);
            }
            throw new UnsupportedGeometryError(`A sweep on an ${type || "unnamed"} reference surface is not supported yet`);
        }
        return tangents.map((tangent) => {
            const axis = squared(normalAt(tangent), tangent);
            if (axis === undefined) {
                throw new UnsupportedGeometryError(`#${item}'s directrix runs along the normal of its reference surface`);
            }
            return axis;
        });
    }

    private surfaceNormal(surface: number, type: string): ((tangent: Base.Vector3) => Base.Vector3) | undefined {
        const position = surface === 0 ? null : this.model.attribute(surface, "Position");
        const frame = isReference(position) ? axisPlacementFrame(this.model, position.ref) : undefined;
        if (type === "IfcPlane" && frame) {
            return () => frame.z;
        }
        if (type !== "IfcSurfaceOfLinearExtrusion") {
            return undefined;
        }
        const direction = directionOf(this.model, this.model.attribute(surface, "ExtrudedDirection"), Z_AXIS);
        const extruded = frame ? vectorToWorld(frame, direction) : direction;
        return (tangent) => cross3(tangent, extruded);
    }

    private endsOf(item: number): readonly [Base.Vector3 | undefined, Base.Vector3 | undefined] {
        const directrix = this.model.attribute(item, "Directrix");
        return isReference(directrix) ? this.curves.endTangents(directrix.ref) : [undefined, undefined];
    }

    private sweptPath(item: number): Base.Point3[] {
        const directrix = this.model.attribute(item, "Directrix");
        if (!isReference(directrix)) {
            throw new UnsupportedGeometryError(`#${item} has no directrix`);
        }
        const points = this.curves.path(directrix.ref);
        if (points.length < 2) {
            throw new UnsupportedGeometryError(`#${item} sweeps along a directrix of no length`);
        }
        const start = boundOf(this.model.attribute(item, "StartParam"));
        const end = boundOf(this.model.attribute(item, "EndParam"));
        if (start === undefined && end === undefined) {
            return points;
        }
        const byLength = start?.byLength ?? end!.byLength;
        const span = start !== undefined && end !== undefined && start.byLength !== end.byLength
            ? undefined
            : byLength ? this.curves.lengthSpan(directrix.ref) : this.curves.parameterSpan(directrix.ref);
        const from = start?.value ?? 0;
        const to = end?.value ?? span;
        if (span !== undefined && to !== undefined && Math.abs(to - from - span) <= PARAMETER_RATIO * Math.max(1, span)) {
            return points;
        }
        throw new UnsupportedGeometryError(`#${item} sweeps along part of its directrix, which is not supported yet`);
    }

    private flat(item: number, make: (profile: number) => number): (profile: number, part: PolygonRegion | CircleRegion) => number {
        return (profile, part) => {
            if (part.kind === "polygon" && part.plane !== undefined) {
                throw new UnsupportedGeometryError(`#${item} sweeps a profile written off its own plane`);
            }
            return make(profile);
        };
    }

    private region(item: number, name: string): ProfileRegion {
        const area = this.model.attribute(item, name);
        if (!isReference(area)) {
            throw new UnsupportedGeometryError(`#${item} has no ${name}`);
        }
        return profileRegion(this.model, area.ref, this.curves);
    }

    private number(item: number, name: string): number {
        const value = this.model.attribute(item, name);
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new UnsupportedGeometryError(`#${item} has no finite ${name}`);
        }
        return value;
    }

    private placed(item: number, solid: number): number {
        const position = this.model.attribute(item, "Position");
        if (!isReference(position)) {
            return solid;
        }
        return this.builder.node({ op: "transform", of: solid, matrix: axesToMatrix(axisPlacementFrame(this.model, position.ref)) });
    }
}
