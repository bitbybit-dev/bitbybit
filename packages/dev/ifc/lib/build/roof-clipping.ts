import type { Base } from "@bitbybit-dev/base";
import { composeAxes, vectorToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { add2, dot3, scale2, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { IfcTransaction } from "../model/transaction";
import { isReference } from "../step/values";
import type { ModelReader, Plane3, WallGeometry } from "./build-types";
import { AGGREGATION, VERTICAL_COSINE } from "./constants";
import type { EntityWriter } from "./entity-writer";
import { normalize3 } from "./math";
import { absoluteFrame, axisPlacementFrame, directionOf, objectPlacementOf } from "./placement";
import { relatedOf } from "./relationships";
import { firstItem, representationOf, unwrapClippings } from "./representations";
import { frameOf } from "./solids";
import { describeObject } from "./spatial";
import { readWall, sideLine } from "./wall-geometry";
import { clipWall } from "./walls";

function undersideOf(reader: ModelReader, part: number): Plane3 {
    const body = representationOf(reader, part, "Body");
    const [solid] = body === undefined ? [undefined] : unwrapClippings(reader, firstItem(reader, body));
    if (solid === undefined || reader.entity(solid).type !== "IfcExtrudedAreaSolid") {
        throw new Error(`${describeObject(reader, part)} has no body this library clips with: an outline extruded through the roof is expected`);
    }
    const frame = composeAxes(absoluteFrame(reader, objectPlacementOf(reader, part)), frameOf(reader, reader.attribute(solid, "Position")));
    if (Math.abs(frame.z[2]) < 1 - VERTICAL_COSINE) {
        throw new Error(`${describeObject(reader, part)} stands upright, so it is no roof plane to clip with`);
    }
    const up = frame.z[2] > 0 ? frame.z : scale3(frame.z, -1);
    const depth = reader.attribute(solid, "Depth");
    const through = vectorToWorld(frame, normalize3(directionOf(reader, reader.attribute(solid, "ExtrudedDirection"), [0, 0, 1])));
    const far = scale3(through, typeof depth === "number" ? depth : 0);
    const farPoint: Base.Point3 = [frame.origin[0] + far[0], frame.origin[1] + far[1], frame.origin[2] + far[2]];
    return { origin: dot3(farPoint, up) < dot3(frame.origin, up) ? farPoint : frame.origin, normal: up };
}

function heightAt(plane: Plane3, point: Base.Point2): number {
    const [x, y, z] = plane.normal;
    return plane.origin[2] - ((point[0] - plane.origin[0]) * x + (point[1] - plane.origin[1]) * y) / z;
}

function footprintCorners(wall: WallGeometry): Base.Point2[] {
    return [wall.low, wall.high].flatMap((across) => {
        const side = sideLine(wall, across);
        return [side.point, add2(side.point, scale2(side.direction, wall.length))];
    });
}

export function clippingPlanes(reader: ModelReader, wall: WallGeometry, body: number): Plane3[] {
    return unwrapClippings(reader, firstItem(reader, body))[1].flatMap((halfSpace) => {
        const surface = reader.attribute(halfSpace, "BaseSurface");
        const position = isReference(surface) && reader.entity(surface.ref).type === "IfcPlane" ? reader.attribute(surface.ref, "Position") : null;
        if (!isReference(position)) {
            return [];
        }
        const frame = composeAxes(wall.frame, axisPlacementFrame(reader, position.ref));
        return [{ origin: frame.origin, normal: reader.attribute(halfSpace, "AgreementFlag") === true ? scale3(frame.z, -1) : frame.z }];
    });
}

function samePlane(a: Plane3, b: Plane3, tolerance: number): boolean {
    const offset = (plane: Plane3): number => dot3(plane.origin, plane.normal);
    return dot3(a.normal, b.normal) >= VERTICAL_COSINE && Math.abs(offset(a) - offset(b)) <= tolerance;
}

export function clipWallByRoof(tx: IfcTransaction, writer: EntityWriter, wall: number, roof: number, tolerance: number): void {
    const parts = relatedOf(tx, AGGREGATION, roof);
    if (!parts.length) {
        throw new Error(`${describeObject(tx, roof)} has no parts to clip a wall with`);
    }
    const geometry = readWall(tx, wall);
    if (geometry.body === undefined) {
        throw new Error(`${describeObject(tx, wall)} has no body to clip`);
    }
    const bottom = geometry.frame.origin[2] + geometry.base;
    const top = bottom + geometry.height;
    const corners = footprintCorners(geometry);
    const existing = clippingPlanes(tx, geometry, geometry.body);
    for (const part of parts) {
        const plane = undersideOf(tx, part);
        const heights = corners.map((corner) => heightAt(plane, corner));
        if (heights.every((height) => height <= bottom + tolerance)) {
            throw new Error(`The underside of ${describeObject(tx, part)} is below the bottom of ${describeObject(tx, wall)}, so clipping by it would leave nothing of the wall`);
        }
        if (heights.some((height) => height < top - tolerance) && !existing.some((known) => samePlane(known, plane, tolerance))) {
            clipWall(tx, writer, wall, plane.origin, plane.normal);
            existing.push(plane);
        }
    }
}
