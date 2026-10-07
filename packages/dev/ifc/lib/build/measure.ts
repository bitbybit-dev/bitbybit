import type { Base } from "@bitbybit-dev/base";
import { perimeter2, signedArea2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { length2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import type { BoundPair, Bounds, ExtrudedBody, Linear2, ModelReader, Plane3, ProfileShape } from "./build-types";
import { polylinePoints } from "./curves";
import { directionOf } from "./placement";
import { representationOf } from "./representations";
import { frameOf } from "./solids";
import { placedOnPlan } from "./math";

const UPRIGHT_NORMAL = 1e-9;
const SAME_BOUND = 1e-9;
const MOMENT_DIVISOR = 6;

function numberAt(reader: ModelReader, id: number, attribute: string): number {
    const value = reader.attribute(id, attribute);
    return typeof value === "number" ? value : 0;
}

function curveOutline(reader: ModelReader, curve: IfcValue): Base.Point2[] | undefined {
    return isReference(curve) ? polylinePoints(reader, curve.ref) : undefined;
}

export function profileShape(reader: ModelReader, profile: number): ProfileShape | undefined {
    const type = reader.entity(profile).type;
    if (type === "IfcArbitraryClosedProfileDef" || type === "IfcArbitraryProfileDefWithVoids") {
        const outer = curveOutline(reader, reader.attribute(profile, "OuterCurve"));
        if (outer === undefined) {
            return undefined;
        }
        const inner = type === "IfcArbitraryProfileDefWithVoids" ? reader.attribute(profile, "InnerCurves") : null;
        const holes = (isList(inner) ? inner : []).map((curve) => curveOutline(reader, curve) ?? []);
        const area = Math.abs(signedArea2(outer)) - holes.reduce((sum, hole) => sum + Math.abs(signedArea2(hole)), 0);
        return { area, perimeter: perimeter2(outer), outline: outer };
    }
    if (type === "IfcRectangleProfileDef") {
        const x = numberAt(reader, profile, "XDim");
        const y = numberAt(reader, profile, "YDim");
        const frame = frameOf(reader, reader.attribute(profile, "Position"));
        const corners: Base.Point2[] = [[-x / 2, -y / 2], [x / 2, -y / 2], [x / 2, y / 2], [-x / 2, y / 2]];
        const outline = corners.map((corner) => placedOnPlan(frame, corner));
        return { area: x * y, perimeter: 2 * (x + y), outline };
    }
    if (type === "IfcCircleProfileDef") {
        const radius = numberAt(reader, profile, "Radius");
        return { area: Math.PI * radius * radius, perimeter: 2 * Math.PI * radius, outline: undefined };
    }
    if (type === "IfcIShapeProfileDef") {
        const width = numberAt(reader, profile, "OverallWidth");
        const depth = numberAt(reader, profile, "OverallDepth");
        const web = numberAt(reader, profile, "WebThickness");
        const flange = numberAt(reader, profile, "FlangeThickness");
        return { area: 2 * width * flange + (depth - 2 * flange) * web, perimeter: 2 * (2 * width - web + depth), outline: undefined };
    }
    return undefined;
}

function valueAt(f: Linear2, point: Base.Point2): number {
    return f.a * point[0] + f.b * point[1] + f.c;
}

function minus(f: Linear2, g: Linear2): Linear2 {
    return { a: f.a - g.a, b: f.b - g.b, c: f.c - g.c };
}

function clipped(polygon: readonly Base.Point2[], keep: Linear2): Base.Point2[] {
    const result: Base.Point2[] = [];
    polygon.forEach((point, index) => {
        const next = polygon[(index + 1) % polygon.length]!;
        const here = valueAt(keep, point);
        const there = valueAt(keep, next);
        if (here <= 0) {
            result.push(point);
        }
        if ((here < 0 && there > 0) || (here > 0 && there < 0)) {
            const fraction = here / (here - there);
            result.push([point[0] + (next[0] - point[0]) * fraction, point[1] + (next[1] - point[1]) * fraction]);
        }
    });
    return result;
}

function integral(polygon: readonly Base.Point2[], f: Linear2): number {
    let twiceArea = 0;
    let x = 0;
    let y = 0;
    polygon.forEach((point, index) => {
        const next = polygon[(index + 1) % polygon.length]!;
        const cross = point[0] * next[1] - next[0] * point[1];
        twiceArea += cross;
        x += (point[0] + next[0]) * cross;
        y += (point[1] + next[1]) * cross;
    });
    const signed = (f.a * x + f.b * y) / MOMENT_DIVISOR + (f.c * twiceArea) / 2;
    return twiceArea < 0 ? -signed : signed;
}

function distinct(functions: readonly Linear2[]): Linear2[] {
    const same = (f: Linear2, g: Linear2): boolean => Math.abs(f.a - g.a) <= SAME_BOUND && Math.abs(f.b - g.b) <= SAME_BOUND && Math.abs(f.c - g.c) <= SAME_BOUND;
    return functions.filter((f, index) => functions.findIndex((g) => same(f, g)) === index);
}

function pairs(bounds: Bounds): BoundPair[] {
    const tops = distinct(bounds.tops);
    const bottoms = distinct(bounds.bottoms);
    return tops.flatMap((top, k) => bottoms.map((bottom, m): BoundPair => ({
        top,
        bottom,
        keeps: [
            ...tops.filter((_, j) => j !== k).map((other) => minus(top, other)),
            ...bottoms.filter((_, j) => j !== m).map((other) => minus(other, bottom)),
            minus(bottom, top),
            ...bounds.sides,
        ],
    })));
}

function within(polygon: readonly Base.Point2[], keeps: readonly Linear2[]): Base.Point2[] {
    return keeps.reduce<Base.Point2[]>((region, keep) => (region.length ? clipped(region, keep) : region), [...polygon]);
}

export function volumeBetween(footprint: readonly Base.Point2[], bounds: Bounds): number {
    return pairs(bounds).reduce((sum, { top, bottom, keeps }) => {
        const region = within(footprint, keeps);
        return sum + (region.length > 2 ? integral(region, minus(top, bottom)) : 0);
    }, 0);
}

export function areaWithin(footprint: readonly Base.Point2[], sides: readonly Linear2[]): number {
    const region = within(footprint, sides);
    return region.length > 2 ? integral(region, { a: 0, b: 0, c: 1 }) : 0;
}

export function areaBetween(start: Base.Point2, end: Base.Point2, bounds: Bounds): number {
    const length = length2(subtract2(end, start));
    const at = (f: Linear2, s: number): number => valueAt(f, [start[0] + (end[0] - start[0]) * s, start[1] + (end[1] - start[1]) * s]);
    let low = 0;
    let high = 1;
    for (const side of bounds.sides) {
        const from = at(side, 0);
        const to = at(side, 1);
        if (from === to) {
            high = from > 0 ? low : high;
        } else if (to > from) {
            high = Math.min(high, from / (from - to));
        } else {
            low = Math.max(low, from / (from - to));
        }
    }
    if (!(high > low)) {
        return 0;
    }
    const all = [...bounds.tops, ...bounds.bottoms];
    const breaks = new Set([low, high]);
    all.forEach((f, i) => all.slice(i + 1).forEach((g) => {
        const from = at(f, 0) - at(g, 0);
        const to = at(f, 1) - at(g, 1);
        const crossing = from === to ? Number.NaN : from / (from - to);
        if (crossing > low && crossing < high) {
            breaks.add(crossing);
        }
    }));
    const lowest = (s: number): number => Math.min(...bounds.tops.map((f) => at(f, s)));
    const highest = (s: number): number => Math.max(...bounds.bottoms.map((f) => at(f, s)));
    const height = (s: number): number => Math.max(0, lowest(s) - highest(s));
    const points = [...breaks].sort((a, b) => a - b);
    return points.slice(1).reduce((sum, to, index) => {
        const from = points[index]!;
        return sum + length * (to - from) * (height(from) + height(to)) / 2;
    }, 0);
}

export function withLevels(bounds: Bounds, bottom: number, top: number): Bounds {
    return { tops: [...bounds.tops, { a: 0, b: 0, c: top }], bottoms: [...bounds.bottoms, { a: 0, b: 0, c: bottom }], sides: bounds.sides };
}

export function boundsOf(base: number, top: number, planes: readonly Plane3[]): Bounds {
    const level = (height: number): Linear2 => ({ a: 0, b: 0, c: height });
    const surface = (plane: Plane3): Linear2 => {
        const [x, y, z] = plane.normal;
        return { a: -x / z, b: -y / z, c: plane.origin[2] + (plane.origin[0] * x + plane.origin[1] * y) / z };
    };
    return {
        tops: [level(top), ...planes.filter((plane) => plane.normal[2] > UPRIGHT_NORMAL).map(surface)],
        bottoms: [level(base), ...planes.filter((plane) => plane.normal[2] < -UPRIGHT_NORMAL).map(surface)],
        sides: planes.filter((plane) => Math.abs(plane.normal[2]) <= UPRIGHT_NORMAL).map((plane) => ({
            a: plane.normal[0],
            b: plane.normal[1],
            c: -(plane.origin[0] * plane.normal[0] + plane.origin[1] * plane.normal[1]),
        })),
    };
}

export function extrudedBodyOf(reader: ModelReader, product: number): ExtrudedBody | undefined {
    const body = representationOf(reader, product, "Body");
    const items = body === undefined ? null : reader.attribute(body, "Items");
    const only = isList(items) && items.length === 1 ? items[0] : undefined;
    if (!isReference(only) || reader.entity(only.ref).type !== "IfcExtrudedAreaSolid") {
        return undefined;
    }
    const solid = only.ref;
    const profile = reader.attribute(solid, "SweptArea");
    const depth = reader.attribute(solid, "Depth");
    const shape = isReference(profile) ? profileShape(reader, profile.ref) : undefined;
    const direction = directionOf(reader, reader.attribute(solid, "ExtrudedDirection"), [0, 0, 1]);
    const length = Math.hypot(direction[0], direction[1], direction[2]);
    if (!shape || typeof depth !== "number" || !(length > 0)) {
        return undefined;
    }
    return { solid, frame: frameOf(reader, reader.attribute(solid, "Position")), depth: depth * Math.abs(direction[2]) / length, shape };
}
