import type { Base } from "@bitbybit-dev/base";
import { composeAxes, pointToLocal, pointToWorld, relativeAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, isList, isReference, ref } from "../step/values";
import { FILLING, OPENING_MARGIN_RATIO, VOIDING } from "./constants";
import type { Frame3, ModelReader, OpeningChange, WallGeometry, WallOpening, WallOpeningPlace, WallOpeningSpec } from "./build-types";
import type { EntityWriter } from "./entity-writer";
import { movePlacement, objectPlacementOf, parentPlacementOf, relativeFrame } from "./placement";
import { relatingOf } from "./relationships";
import { describeObject } from "./spatial";
import { bodyContext } from "./contexts";
import { extrusionCorners } from "./solids";
import { axisFrame, readWall } from "./wall-geometry";
import { replaceRepresentation, representationOf } from "./representations";

const OPENING = "IfcOpeningElement";
const WALL = "IfcWall";

export function openingMargin(thickness: number): number {
    return thickness * OPENING_MARGIN_RATIO;
}

export function openingBody(tx: IfcTransaction, writer: EntityWriter, width: number, height: number, depth: number): number {
    const profile = writer.create("IfcRectangleProfileDef", {
        ProfileType: enumValue("AREA"),
        Position: ref(writer.placement2([width / 2, height / 2])),
        XDim: width,
        YDim: height,
    });
    const solid = writer.extrusion(profile, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1], z: [0, -1, 0] }, depth);
    return writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
}

function frameAt(wall: WallGeometry, offset: number, sill: number, across: number): Frame3 {
    const axis = axisFrame(wall);
    return { ...axis, origin: pointToWorld(axis, [offset, across, sill]) };
}

function openingFrame(wall: WallGeometry, offset: number, sill: number): Frame3 {
    return frameAt(wall, offset, sill, wall.high + openingMargin(wall.high - wall.low));
}

function middleFrame(wall: WallGeometry, offset: number, sill: number): Frame3 {
    return frameAt(wall, offset, sill, (wall.low + wall.high) / 2);
}

function requireFit(wall: WallGeometry, offset: number, width: number, height: number, tolerance: number): void {
    if (!(width > 0) || !(height > 0)) {
        throw new Error(`An opening needs a width and a height of more than zero, got ${width} by ${height}`);
    }
    if (offset < -tolerance || offset + width > wall.length + tolerance) {
        throw new Error(`The opening from ${offset} to ${offset + width} does not fit along the wall, which is ${wall.length} long`);
    }
}

export function createWallOpening(tx: IfcTransaction, writer: EntityWriter, spec: WallOpeningSpec, tolerance: number): WallOpening {
    const wall = readWall(tx, spec.wall);
    requireFit(wall, spec.offset, spec.width, spec.height, tolerance);
    const thickness = wall.high - wall.low;
    const margin = openingMargin(thickness);
    const placement = writer.localPlacement(objectPlacementOf(tx, spec.wall), openingFrame(wall, spec.offset, spec.sill));
    const opening = writer.create("IfcOpeningElement", {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name ?? null,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([openingBody(tx, writer, spec.width, spec.height, thickness + 2 * margin)])),
        PredefinedType: enumValue("OPENING"),
    });
    writer.create(VOIDING.relationship, { GlobalId: tx.globalId(undefined), [VOIDING.relating]: ref(spec.wall), [VOIDING.related]: ref(opening) });
    return { opening, placement, wallFace: -(thickness + margin), thickness };
}

export function openingsOf(reader: ModelReader, element: number): number[] {
    return reader.referencesTo(element).flatMap((user) => {
        const relating = reader.get(user)?.type === VOIDING.relationship ? reader.attribute(user, VOIDING.relating) : null;
        const opening = isReference(relating) && relating.ref === element ? reader.attribute(user, VOIDING.related) : null;
        return isReference(opening) ? [opening.ref] : [];
    });
}

export function fillingsOf(reader: ModelReader, opening: number): number[] {
    return reader.referencesTo(opening).flatMap((user) => {
        const relating = reader.get(user)?.type === FILLING.relationship ? reader.attribute(user, FILLING.relating) : null;
        const filling = isReference(relating) && relating.ref === opening ? reader.attribute(user, FILLING.related) : null;
        return isReference(filling) ? [filling.ref] : [];
    });
}

function bodyCorners(reader: ModelReader, opening: number): Base.Point3[] {
    const body = representationOf(reader, opening, "Body");
    const items = body === undefined ? null : reader.attribute(body, "Items");
    const only = isList(items) && items.length === 1 ? items[0] : undefined;
    return isReference(only) ? extrusionCorners(reader, only.ref) : [];
}

