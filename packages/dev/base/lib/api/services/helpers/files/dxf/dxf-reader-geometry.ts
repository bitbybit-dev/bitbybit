import type * as Inputs from "../../../../inputs";
import { bulgeArcOf, principalArcOf } from "../../curves/conic-arcs";
import { pointToWorld, unitOf, vectorToLocal, vectorToWorld, WORLD_AXES } from "../../geometry/frame-axes";
import type { FrameAxes } from "../../geometry/frame-axes";
import { cross3, dot3, length3, scale3 } from "../../geometry/vectors";
import { ocsAxesOf } from "../drawing/drawing-geometry";
import type { ReadConic, ReadPolyline, ReadSegment } from "./dxf-reader-types";
import { SAME_SCALE } from "./dxf-reader.constants";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

export interface PrincipalConic {
    readonly center: Point3;
    readonly normal: Vec3;
    readonly major: Vec3;
    readonly minor: number;
    readonly start: number;
    readonly end: number;
}

export const translation = (offset: Vec3): FrameAxes => ({ ...WORLD_AXES, origin: offset });

export const scaling = (x: number, y: number, z: number): FrameAxes => ({ origin: [0, 0, 0], x: [x, 0, 0], y: [0, y, 0], z: [0, 0, z] });

export const rotationAboutZ = (radians: number): FrameAxes => {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return { origin: [0, 0, 0], x: [cos, sin, 0], y: [-sin, cos, 0], z: [0, 0, 1] };
};

const determinantOf = (map: FrameAxes): number => dot3(map.x, cross3(map.y, map.z));

const isSimilarity = (map: FrameAxes): boolean => {
    const size = length3(map.x);
    const close = (a: number, b: number): boolean => Math.abs(a - b) <= SAME_SCALE * Math.max(1, size * size);
    return close(length3(map.y) * length3(map.y), size * size) && close(length3(map.z) * length3(map.z), size * size)
        && close(dot3(map.x, map.y), 0) && close(dot3(map.y, map.z), 0) && close(dot3(map.z, map.x), 0);
};

export const positiveConic = (conic: ReadConic): ReadConic =>
    conic.sweep >= 0 ? conic : { ...conic, yAxis: scale3(conic.yAxis, -1), start: -conic.start, sweep: -conic.sweep };

export const polylineSegments = (polyline: ReadPolyline): ReadSegment[] => {
    const axes = ocsAxesOf(unitOf(polyline.normal) ?? [0, 0, 1]);
    const spans = polyline.closed ? polyline.points.length : polyline.points.length - 1;
    const segments: ReadSegment[] = [];
    for (let span = 0; span < spans; span++) {
        const start = polyline.points[span]!;
        const end = polyline.points[(span + 1) % polyline.points.length]!;
        const bulge = polyline.bulges[span] ?? 0;
        if (bulge === 0) {
            segments.push({ kind: "line", start, end });
            continue;
        }
        const arc = bulgeArcOf(vectorToLocal(axes, start), vectorToLocal(axes, end), bulge);
        const radius = arc.frame.xAxis[0];
        segments.push(positiveConic({ kind: "conic", center: vectorToWorld(axes, arc.frame.center), xAxis: scale3(axes.x, radius), yAxis: scale3(axes.y, radius), start: arc.start, sweep: arc.sweep }));
    }
    return segments;
};

export const mappedSegments = (map: FrameAxes, segment: ReadSegment): ReadSegment[] => {
    switch (segment.kind) {
        case "line":
            return [{ kind: "line", start: pointToWorld(map, segment.start), end: pointToWorld(map, segment.end) }];
        case "conic":
            return [{ ...segment, center: pointToWorld(map, segment.center), xAxis: vectorToWorld(map, segment.xAxis), yAxis: vectorToWorld(map, segment.yAxis) }];
        case "polyline": {
            if (!isSimilarity(map)) {
                return polylineSegments(segment).flatMap(part => mappedSegments(map, part));
            }
            const normal = unitOf(vectorToWorld(map, segment.normal)) ?? [0, 0, 1];
            return [{ ...segment, points: segment.points.map(point => pointToWorld(map, point)), normal: determinantOf(map) < 0 ? scale3(normal, -1) : normal }];
        }
        case "spline":
            return [{ kind: "spline", curve: { ...segment.curve, points: segment.curve.points.map(point => pointToWorld(map, point)) } }];
        case "fit":
            return [{
                ...segment,
                points: segment.points.map(point => pointToWorld(map, point)),
                startTangent: segment.startTangent === undefined ? undefined : vectorToWorld(map, segment.startTangent),
                endTangent: segment.endTangent === undefined ? undefined : vectorToWorld(map, segment.endTangent),
            }];
    }
};

export const principalConicOf = (conic: ReadConic): PrincipalConic | undefined => {
    const normal = unitOf(cross3(conic.xAxis, conic.yAxis));
    if (normal === undefined) {
        return undefined;
    }
    const principal = principalArcOf({ frame: { center: conic.center, xAxis: conic.xAxis, yAxis: conic.yAxis }, start: conic.start, sweep: conic.sweep });
    return { center: conic.center, normal, major: principal.frame.xAxis, minor: length3(principal.frame.yAxis), start: principal.start, end: principal.start + conic.sweep };
};
