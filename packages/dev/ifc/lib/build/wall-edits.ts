import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, composeAxes, pointToWorld, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { length2, length3, subtract2, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { IfcTransaction } from "../model/transaction";
import { isReference, ref } from "../step/values";
import type { Frame3, WallChange, WallGeometry, WallOpeningPlace } from "./build-types";
import { MATERIAL_ASSOCIATION, TYPE_DEFINITION } from "./constants";
import { axisContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { requiredReference } from "./checks";
import { associateNewMaterial, layerSetThickness, layerSetUsage, materialOf } from "./materials";
import { normalize2 } from "./math";
import { carriedWith, carryOpening, openingsOf, readWallOpening } from "./openings";
import { absoluteFrame, axisPlacementFrame, movePlacement, objectPlacementOf } from "./placement";
import { detach, relatingOf } from "./relationships";
import { describeObject } from "./spatial";
import { alignmentOf, axisFrame, layerSetOf, readWall } from "./wall-geometry";
import { joinsOf, offsetFor, regenerateWall, stillMeet } from "./walls";
import { firstItem, replaceRepresentation, representationOf, unwrapClippings } from "./representations";

function movesAny(from: Frame3, to: Frame3, points: readonly Base.Point3[], tolerance: number): boolean {
    return points.some((point) => length3(subtract3(pointToWorld(to, point), pointToWorld(from, point))) > tolerance);
}

function wallFrame(start: Base.Point2, end: Base.Point2, bottom: number): Frame3 {
    const direction = normalize2(subtract2(end, start));
    return {
        origin: [start[0], start[1], bottom],
        x: [direction[0], direction[1], 0],
        y: [-direction[1], direction[0], 0],
        z: [0, 0, 1],
    };
}

function rebasedHalfSpace(tx: IfcTransaction, writer: EntityWriter, halfSpace: number, from: Frame3, to: Frame3): number {
    const type = tx.entity(halfSpace).type;
    const surface = tx.attribute(halfSpace, "BaseSurface");
    if ((type !== "IfcHalfSpaceSolid" && type !== "IfcPolygonalBoundedHalfSpace") || !isReference(surface) || tx.entity(surface.ref).type !== "IfcPlane") {
        throw new Error(`The wall is clipped by an ${type} this library does not move with a wall`);
    }
    const moved = (owner: number): number => writer.placement3(relativeAxes(to, composeAxes(from, axisPlacementFrame(tx, requiredReference(tx, owner, "Position")))));
    const plane = writer.create("IfcPlane", { Position: ref(moved(surface.ref)) });
    const agreement = tx.attribute(halfSpace, "AgreementFlag");
    if (type === "IfcHalfSpaceSolid") {
        return writer.create(type, { BaseSurface: ref(plane), AgreementFlag: agreement });
    }
    return writer.create(type, { BaseSurface: ref(plane), AgreementFlag: agreement, Position: ref(moved(halfSpace)), PolygonalBoundary: tx.attribute(halfSpace, "PolygonalBoundary") });
}

function refuseTypedLayers(tx: IfcTransaction, wall: number): void {
    const type = relatingOf(tx, TYPE_DEFINITION, wall);
    if (type !== undefined && materialOf(tx, type) !== undefined) {
        throw new Error(`${describeObject(tx, wall)} takes its layers from ${describeObject(tx, type)}, so its layer set cannot change on its own`);
    }
}

function placeOpenings(tx: IfcTransaction, before: WallGeometry, after: WallGeometry, moves: boolean, tolerance: number): WallOpeningPlace[] {
    const placement = objectPlacementOf(tx, before.wall);
    const facesMove = Math.abs(after.low - before.low) > tolerance || Math.abs(after.high - before.high) > tolerance;
    const places: WallOpeningPlace[] = [];
    for (const opening of openingsOf(tx, before.wall)) {
        const place = readWallOpening(tx, before, placement, opening, tolerance);
        if ((facesMove && place === undefined) || ((facesMove || moves) && !carriedWith(tx, opening, placement))) {
            throw new Error(`${describeObject(tx, opening)} is not an opening this library can carry with the wall, so the wall cannot change this way`);
        }
        if (place !== undefined && (place.offset < -tolerance || place.offset + place.width > after.length + tolerance)) {
            throw new Error(`${describeObject(tx, opening)}, from ${place.offset} to ${place.offset + place.width} along the wall, would not fit on a wall ${after.length} long; move it first with openings.edit`);
        }
        if (place !== undefined && facesMove) {
            places.push(place);
        }
    }
    return places;
}

export function editWall(tx: IfcTransaction, writer: EntityWriter, wall: number, change: WallChange, tolerance: number, parallelTolerance: number): void {
    const before = readWall(tx, wall);
    if (before.body === undefined) {
        throw new Error(`${describeObject(tx, wall)} has no Body representation, so this library cannot rebuild it`);
    }
    const start = change.start ?? before.start;
    const end = change.end ?? before.end;
    const height = change.height ?? before.height;
    const length = length2(subtract2(end, start));
    if (!(length > tolerance)) {
        throw new Error("A wall's start and end must be apart");
    }
    if (!(height > 0)) {
        throw new Error(`A wall's height must be more than zero, got ${height}`);
    }
    const layerSet = change.layerSet ?? layerSetOf(tx, before);
    const layersChange = layerSet !== layerSetOf(tx, before);
    if (layersChange) {
        refuseTypedLayers(tx, wall);
    }
    const thickness = layerSetThickness(tx, layerSet);
    if (!(thickness > 0)) {
        throw new Error("A wall's layers must add up to more than zero thickness");
    }
    const alignment = change.alignment ?? alignmentOf(before, tolerance);
    const low = alignment === undefined ? before.low : offsetFor(alignment, thickness);
    const axis = axisFrame(before);
    const target = wallFrame(start, end, change.bottom ?? pointToWorld(before.frame, axis.origin)[2]);
    const frame = composeAxes(target, relativeAxes(axis, WORLD_AXES));
    const after: WallGeometry = { ...before, frame, start, end, direction: [target.x[0], target.x[1]], length, low, high: low + thickness, height };
    for (const join of joinsOf(tx, wall)) {
        if (!stillMeet(after, join.mine, readWall(tx, join.other), join.theirs, tolerance, parallelTolerance)) {
            throw new Error(`The change takes ${describeObject(tx, wall)} away from ${describeObject(tx, join.other)}, which it is joined to; disconnect them first with walls.disconnect`);
        }
    }
    const reach = Math.max(before.length, length);
    const top = Math.max(before.height, height);
    const corners = [0, reach].flatMap((along) => [before.low, before.high].flatMap((across) => [0, top].map((up): Base.Point3 => [along, across, up])));
    const moves = movesAny(composeAxes(before.frame, axis), target, corners, tolerance);
    const places = placeOpenings(tx, before, after, moves, tolerance);
    const halfSpaces = unwrapClippings(tx, firstItem(tx, before.body))[1].map((halfSpace) => (moves ? rebasedHalfSpace(tx, writer, halfSpace, before.frame, frame) : halfSpace));

    const placement = objectPlacementOf(tx, wall);
    const parent = tx.attribute(placement, "PlacementRelTo");
    movePlacement(tx, writer, placement, relativeAxes(isReference(parent) ? absoluteFrame(tx, parent.ref) : WORLD_AXES, frame));
    const axisEnd = pointToWorld(axis, [length, 0, 0]);
    const axisCurve = writer.polyCurve2([[axis.origin[0], axis.origin[1]], [axisEnd[0], axisEnd[1]]], false);
    replaceRepresentation(tx, wall, representationOf(tx, wall, "Axis"), writer.shapeRepresentation(axisContext(tx, writer), "Axis", "Curve2D", [axisCurve]));
    if (layersChange || Math.abs(low - before.low) > tolerance) {
        tx.dropIfUnused(detach(tx, MATERIAL_ASSOCIATION, wall));
        associateNewMaterial(tx, writer, [wall], layerSetUsage(writer, layerSet, "AXIS2", "POSITIVE", low));
    }
    places.forEach((place) => carryOpening(tx, writer, place, place, before, after));
    regenerateWall(tx, writer, wall, tolerance, parallelTolerance, { height, base: before.base, halfSpaces });
    for (const join of joinsOf(tx, wall)) {
        if (join.theirs !== "ATPATH") {
            regenerateWall(tx, writer, join.other, tolerance, parallelTolerance);
        }
    }
}

export function disconnectWalls(tx: IfcTransaction, writer: EntityWriter, first: number, second: number, tolerance: number, parallelTolerance: number): void {
    const joins = joinsOf(tx, first).filter((join) => join.other === second);
    if (!joins.length) {
        throw new Error(`${describeObject(tx, first)} and ${describeObject(tx, second)} are not joined`);
    }
    joins.forEach((join) => tx.delete(join.relationship));
    if (joins.some((join) => join.mine !== "ATPATH")) {
        regenerateWall(tx, writer, first, tolerance, parallelTolerance);
    }
    if (joins.some((join) => join.theirs !== "ATPATH")) {
        regenerateWall(tx, writer, second, tolerance, parallelTolerance);
    }
}
