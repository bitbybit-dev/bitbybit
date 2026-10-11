import type { Base } from "@bitbybit-dev/base";
import { pointToLocal, vectorToLocal } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { signedArea2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { add2, leftOf2, length2, scale2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import * as Inputs from "../api/inputs";
import { isEnumeration, isReference } from "../step/values";
import type { ModelReader, WallCuts, WallEnd, WallGeometry } from "./build-types";
import { requiredReference } from "./checks";
import { PARALLEL_TOLERANCE, VERTICAL_COSINE } from "./constants";
import { layerSetThickness, materialOf } from "./materials";
import type { Frame3, Line2 } from "./build-types";
import { distanceToLine, intersectLines, normalize2, parameterOnLine, placedOnPlan } from "./math";
import { absoluteFrame, axisPlacementFrame, directionOf, objectPlacementOf } from "./placement";
import { describeObject } from "./spatial";
import { firstItem, representationOf, unwrapClippings } from "./representations";
import { polylinePoints } from "./curves";

function axisPoints(reader: ModelReader, wall: number): [Base.Point2, Base.Point2] {
    const axis = representationOf(reader, wall, "Axis");
    if (axis === undefined) {
        throw new Error(`${describeObject(reader, wall)} has no Axis representation, so it is not a wall this library can edit`);
    }
    const curve = firstItem(reader, axis);
    const points = polylinePoints(reader, curve);
    if (points === undefined) {
        throw new Error(`${describeObject(reader, wall)} has an ${reader.entity(curve).type} axis, which this library does not edit`);
    }
    if (points.length < 2) {
        throw new Error(`${describeObject(reader, wall)} has an axis of fewer than two points`);
    }
    const start = points[0]!;
    const end = points[points.length - 1]!;
    const run = end[0] - start[0];
    if (!(run > 0) || Math.abs(end[1] - start[1]) > run * PARALLEL_TOLERANCE) {
        throw new Error(`${describeObject(reader, wall)} has an axis that does not run along its placement's X axis, so the layers IFC offsets along that placement's Y axis do not lie across it`);
    }
    return [start, end];
}

function layerBounds(reader: ModelReader, wall: number): [number, number, number] {
    const usage = materialOf(reader, wall);
    if (usage === undefined || reader.entity(usage).type !== "IfcMaterialLayerSetUsage") {
        throw new Error(`${describeObject(reader, wall)} has no material layer set usage, so its thickness is unknown`);
    }
    const layerSet = reader.attribute(usage, "ForLayerSet");
    const offset = reader.attribute(usage, "OffsetFromReferenceLine");
    const sense = reader.attribute(usage, "DirectionSense");
    const thickness = isReference(layerSet) ? layerSetThickness(reader, layerSet.ref) : 0;
    const start = typeof offset === "number" ? offset : 0;
    return isEnumeration(sense) && sense.enum === "NEGATIVE" ? [start - thickness, start, usage] : [start, start + thickness, usage];
}

function verticalExtrusion(reader: ModelReader, wall: number, body: number): [number, number] {
    const [solid] = unwrapClippings(reader, firstItem(reader, body));
    const refusal = `${describeObject(reader, wall)} has a body this library does not edit as a wall: `;
    if (reader.entity(solid).type !== "IfcExtrudedAreaSolid") {
        throw new Error(`${refusal}an ${reader.entity(solid).type}, where a plan outline extruded upwards is expected`);
    }
    const depth = reader.attribute(solid, "Depth");
    const position = reader.attribute(solid, "Position");
    const frame: Frame3 | undefined = isReference(position) ? axisPlacementFrame(reader, position.ref) : undefined;
    const direction = directionOf(reader, reader.attribute(solid, "ExtrudedDirection"), [0, 0, 1]);
    const upwards = Math.hypot(direction[0], direction[1], direction[2]);
    if (typeof depth !== "number" || !(depth > 0) || (frame !== undefined && frame.z[2] < VERTICAL_COSINE) || !(direction[2] / upwards >= VERTICAL_COSINE)) {
        throw new Error(`${refusal}its extrusion does not rise straight up from a plan outline`);
    }
    return [depth, frame?.origin[2] ?? 0];
}

export function readWall(reader: ModelReader, wall: number): WallGeometry {
    const frame = absoluteFrame(reader, objectPlacementOf(reader, wall));
    if (frame.z[2] < VERTICAL_COSINE) {
        throw new Error(`${describeObject(reader, wall)} is not upright, so it is not a wall this library can edit`);
    }
    const [localStart, localEnd] = axisPoints(reader, wall);
    const start = placedOnPlan(frame, localStart);
    const end = placedOnPlan(frame, localEnd);
    const [low, high, usage] = layerBounds(reader, wall);
    const body = representationOf(reader, wall, "Body");
    const [height, base] = body === undefined ? [0, 0] : verticalExtrusion(reader, wall, body);
    return { wall, frame, start, end, direction: normalize2(subtract2(end, start)), length: length2(subtract2(end, start)), low, high, height, base, body, usage };
}

export function axisFrame(geometry: WallGeometry): Frame3 {
    const start = pointToLocal(geometry.frame, [geometry.start[0], geometry.start[1], 0]);
    const end = pointToLocal(geometry.frame, [geometry.end[0], geometry.end[1], 0]);
    const direction = normalize2([end[0] - start[0], end[1] - start[1]]);
    return { origin: [start[0], start[1], geometry.base], x: [direction[0], direction[1], 0], y: [-direction[1], direction[0], 0], z: [0, 0, 1] };
}

export function alignmentOf(geometry: WallGeometry, tolerance: number): Inputs.IFC.wallAlignmentEnum | undefined {
    if (Math.abs(geometry.low) <= tolerance) {
        return Inputs.IFC.wallAlignmentEnum.left;
    }
    if (Math.abs(geometry.high) <= tolerance) {
        return Inputs.IFC.wallAlignmentEnum.right;
    }
    return Math.abs(geometry.low + geometry.high) <= tolerance ? Inputs.IFC.wallAlignmentEnum.center : undefined;
}

export function layerSetOf(reader: ModelReader, geometry: WallGeometry): number {
    return requiredReference(reader, geometry.usage, "ForLayerSet");
}

export function sideLine(geometry: WallGeometry, across: number): Line2 {
    return { point: add2(geometry.start, scale2(leftOf2(geometry.direction), across)), direction: geometry.direction };
}

export function axisLine(geometry: WallGeometry): Line2 {
    return { point: geometry.start, direction: geometry.direction };
}

export function endPoint(geometry: WallGeometry, end: WallEnd): Base.Point2 {
    return end === "ATSTART" ? geometry.start : geometry.end;
}

export function mitreCut(wall: WallGeometry, wallEnd: WallEnd, other: WallGeometry, otherEnd: WallEnd, tolerance: number, parallelTolerance: number): Line2 | undefined {
    const sameFlow = wallEnd !== otherEnd;
    const pairs: [number, number][] = sameFlow ? [[wall.high, other.high], [wall.low, other.low]] : [[wall.high, other.low], [wall.low, other.high]];
    const corners = pairs.map(([mine, theirs]) => intersectLines(sideLine(wall, mine), sideLine(other, theirs), parallelTolerance));
    const [first, second] = corners;
    if (!first || !second) {
        return undefined;
    }
    const along = subtract2(second, first);
    if (length2(along) <= tolerance) {
        return undefined;
    }
    return { point: first, direction: normalize2(along) };
}

export function buttCut(stem: WallGeometry, stemEnd: WallEnd, through: WallGeometry): Line2 {
    const far = stemEnd === "ATSTART" ? stem.end : stem.start;
    return sideLine(through, distanceToLine(far, axisLine(through)) >= 0 ? through.high : through.low);
}

export function footprintOf(geometry: WallGeometry, cuts: WallCuts, tolerance: number, parallelTolerance: number): Base.Point2[] {
    const toLocalLine = (line: Line2): Line2 => {
        const point = pointToLocal(geometry.frame, [line.point[0], line.point[1], 0]);
        const direction = vectorToLocal(geometry.frame, [line.direction[0], line.direction[1], 0]);
        return { point: [point[0], point[1]], direction: normalize2([direction[0], direction[1]]) };
    };
    const startLocal = pointToLocal(geometry.frame, [geometry.start[0], geometry.start[1], 0]);
    const endLocal = pointToLocal(geometry.frame, [geometry.end[0], geometry.end[1], 0]);
    const axisDirection = normalize2([endLocal[0] - startLocal[0], endLocal[1] - startLocal[1]]);
    const across = leftOf2(axisDirection);
    const squareAt = (point: Base.Point3): Line2 => ({ point: [point[0], point[1]], direction: across });
    const startCut = cuts.start ? toLocalLine(cuts.start) : squareAt(startLocal);
    const endCut = cuts.end ? toLocalLine(cuts.end) : squareAt(endLocal);
    const side = (offset: number): Line2 => ({ point: add2([startLocal[0], startLocal[1]], scale2(across, offset)), direction: axisDirection });
    const corner = (line: Line2, cut: Line2, fallback: Line2): Base.Point2 => intersectLines(line, cut, parallelTolerance) ?? intersectLines(line, fallback, parallelTolerance)!;
    const low = side(geometry.low);
    const high = side(geometry.high);
    const outline = [
        corner(low, startCut, squareAt(startLocal)),
        corner(low, endCut, squareAt(endLocal)),
        corner(high, endCut, squareAt(endLocal)),
        corner(high, startCut, squareAt(startLocal)),
    ];
    const lowSpan = parameterOnLine(outline[1]!, low) - parameterOnLine(outline[0]!, low);
    const highSpan = parameterOnLine(outline[2]!, high) - parameterOnLine(outline[3]!, high);
    if (!(lowSpan > tolerance) || !(highSpan > tolerance) || !(signedArea2(outline) > 0)) {
        throw new Error(`The joins of wall #${geometry.wall} leave it with no length on one face; it is too short for the walls it meets`);
    }
    return outline;
}

export function readableWall(reader: ModelReader, wall: number): WallGeometry | undefined {
    try {
        return readWall(reader, wall);
    } catch {
        return undefined;
    }
}
