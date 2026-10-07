import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToLocal, vectorToLocal } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { cross2, length2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import * as Inputs from "../api/inputs";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isEnumeration, isReference, ref } from "../step/values";
import type { Meeting, ModelReader, WallBody, WallCuts, WallEnd, WallGeometry, WallJoin, WallSpec } from "./build-types";
import { WALL_CONNECTION, WALL_ENDS } from "./constants";
import { axisContext, bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { associateNewMaterial, layerSetThickness, layerSetUsage } from "./materials";
import type { Line2 } from "./build-types";
import { distanceToLine, normalize2, parameterOnLine } from "./math";
import { objectPlacementOf } from "./placement";
import { containIn, describeObject } from "./spatial";
import { defineByType } from "./type-objects";
import { axisLine, buttCut, endPoint, footprintOf, mitreCut, readWall } from "./wall-geometry";
import { firstItem, replaceRepresentation, unwrapClippings } from "./representations";

const END_NAMES: Readonly<Record<WallEnd, string>> = { ATSTART: "start", ATEND: "end", ATPATH: "length" };

export function offsetFor(alignment: Inputs.IFC.wallAlignmentEnum, thickness: number): number {
    if (alignment === Inputs.IFC.wallAlignmentEnum.left) {
        return 0;
    }
    return alignment === Inputs.IFC.wallAlignmentEnum.right ? -thickness : -thickness / 2;
}

function isWallEnd(value: string): value is WallEnd {
    return (WALL_ENDS as readonly string[]).includes(value);
}

function clippedBody(writer: EntityWriter, solid: number, halfSpaces: readonly number[]): number {
    let item = solid;
    for (const halfSpace of halfSpaces) {
        item = writer.clipping(item, halfSpace);
    }
    return writer.shapeRepresentation(bodyContext(writer.tx, writer), "Body", halfSpaces.length ? "Clipping" : "SweptSolid", [item]);
}

function extrudedBody(writer: EntityWriter, footprint: readonly Base.Point2[], base: number, height: number, halfSpaces: readonly number[]): number {
    const solid = writer.extrusion(writer.profile({ outer: footprint, holes: [] }), { ...WORLD_AXES, origin: [0, 0, base] }, height);
    return clippedBody(writer, solid, halfSpaces);
}

export function createWall(tx: IfcTransaction, writer: EntityWriter, spec: WallSpec, tolerance: number): number {
    const along = subtract2(spec.end, spec.start);
    const length = length2(along);
    if (!(length > tolerance)) {
        throw new Error("A wall's start and end must be apart");
    }
    if (!(spec.height > 0)) {
        throw new Error(`A wall's height must be more than zero, got ${spec.height}`);
    }
    const thickness = layerSetThickness(tx, spec.layerSet);
    if (!(thickness > 0)) {
        throw new Error("A wall's layers must add up to more than zero thickness");
    }
    const direction = normalize2(along);
    const offset = offsetFor(spec.alignment, thickness);
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.storey), {
        origin: [spec.start[0], spec.start[1], spec.baseOffset],
        x: [direction[0], direction[1], 0],
        y: [-direction[1], direction[0], 0],
        z: [0, 0, 1],
    });
    const axis = writer.shapeRepresentation(axisContext(tx, writer), "Axis", "Curve2D", [writer.polyCurve2([[0, 0], [length, 0]], false)]);
    const footprint: Base.Point2[] = [[0, offset], [length, offset], [length, offset + thickness], [0, offset + thickness]];
    const wall = writer.create("IfcWall", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([axis, extrudedBody(writer, footprint, 0, spec.height, [])])),
        PredefinedType: spec.predefinedType === undefined ? null : enumValue(spec.predefinedType),
    });
    containIn(tx, writer, spec.storey, wall);
    associateNewMaterial(tx, writer, [wall], layerSetUsage(writer, spec.layerSet, "AXIS2", "POSITIVE", offset));
    if (spec.wallType !== undefined) {
        defineByType(tx, writer, wall, spec.wallType);
    }
    return wall;
}