function spanOf(values: readonly number[], tolerance: number): [number, number] | undefined {
    const low = Math.min(...values);
    const high = Math.max(...values);
    return values.every((value) => Math.abs(value - low) <= tolerance || Math.abs(value - high) <= tolerance) ? [low, high] : undefined;
}

export function readWallOpening(reader: ModelReader, wall: WallGeometry, wallPlacement: number, opening: number, tolerance: number): WallOpeningPlace | undefined {
    if (parentPlacementOf(reader, opening) !== wallPlacement) {
        return undefined;
    }
    const placement = objectPlacementOf(reader, opening);
    const axis = axisFrame(wall);
    const frame = relativeFrame(reader, placement);
    const local = bodyCorners(reader, opening).map((corner) => pointToLocal(axis, pointToWorld(frame, corner)));
    const along = spanOf(local.map((point) => point[0]), tolerance);
    const across = spanOf(local.map((point) => point[1]), tolerance);
    const up = spanOf(local.map((point) => point[2]), tolerance);
    if (!local.length || !along || !across || !up || across[0] > wall.low + tolerance || across[1] < wall.high - tolerance) {
        return undefined;
    }
    return { opening, placement, offset: along[0], sill: up[0], width: along[1] - along[0], height: up[1] - up[0] };
}

export function carriedWith(reader: ModelReader, opening: number, wallPlacement: number): boolean {
    if (parentPlacementOf(reader, opening) !== wallPlacement) {
        return false;
    }
    const own = objectPlacementOf(reader, opening);
    return fillingsOf(reader, opening).every((filling) => {
        const parent = parentPlacementOf(reader, filling);
        return parent === own || parent === wallPlacement;
    });
}

export function carryOpening(tx: IfcTransaction, writer: EntityWriter, place: WallOpeningPlace, next: WallOpeningPlace, before: WallGeometry, after: WallGeometry): void {
    const thickness = after.high - after.low;
    const from = relativeFrame(tx, place.placement);
    const to = openingFrame(after, next.offset, next.sill);
    const fromMiddle = middleFrame(before, place.offset, place.sill);
    const toMiddle = middleFrame(after, next.offset, next.sill);
    movePlacement(tx, writer, place.placement, to);
    replaceRepresentation(tx, place.opening, representationOf(tx, place.opening, "Body"), openingBody(tx, writer, next.width, next.height, thickness + 2 * openingMargin(thickness)));
    for (const filling of fillingsOf(tx, place.opening).filter((placed) => objectPlacementOf(tx, placed) !== place.placement)) {
        const placement = objectPlacementOf(tx, filling);
        const onOpening = parentPlacementOf(tx, filling) === place.placement;
        const inWall = composeAxes(toMiddle, relativeAxes(fromMiddle, onOpening ? composeAxes(from, relativeFrame(tx, placement)) : relativeFrame(tx, placement)));
        movePlacement(tx, writer, placement, onOpening ? relativeAxes(to, inWall) : inWall);
    }
}

function openingOf(reader: ModelReader, element: number): number {
    if (reader.schema.isSubtypeOf(reader.entity(element).type, OPENING)) {
        return element;
    }
    const opening = relatingOf(reader, FILLING, element);
    if (opening === undefined) {
        throw new Error(`${describeObject(reader, element)} is neither an opening nor a door or window in one`);
    }
    return opening;
}

export function editWallOpening(tx: IfcTransaction, writer: EntityWriter, element: number, change: OpeningChange, tolerance: number): void {
    const opening = openingOf(tx, element);
    const host = relatingOf(tx, VOIDING, opening);
    if (host === undefined || !tx.schema.isSubtypeOf(tx.entity(host).type, WALL)) {
        throw new Error(`${describeObject(tx, opening)} is not an opening in a wall`);
    }
    const wall = readWall(tx, host);
    const wallPlacement = objectPlacementOf(tx, host);
    const place = readWallOpening(tx, wall, wallPlacement, opening, tolerance);
    if (place === undefined || !carriedWith(tx, opening, wallPlacement)) {
        throw new Error(`${describeObject(tx, opening)} is not an opening this library can move`);
    }
    if (fillingsOf(tx, opening).length && (change.width !== undefined || change.height !== undefined)) {
        throw new Error(`${describeObject(tx, opening)} takes its size from the door or window in it`);
    }
    const next = { ...place, offset: change.offset ?? place.offset, sill: change.sill ?? place.sill, width: change.width ?? place.width, height: change.height ?? place.height };
    requireFit(wall, next.offset, next.width, next.height, tolerance);
    carryOpening(tx, writer, place, next, wall, wall);
}
