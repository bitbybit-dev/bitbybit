import type { Base } from "@bitbybit-dev/base";
import { dot3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { IfcAttributes } from "../model/model-types";
import type { IfcTransaction } from "../model/transaction";
import type { IfcValue } from "../step/step-types";
import { enumValue, ref } from "../step/values";
import type { Outline2 } from "./build-types";
import type { Frame3 } from "./build-types";
import { frameFrom, normalize3 } from "./math";

const AXIS_TOLERANCE = 1e-12;

function isUnit(vector: Base.Vector3, axis: number): boolean {
    return vector.every((value, index) => Math.abs(value - (index === axis ? 1 : 0)) <= AXIS_TOLERANCE);
}

function coordinates(values: readonly number[]): IfcValue[] {
    return values.map((value) => (Object.is(value, -0) ? 0 : value));
}

export class EntityWriter {
    readonly tx: IfcTransaction;

    constructor(tx: IfcTransaction) {
        this.tx = tx;
    }

    create(type: string, attributes: IfcAttributes = {}): number {
        return this.tx.create(type, attributes);
    }

    point(point: Base.Point2 | Base.Point3): number {
        return this.create("IfcCartesianPoint", { Coordinates: coordinates(point) });
    }

    direction(vector: Base.Vector2 | Base.Vector3): number {
        return this.create("IfcDirection", { DirectionRatios: coordinates(vector) });
    }

    placement3(frame: Frame3): number {
        const standardAxes = isUnit(frame.z, 2) && isUnit(frame.x, 0);
        return this.create("IfcAxis2Placement3D", {
            Location: ref(this.point(frame.origin)),
            Axis: standardAxes ? null : ref(this.direction(frame.z)),
            RefDirection: standardAxes ? null : ref(this.direction(frame.x)),
        });
    }

    placement2(origin: Base.Point2, xAxis?: Base.Vector2): number {
        return this.create("IfcAxis2Placement2D", {
            Location: ref(this.point(origin)),
            RefDirection: xAxis === undefined ? null : ref(this.direction(xAxis)),
        });
    }

    localPlacement(relativeTo: number | undefined, frame: Frame3): number {
        return this.create("IfcLocalPlacement", {
            PlacementRelTo: relativeTo === undefined ? null : ref(relativeTo),
            RelativePlacement: ref(this.placement3(frame)),
        });
    }

    polyCurve2(points: readonly Base.Point2[], closed: boolean): number {
        const list = this.create("IfcCartesianPointList2D", { CoordList: points.map((point) => coordinates(point)) });
        const indices = points.map((_, index) => index + 1);
        return this.create("IfcIndexedPolyCurve", {
            Points: ref(list),
            Segments: [{ type: "IfcLineIndex", value: closed ? [...indices, 1] : indices }],
            SelfIntersect: false,
        });
    }

    profile(outline: Outline2, name?: string): number {
        const outer = ref(this.polyCurve2(outline.outer, true));
        if (!outline.holes.length) {
            return this.create("IfcArbitraryClosedProfileDef", { ProfileType: enumValue("AREA"), ProfileName: name ?? null, OuterCurve: outer });
        }
        return this.create("IfcArbitraryProfileDefWithVoids", {
            ProfileType: enumValue("AREA"),
            ProfileName: name ?? null,
            OuterCurve: outer,
            InnerCurves: outline.holes.map((hole) => ref(this.polyCurve2(hole, true))),
        });
    }

    extrusion(profile: number, position: Frame3, depth: number, direction: Base.Vector3 = [0, 0, 1]): number {
        return this.create("IfcExtrudedAreaSolid", {
            SweptArea: ref(profile),
            Position: ref(this.placement3(position)),
            ExtrudedDirection: ref(this.direction(direction)),
            Depth: depth,
        });
    }

    shapeRepresentation(context: number, identifier: string, type: string, items: readonly number[]): number {
        return this.create("IfcShapeRepresentation", {
            ContextOfItems: ref(context),
            RepresentationIdentifier: identifier,
            RepresentationType: type,
            Items: items.map(ref),
        });
    }

    productShape(representations: readonly number[]): number {
        return this.create("IfcProductDefinitionShape", { Representations: representations.map(ref) });
    }

    halfSpace(origin: Base.Point3, normal: Base.Vector3, xHint: Base.Vector3): number {
        const plane = this.create("IfcPlane", { Position: ref(this.placement3(planeFrame(origin, normal, xHint))) });
        return this.create("IfcHalfSpaceSolid", { BaseSurface: ref(plane), AgreementFlag: false });
    }

    clipping(first: number, second: number): number {
        return this.create("IfcBooleanClippingResult", { Operator: enumValue("DIFFERENCE"), FirstOperand: ref(first), SecondOperand: ref(second) });
    }
}

export function planeFrame(origin: Base.Point3, normal: Base.Vector3, xHint: Base.Vector3): Frame3 {
    const z = normalize3(normal);
    const projected = subtract3(xHint, scale3(z, dot3(xHint, z)));
    const fallback: Base.Vector3 = Math.abs(z[0]) < Math.abs(z[1]) ? [1, 0, 0] : [0, 1, 0];
    return frameFrom(origin, z, length3(projected) > AXIS_TOLERANCE ? projected : fallback);
}