export function joinsOf(reader: ModelReader, wall: number): WallJoin[] {
    const joins: WallJoin[] = [];
    for (const user of reader.referencesTo(wall)) {
        if (reader.get(user)?.type !== WALL_CONNECTION) {
            continue;
        }
        const relating = reader.attribute(user, "RelatingElement");
        const related = reader.attribute(user, "RelatedElement");
        const relatingType = reader.attribute(user, "RelatingConnectionType");
        const relatedType = reader.attribute(user, "RelatedConnectionType");
        if (!isReference(relating) || !isReference(related) || !isEnumeration(relatingType) || !isEnumeration(relatedType) || !isWallEnd(relatingType.enum) || !isWallEnd(relatedType.enum)) {
            continue;
        }
        if (relating.ref === wall) {
            joins.push({ mine: relatingType.enum, other: related.ref, theirs: relatedType.enum, relationship: user });
        } else if (related.ref === wall) {
            joins.push({ mine: relatedType.enum, other: relating.ref, theirs: relatingType.enum, relationship: user });
        }
    }
    return joins;
}

function cutsOf(reader: ModelReader, geometry: WallGeometry, tolerance: number, parallelTolerance: number): WallCuts {
    let start: Line2 | undefined;
    let end: Line2 | undefined;
    for (const { mine, other, theirs } of joinsOf(reader, geometry.wall)) {
        if (mine === "ATPATH") {
            continue;
        }
        const otherGeometry = readWall(reader, other);
        const cut = theirs === "ATPATH" ? buttCut(geometry, mine, otherGeometry) : mitreCut(geometry, mine, otherGeometry, theirs, tolerance, parallelTolerance);
        if (mine === "ATSTART") {
            start = cut;
        } else {
            end = cut;
        }
    }
    return { start, end };
}

export function regenerateWall(tx: IfcTransaction, writer: EntityWriter, wall: number, tolerance: number, parallelTolerance: number, body?: WallBody): void {
    const read = readWall(tx, wall);
    const geometry = body === undefined ? read : { ...read, height: body.height, base: body.base };
    const footprint = footprintOf(geometry, cutsOf(tx, geometry, tolerance, parallelTolerance), tolerance, parallelTolerance);
    const halfSpaces = body?.halfSpaces ?? (read.body === undefined ? [] : unwrapClippings(tx, firstItem(tx, read.body))[1]);
    replaceRepresentation(tx, wall, read.body, extrudedBody(writer, footprint, geometry.base, geometry.height, halfSpaces));
}

function overlapHeights(a: WallGeometry, b: WallGeometry, tolerance: number): boolean {
    const bottom = (wall: WallGeometry): number => wall.frame.origin[2] + wall.base;
    return bottom(a) < bottom(b) + b.height - tolerance && bottom(b) < bottom(a) + a.height - tolerance;
}

function cornerGap(a: WallGeometry, aEnd: WallEnd, b: WallGeometry, bEnd: WallEnd): number {
    return length2(subtract2(endPoint(a, aEnd), endPoint(b, bEnd)));
}

function teeGap(stem: WallGeometry, stemEnd: WallEnd, through: WallGeometry, reach: number, tolerance: number, parallelTolerance: number): number | undefined {
    if (!(Math.abs(cross2(stem.direction, through.direction)) > parallelTolerance)) {
        return undefined;
    }
    const point = endPoint(stem, stemEnd);
    const across = distanceToLine(point, axisLine(through));
    const along = parameterOnLine(point, axisLine(through));
    if (across < through.low - reach || across > through.high + reach || along <= tolerance || along >= through.length - tolerance) {
        return undefined;
    }
    return Math.max(0, through.low - across, across - through.high);
}

function reachOf(a: WallGeometry, b: WallGeometry): number {
    return Math.max(a.high - a.low, b.high - b.low);
}

export function stillMeet(a: WallGeometry, aEnd: WallEnd, b: WallGeometry, bEnd: WallEnd, tolerance: number, parallelTolerance: number): boolean {
    const reach = reachOf(a, b);
    if (!overlapHeights(a, b, tolerance)) {
        return false;
    }
    if (aEnd === "ATPATH") {
        return bEnd !== "ATPATH" && teeGap(b, bEnd, a, reach, tolerance, parallelTolerance) !== undefined;
    }
    if (bEnd === "ATPATH") {
        return teeGap(a, aEnd, b, reach, tolerance, parallelTolerance) !== undefined;
    }
    return cornerGap(a, aEnd, b, bEnd) <= reach;
}

