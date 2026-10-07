import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, axesToMatrix } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { add3, cross3, dot3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { PARALLEL_TOLERANCE } from "../build/constants";
import { axisPlacementFrame, directionOf, pointOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isEnumeration, isList, isReference } from "../step/values";
import { CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import { INWARD, MeshCollector, OUTWARD, UNORIENTED, concatenated } from "./faceted";
import { itemColour } from "./colours";
import type { PartEntry, PartGroup, RecipePart, TriangleMesh } from "./geometry-types";
import { profileRegion } from "./profiles";
import type { RecipeBuilder } from "./recipe-builder";

const IDENTITY = axesToMatrix(WORLD_AXES);
const X_AXIS: Base.Vector3 = [1, 0, 0];
const Y_AXIS: Base.Vector3 = [0, 1, 0];
const Z_AXIS: Base.Vector3 = [0, 0, 1];
const SPATIAL_OPERATOR = "IfcCartesianTransformationOperator3D";
const CLOSED_SHELL = "IfcClosedShell";
const MAPPED_ITEM = "IfcMappedItem";
const SURFACE_MODEL_FACES: Readonly<Record<string, string>> = { IfcFaceBasedSurfaceModel: "FbsmFaces", IfcShellBasedSurfaceModel: "SbsmBoundary" };
const MESH_ITEMS: ReadonlySet<string> = new Set(["IfcTriangulatedFaceSet", "IfcPolygonalFaceSet", "IfcFacetedBrep", "IfcFacetedBrepWithVoids", "IfcFaceBasedSurfaceModel", "IfcShellBasedSurfaceModel"]);

function isIdentity(matrix: readonly number[]): boolean {
    return matrix.every((value, index) => value === IDENTITY[index]);
}

function flat(points: readonly Base.Point2[]): number[] {
    return points.flatMap(([x, y]) => [x, y]);
}

function optionalAttribute(model: ModelSnapshot, id: number, name: string): IfcValue {
    return model.schema.entity(model.entity(id).type).positions.has(name) ? model.attribute(id, name) : null;
}

function operatorAxis(model: ModelSnapshot, operator: number, name: string): Base.Vector3 | undefined {
    const value = optionalAttribute(model, operator, name);
    if (!isReference(value)) {
        return undefined;
    }
    const direction = directionOf(model, value, Z_AXIS);
    const length = length3(direction);
    if (!(length > 0)) {
        throw new UnsupportedGeometryError(`#${operator} has an ${name} of zero length`);
    }
    return scale3(direction, 1 / length);
}

function operatorScale(model: ModelSnapshot, operator: number, name: string, fallback: number): number {
    const value = optionalAttribute(model, operator, name);
    if (value === null) {
        return fallback;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
        throw new UnsupportedGeometryError(`#${operator} has a ${name} that is not a number above zero`);
    }
    return value;
}

function spaceAxes(operator: number, axis1: Base.Vector3 | undefined, axis2: Base.Vector3 | undefined, axis3: Base.Vector3 | undefined): [Base.Vector3, Base.Vector3, Base.Vector3] {
    const z = axis3 ?? Z_AXIS;
    const hint = axis1 ?? (length3(cross3(z, X_AXIS)) > PARALLEL_TOLERANCE ? X_AXIS : Y_AXIS);
    const across = subtract3(hint, scale3(z, dot3(hint, z)));
    const length = length3(across);
    if (!(length > PARALLEL_TOLERANCE)) {
        throw new UnsupportedGeometryError(`#${operator} has its Axis1 along its Axis3`);
    }
    const x = scale3(across, 1 / length);
    const y = cross3(z, x);
    return [x, dot3(axis2 ?? Y_AXIS, y) < -PARALLEL_TOLERANCE ? cross3(x, z) : y, z];
}

function planeAxes(axis1: Base.Vector3 | undefined, axis2: Base.Vector3 | undefined): [Base.Vector3, Base.Vector3, Base.Vector3] {
    if (axis1 !== undefined) {
        const y = cross3(Z_AXIS, axis1);
        return [axis1, axis2 !== undefined && dot3(axis2, y) < -PARALLEL_TOLERANCE ? cross3(axis1, Z_AXIS) : y, Z_AXIS];
    }
    return axis2 === undefined ? [X_AXIS, Y_AXIS, Z_AXIS] : [cross3(axis2, Z_AXIS), axis2, Z_AXIS];
}

function operatorMatrix(model: ModelSnapshot, operator: number): Base.TransformMatrix {
    const origin = pointOf(model, model.attribute(operator, "LocalOrigin"));
    const axis1 = operatorAxis(model, operator, "Axis1");
    const axis2 = operatorAxis(model, operator, "Axis2");
    const [x, y, z] = model.schema.isSubtypeOf(model.entity(operator).type, SPATIAL_OPERATOR)
        ? spaceAxes(operator, axis1, axis2, operatorAxis(model, operator, "Axis3"))
        : planeAxes(axis1, axis2);
    const scale = operatorScale(model, operator, "Scale", 1);
    const scaleY = operatorScale(model, operator, "Scale2", scale);
    const scaleZ = operatorScale(model, operator, "Scale3", scale);
    return [...scale3(x, scale), 0, ...scale3(y, scaleY), 0, ...scale3(z, scaleZ), 0, ...origin, 1];
}

export class ItemConverter {
    private readonly model: ModelSnapshot;
    private readonly builder: RecipeBuilder;
    private readonly curves: CurveSampler;
    private readonly reach: number;
    private readonly items = new Map<number, number>();
    private readonly maps = new Map<number, readonly RecipePart[]>();
    private readonly representations = new Map<number, readonly RecipePart[]>();
    private readonly itemColours = new Map<number, number[] | undefined>();

    constructor(model: ModelSnapshot, builder: RecipeBuilder, reach: number) {
        this.model = model;
        this.builder = builder;
        this.curves = new CurveSampler(model);
        this.reach = reach;
    }

    representation(representation: number): number {
        return this.joined(this.parts(representation).map((part) => part.node));
    }

    parts(representation: number): readonly RecipePart[] {
        const known = this.representations.get(representation);
        if (known) {
            return known;
        }
        const items = this.model.attribute(representation, "Items");
        const ids = (isList(items) ? items : []).filter(isReference).map((item) => item.ref);
        if (!ids.length) {
            throw new UnsupportedGeometryError(`#${representation} holds no items`);
        }
        const groups = new Map<string, PartGroup>();
        const groupOf = (rgba: readonly number[] | undefined): PartGroup => {
            const key = rgba ? rgba.join(",") : "";
            let group = groups.get(key);
            if (!group) {
                group = { rgba, entries: [] };
                groups.set(key, group);
            }
            return group;
        };
        for (const item of ids) {
            const own = itemColour(this.model, this.itemColours, item);
            if (this.model.typeOf(item) === MAPPED_ITEM) {
                this.mappedParts(item).forEach((part) => groupOf(part.rgba ?? own).entries.push({ node: part.node }));
            } else {
                groupOf(own).entries.push({ item });
            }
        }
        const parts = [...groups.values()].map((group) => ({ rgba: group.rgba, node: this.groupNode(representation, group.entries) }));
        this.representations.set(representation, parts);
        return parts;
    }

    item(item: number): number {
        const known = this.items.get(item);
        if (known !== undefined) {
            return known;
        }
        const node = this.convert(item);
        this.items.set(item, node);
        return node;
    }

    private convert(item: number): number {
        const type = this.model.entity(item).type;
        switch (type) {
            case "IfcExtrudedAreaSolid":
                return this.extrusion(item);
            case "IfcBooleanClippingResult":
            case "IfcBooleanResult":
                return this.boolean(item);
            case "IfcMappedItem":
                return this.mapped(item);
            case "IfcTriangulatedFaceSet":
            case "IfcPolygonalFaceSet":
            case "IfcFacetedBrep":
            case "IfcFacetedBrepWithVoids":
            case "IfcFaceBasedSurfaceModel":
            case "IfcShellBasedSurfaceModel":
                return this.meshNode(item, this.meshOf(item));
            default:
                throw new UnsupportedGeometryError(`An ${type} is not supported yet`);
        }
    }

    private placedBy(node: number, placement: number | undefined): number {
        if (placement === undefined) {
            return node;
        }
        const matrix = axesToMatrix(axisPlacementFrame(this.model, placement));
        return isIdentity(matrix) ? node : this.builder.node({ op: "transform", of: node, matrix });
    }

    private extrusion(item: number): number {
        const area = this.model.attribute(item, "SweptArea");
        if (!isReference(area)) {
            throw new UnsupportedGeometryError(`#${item} has no swept area`);
        }
        const region = profileRegion(this.model, area.ref, this.curves);
        const profile = region.kind === "circle"
            ? this.builder.node({ op: "circle", center: region.center, radius: region.radius })
            : this.builder.node({ op: "polygon", points: this.builder.numbers(flat(region.outer)), holes: region.holes.map((hole) => this.builder.numbers(flat(hole))) });
        const direction = directionOf(this.model, this.model.attribute(item, "ExtrudedDirection"), Z_AXIS);
        const depth = this.model.attribute(item, "Depth");
        if (typeof depth !== "number" || !(depth > 0)) {
            throw new UnsupportedGeometryError(`#${item} has no positive depth`);
        }
        const unit = scale3(direction, 1 / length3(direction));
        const solid = this.builder.node({ op: "extrude", profile, direction: unit, depth });
        const position = this.model.attribute(item, "Position");
        return this.placedBy(solid, isReference(position) ? position.ref : undefined);
    }

    private boolean(item: number): number {
        const operator = this.model.attribute(item, "Operator");
        if (!isEnumeration(operator) || operator.enum !== "DIFFERENCE") {
            throw new UnsupportedGeometryError("Only boolean differences are supported yet");
        }
        const first = this.model.attribute(item, "FirstOperand");
        const second = this.model.attribute(item, "SecondOperand");
        if (!isReference(first) || !isReference(second)) {
            throw new UnsupportedGeometryError(`#${item} lacks an operand`);
        }
        return this.builder.node({ op: "difference", of: this.item(first.ref), tools: [this.tool(second.ref)] });
    }

    private tool(operand: number): number {
        switch (this.model.entity(operand).type) {
            case "IfcHalfSpaceSolid":
            case "IfcBoxedHalfSpace":
                return this.builder.node(this.halfSpace(operand));
            case "IfcPolygonalBoundedHalfSpace":
                return this.boundedHalfSpace(operand);
            default:
                return this.item(operand);
        }
    }

    private boundedHalfSpace(solid: number): number {
        const position = this.model.attribute(solid, "Position");
        const boundary = this.model.attribute(solid, "PolygonalBoundary");
        if (!isReference(position) || !isReference(boundary)) {
            throw new UnsupportedGeometryError(`#${solid} lacks its position or its boundary`);
        }
        const outline = wound2(this.curves.outline(boundary.ref), true);
        const profile = this.builder.node({ op: "polygon", points: this.builder.numbers(flat(outline)), holes: [] });
        const prism = this.builder.node({ op: "extrude", profile, direction: Z_AXIS, depth: 2 * this.reach });
        const frame = axisPlacementFrame(this.model, position.ref);
        const placed = this.builder.node({ op: "transform", of: prism, matrix: axesToMatrix({ ...frame, origin: add3(frame.origin, scale3(frame.z, -this.reach)) }) });
        const space = this.halfSpace(solid);
        const outside = this.builder.node({ ...space, normal: scale3(space.normal, -1) });
        return this.builder.node({ op: "difference", of: placed, tools: [outside] });
    }

    private halfSpace(solid: number): Base.RecipeHalfSpaceNode {
        const surface = this.model.attribute(solid, "BaseSurface");
        if (!isReference(surface) || this.model.entity(surface.ref).type !== "IfcPlane") {
            throw new UnsupportedGeometryError("Only half-spaces bounded by a plane are supported yet");
        }
        const position = this.model.attribute(surface.ref, "Position");
        if (!isReference(position)) {
            throw new UnsupportedGeometryError(`#${surface.ref} has no position`);
        }
        const frame = axisPlacementFrame(this.model, position.ref);
        const agreement = this.model.attribute(solid, "AgreementFlag");
        const normal = agreement === true ? scale3(frame.z, -1) : frame.z;
        return { op: "halfSpace", origin: frame.origin, normal };
    }

    private joined(nodes: readonly number[]): number {
        return nodes.length === 1 ? nodes[0]! : this.builder.node({ op: "compound", of: [...nodes] });
    }

    private groupNode(representation: number, entries: readonly PartEntry[]): number {
        const meshes = entries.flatMap((entry) => ("item" in entry && MESH_ITEMS.has(this.model.typeOf(entry.item) ?? "") ? [entry.item] : []));
        if (entries.length > 1 && meshes.length === entries.length) {
            return this.meshNode(representation, concatenated(meshes.map((item) => this.meshOf(item))));
        }
        return this.joined(entries.map((entry) => ("item" in entry ? this.item(entry.item) : entry.node)));
    }

    private mapped(item: number): number {
        return this.joined(this.mappedParts(item).map((part) => part.node));
    }

    private mappedParts(item: number): readonly RecipePart[] {
        const source = this.model.attribute(item, "MappingSource");
        const target = this.model.attribute(item, "MappingTarget");
        if (!isReference(source) || !isReference(target)) {
            throw new UnsupportedGeometryError(`#${item} lacks its source or target`);
        }
        let shared = this.maps.get(source.ref);
        if (shared === undefined) {
            const representation = this.model.attribute(source.ref, "MappedRepresentation");
            if (!isReference(representation)) {
                throw new UnsupportedGeometryError(`#${source.ref} maps no representation`);
            }
            const origin = this.model.attribute(source.ref, "MappingOrigin");
            const placement = isReference(origin) ? origin.ref : undefined;
            shared = this.parts(representation.ref).map((part) => ({ rgba: part.rgba, node: this.placedBy(part.node, placement) }));
            this.maps.set(source.ref, shared);
        }
        const matrix = operatorMatrix(this.model, target.ref);
        return isIdentity(matrix) ? shared : shared.map((part) => ({ rgba: part.rgba, node: this.builder.node({ op: "transform", of: part.node, matrix }) }));
    }

    private meshNode(item: number, mesh: TriangleMesh): number {
        if (!mesh.indices.length) {
            throw new UnsupportedGeometryError(`#${item} holds no faces with an area`);
        }
        return this.builder.node({ op: "triangles", positions: this.builder.numbers(mesh.positions), indices: this.builder.indices(mesh.indices) });
    }

    private meshOf(item: number): TriangleMesh {
        const collector = new MeshCollector(this.model);
        const type = this.model.entity(item).type;
        switch (type) {
            case "IfcTriangulatedFaceSet":
                collector.triangulatedFaces(item);
                break;
            case "IfcPolygonalFaceSet":
                collector.polygonalFaces(item);
                break;
            case "IfcFaceBasedSurfaceModel":
            case "IfcShellBasedSurfaceModel":
                this.surfaceModel(collector, item, type);
                break;
            default:
                this.facetedBrep(collector, item, type);
        }
        return collector.mesh;
    }

    private facetedBrep(collector: MeshCollector, item: number, type: string): void {
        const outer = this.model.attribute(item, "Outer");
        if (!isReference(outer)) {
            throw new UnsupportedGeometryError(`#${item} has no outer shell`);
        }
        collector.shell(outer.ref, OUTWARD);
        const voids = type === "IfcFacetedBrepWithVoids" ? this.model.attribute(item, "Voids") : null;
        for (const shell of (isList(voids) ? voids : []).filter(isReference)) {
            collector.shell(shell.ref, INWARD);
        }
    }

    private surfaceModel(collector: MeshCollector, item: number, type: string): void {
        const sets = this.model.attribute(item, SURFACE_MODEL_FACES[type]!);
        for (const set of (isList(sets) ? sets : []).filter(isReference)) {
            collector.shell(set.ref, this.model.typeOf(set.ref) === CLOSED_SHELL ? OUTWARD : UNORIENTED);
        }
    }
}