function findMeeting(stem: WallGeometry, other: WallGeometry, reach: number, tolerance: number, parallelTolerance: number): Meeting | undefined {
    let corner: Meeting | undefined;
    let tee: Meeting | undefined;
    for (const stemEnd of ["ATSTART", "ATEND"] as const) {
        for (const otherEnd of ["ATSTART", "ATEND"] as const) {
            const gap = cornerGap(stem, stemEnd, other, otherEnd);
            if (gap <= reach && (!corner || gap < corner.gap)) {
                corner = { stemEnd, otherEnd, gap };
            }
        }
        const gap = teeGap(stem, stemEnd, other, reach, tolerance, parallelTolerance);
        if (gap !== undefined && (!tee || gap < tee.gap)) {
            tee = { stemEnd, otherEnd: "ATPATH", gap };
        }
    }
    return corner ?? tee;
}

function refuseJoinedEnd(tx: IfcTransaction, wall: number, end: WallEnd, partner: number): void {
    if (end === "ATPATH") {
        return;
    }
    const taken = joinsOf(tx, wall).find((join) => join.mine === end && join.other !== partner);
    if (taken) {
        throw new Error(`The ${END_NAMES[end]} of ${describeObject(tx, wall)} is already joined to ${describeObject(tx, taken.other)}; a wall end joins one other wall`);
    }
}

export function connectWalls(tx: IfcTransaction, writer: EntityWriter, first: number, second: number, tolerance: number, parallelTolerance: number): void {
    if (first === second) {
        throw new Error("A wall cannot be joined to itself");
    }
    const a = readWall(tx, first);
    const b = readWall(tx, second);
    for (const geometry of [a, b]) {
        if (geometry.body === undefined) {
            throw new Error(`${describeObject(tx, geometry.wall)} has no Body representation, so its height is unknown and it cannot be joined`);
        }
    }
    if (!overlapHeights(a, b, tolerance)) {
        throw new Error("The walls do not meet: they stand at heights that do not overlap");
    }
    const reach = reachOf(a, b);
    const forward = findMeeting(a, b, reach, tolerance, parallelTolerance);
    const backward = findMeeting(b, a, reach, tolerance, parallelTolerance);
    const useBackward = !forward || (forward.otherEnd === "ATPATH" && backward !== undefined && backward.otherEnd !== "ATPATH");
    const meeting = useBackward ? backward : forward;
    if (!meeting) {
        throw new Error("The walls do not meet: neither ends at the other's end or along its length");
    }
    const relating = useBackward ? second : first;
    const related = useBackward ? first : second;
    refuseJoinedEnd(tx, relating, meeting.stemEnd, related);
    refuseJoinedEnd(tx, related, meeting.otherEnd, relating);
    for (const join of joinsOf(tx, first)) {
        if (join.other === second) {
            tx.delete(join.relationship);
        }
    }
    writer.create(WALL_CONNECTION, {
        GlobalId: tx.globalId(undefined),
        RelatingElement: ref(relating),
        RelatedElement: ref(related),
        RelatingPriorities: [],
        RelatedPriorities: [],
        RelatedConnectionType: enumValue(meeting.otherEnd),
        RelatingConnectionType: enumValue(meeting.stemEnd),
    });
    regenerateWall(tx, writer, relating, tolerance, parallelTolerance);
    if (meeting.otherEnd !== "ATPATH") {
        regenerateWall(tx, writer, related, tolerance, parallelTolerance);
    }
}

export function clipWall(tx: IfcTransaction, writer: EntityWriter, wall: number, origin: Base.Point3, normal: Base.Vector3): void {
    const geometry = readWall(tx, wall);
    if (geometry.body === undefined) {
        throw new Error(`${describeObject(tx, wall)} has no body to clip`);
    }
    if (!(Math.hypot(normal[0], normal[1], normal[2]) > 0)) {
        throw new Error("A clipping plane needs a normal of some length");
    }
    const halfSpace = writer.halfSpace(pointToLocal(geometry.frame, origin), vectorToLocal(geometry.frame, normal), [1, 0, 0]);
    const [solid, halfSpaces] = unwrapClippings(tx, firstItem(tx, geometry.body));
    replaceRepresentation(tx, wall, geometry.body, clippedBody(writer, solid, [...halfSpaces, halfSpace]));
}
