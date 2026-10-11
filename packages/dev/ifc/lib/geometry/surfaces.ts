import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToLocal, pointToWorld, vectorToWorld, type FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { expandedKnots, knotDomain, nurbsSurfacePoint } from "@bitbybit-dev/base/lib/api/services/helpers/nurbs";
import { add3, cross3, dot3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { axisPlacementFrame, directionOf, pointOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import { CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import type { ParametricSurface, ProfilePolyline, SurfaceFit } from "./geometry-types";
import { CLOSED_CURVE_RATIO, FIT_RATIO, POLE_RATIO, PROFILE_DENSITY, FULL_TURN, NEWTON_DAMPING, NEWTON_STEPS, NEWTON_TOLERANCE, SEED_STEPS, SPLINE_STEP } from "./surfaces.constants";

const Z_AXIS: Base.Vector3 = [0, 0, 1];
const NO_PERIODS: readonly [undefined, undefined] = [undefined, undefined];
const noPole = (): undefined => undefined;

function frameOf(model: ModelSnapshot, value: IfcValue): FrameAxes {
    return isReference(value) ? axisPlacementFrame(model, value.ref) : WORLD_AXES;
}

function positive(model: ModelSnapshot, surface: number, name: string): number {
    const value = model.attribute(surface, name);
    if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
        throw new UnsupportedGeometryError(`#${surface} has no ${name} above zero`);
    }
    return value;
}

function polyline(points: readonly Base.Point3[]): ProfilePolyline {
    const lengths = [0];
    for (let at = 1; at < points.length; at++) {
        lengths.push(lengths[at - 1]! + length3(subtract3(points[at]!, points[at - 1]!)));
    }
    const total = lengths[lengths.length - 1]!;
    return { points, lengths, closed: total > 0 && length3(subtract3(points[0]!, points[points.length - 1]!)) <= CLOSED_CURVE_RATIO * total };
}

function pointAlong(line: ProfilePolyline, at: number): Base.Point3 {
    const { points, lengths } = line;
    const total = lengths[lengths.length - 1]!;
    const s = line.closed ? ((at % total) + total) % total : Math.min(Math.max(at, 0), total);
    let segment = 1;
    while (segment < lengths.length - 1 && lengths[segment]! < s) {
        segment++;
    }
    const span = lengths[segment]! - lengths[segment - 1]!;
    const t = span > 0 ? (s - lengths[segment - 1]!) / span : 0;
    return add3(points[segment - 1]!, scale3(subtract3(points[segment]!, points[segment - 1]!), t));
}

function lengthNearest(line: ProfilePolyline, point: Base.Point3, flatten: (point: Base.Point3) => Base.Point3): number {
    let best = 0;
    let bestDistance = Infinity;
    const target = flatten(point);
    for (let at = 1; at < line.points.length; at++) {
        const a = flatten(line.points[at - 1]!);
        const along = subtract3(flatten(line.points[at]!), a);
        const squared = dot3(along, along);
        const t = squared > 0 ? Math.min(1, Math.max(0, dot3(subtract3(target, a), along) / squared)) : 0;
        const d = length3(subtract3(target, add3(a, scale3(along, t))));
        if (d < bestDistance) {
            bestDistance = d;
            best = line.lengths[at - 1]! + t * (line.lengths[at]! - line.lengths[at - 1]!);
        }
    }
    return best;
}

function periodOf(line: ProfilePolyline): number | undefined {
    return line.closed ? line.lengths[line.lengths.length - 1] : undefined;
}

export function plane(frame: FrameAxes): ParametricSurface {
    return {
        periods: NO_PERIODS,
        point: (u, v) => pointToWorld(frame, [u, v, 0]),
        parameters: (point) => {
            const [u, v] = pointToLocal(frame, point);
            return [u, v];
        },
        pole: noPole,
    };
}

function cylinder(frame: FrameAxes, radius: number): ParametricSurface {
    return {
        periods: [FULL_TURN, undefined],
        point: (u, v) => pointToWorld(frame, [radius * Math.cos(u), radius * Math.sin(u), v]),
        parameters: (point) => {
            const [x, y, z] = pointToLocal(frame, point);
            return [Math.atan2(y, x), z];
        },
        pole: noPole,
    };
}

function sphere(frame: FrameAxes, radius: number): ParametricSurface {
    return {
        periods: [FULL_TURN, undefined],
        point: (u, v) => pointToWorld(frame, [radius * Math.cos(v) * Math.cos(u), radius * Math.cos(v) * Math.sin(u), radius * Math.sin(v)]),
        parameters: (point) => {
            const [x, y, z] = pointToLocal(frame, point);
            const across = Math.hypot(x, y);
            return [across <= POLE_RATIO * radius ? Number.NaN : Math.atan2(y, x), Math.atan2(z, across)];
        },
        pole: (axis, side) => (axis === 1 ? (side * Math.PI) / 2 : undefined),
    };
}

function torus(frame: FrameAxes, major: number, minor: number): ParametricSurface {
    return {
        periods: [FULL_TURN, FULL_TURN],
        point: (u, v) => {
            const r = major + minor * Math.cos(v);
            return pointToWorld(frame, [r * Math.cos(u), r * Math.sin(u), minor * Math.sin(v)]);
        },
        parameters: (point) => {
            const [x, y, z] = pointToLocal(frame, point);
            return [Math.atan2(y, x), Math.atan2(z, Math.hypot(x, y) - major)];
        },
        pole: noPole,
    };
}

function revolution(profile: ProfilePolyline, origin: Base.Point3, axis: Base.Vector3): ParametricSurface {
    const offsetOf = (point: Base.Point3): Base.Vector3 => subtract3(point, origin);
    const radialOf = (point: Base.Point3): Base.Vector3 => {
        const offset = offsetOf(point);
        return subtract3(offset, scale3(axis, dot3(offset, axis)));
    };
    const reference = profile.points.map(radialOf).find((radial) => length3(radial) > 0);
    if (reference === undefined) {
        throw new UnsupportedGeometryError("A surface of revolution has its whole profile on its axis");
    }
    const x = scale3(reference, 1 / length3(reference));
    const y = cross3(axis, x);
    const halfPlane = (point: Base.Point3): Base.Point3 => [length3(radialOf(point)), dot3(offsetOf(point), axis), 0];
    const ends = [profile.points[0]!, profile.points[profile.points.length - 1]!].map((point) => length3(radialOf(point)) <= CLOSED_CURVE_RATIO * profile.lengths[profile.lengths.length - 1]!);
    return {
        periods: [periodOf(profile), FULL_TURN],
        point: (u, v) => {
            const [radius, height] = halfPlane(pointAlong(profile, u));
            return add3(origin, add3(scale3(axis, height), add3(scale3(x, radius * Math.cos(v)), scale3(y, radius * Math.sin(v)))));
        },
        parameters: (point) => {
            const radial = radialOf(point);
            const onAxis = length3(radial) <= POLE_RATIO * profile.lengths[profile.lengths.length - 1]!;
            return [lengthNearest(profile, point, halfPlane), onAxis ? Number.NaN : Math.atan2(dot3(radial, y), dot3(radial, x))];
        },
        pole: (along, side) => {
            if (along !== 0) {
                return undefined;
            }
            const end = side > 0 ? 1 : 0;
            return ends[end] ? (side > 0 ? profile.lengths[profile.lengths.length - 1] : 0) : undefined;
        },
    };
}

function extrusion(curve: ProfilePolyline, direction: Base.Vector3): ParametricSurface {
    const flatten = (point: Base.Point3): Base.Point3 => subtract3(point, scale3(direction, dot3(point, direction)));
    return {
        periods: [periodOf(curve), undefined],
        point: (u, v) => add3(pointAlong(curve, u), scale3(direction, v)),
        parameters: (point) => {
            const u = lengthNearest(curve, point, flatten);
            return [u, dot3(subtract3(point, pointAlong(curve, u)), direction)];
        },
        pole: noPole,
    };
}

function splineSurface(model: ModelSnapshot, surface: number, divided: boolean): ParametricSurface {
    const degrees = [model.attribute(surface, "UDegree"), model.attribute(surface, "VDegree")];
    const controls = model.attribute(surface, "ControlPointsList");
    const numbers = (name: string): readonly number[] => {
        const value = model.attribute(surface, name);
        if (!isList(value) || !value.every((item): item is number => typeof item === "number" && Number.isFinite(item))) {
            throw new UnsupportedGeometryError(`#${surface} has no ${name}`);
        }
        return value;
    };
    if (typeof degrees[0] !== "number" || typeof degrees[1] !== "number" || !isList(controls)) {
        throw new UnsupportedGeometryError(`#${surface} is not a B-spline surface it can read`);
    }
    const [uDegree, vDegree] = [degrees[0], degrees[1]];
    const net = controls.map((row) => (isList(row) ? row : []).map((point) => pointOf(model, point)));
    const uKnots = expandedKnots(numbers("UKnots"), numbers("UMultiplicities"));
    const vKnots = expandedKnots(numbers("VKnots"), numbers("VMultiplicities"));
    if (uKnots.length !== net.length + uDegree + 1 || net.some((row) => vKnots.length !== row.length + vDegree + 1)) {
        throw new UnsupportedGeometryError(`#${surface} has knots that do not match its control points`);
    }
    const weightsValue = model.entity(surface).type === "IfcRationalBSplineSurfaceWithKnots" ? model.attribute(surface, "WeightsData") : null;
    const weights = isList(weightsValue) ? weightsValue.map((row) => (isList(row) ? row.map((item) => (typeof item === "number" ? item : 1)) : [])) : undefined;
    if (divided && weights) {
        net.forEach((row, i) => row.forEach((point, j) => {
            row[j] = scale3(point, 1 / (weights[i]?.[j] ?? 1));
        }));
    }
    const [u0, u1] = knotDomain(uDegree, uKnots);
    const [v0, v1] = knotDomain(vDegree, vKnots);
    const closedU = model.attribute(surface, "UClosed") === true;
    const closedV = model.attribute(surface, "VClosed") === true;
    const into = (value: number, low: number, high: number, closed: boolean): number => (closed ? low + ((((value - low) % (high - low)) + (high - low)) % (high - low)) : Math.min(high, Math.max(low, value)));
    const clampU = (u: number): number => into(u, u0, u1, closedU);
    const clampV = (v: number): number => into(v, v0, v1, closedV);
    const point = (u: number, v: number): Base.Point3 => nurbsSurfacePoint([uDegree, vDegree], net, weights, [uKnots, vKnots], clampU(u), clampV(v));
    const corners = net.flat();
    const size = Math.hypot(...[0, 1, 2].map((axis) => Math.max(...corners.map((corner) => corner[axis]!)) - Math.min(...corners.map((corner) => corner[axis]!))));
    const accepted = size * FIT_RATIO;
    const seed = (target: Base.Point3): Base.Point2 => {
        let best: Base.Point2 = [u0, v0];
        let bestDistance = Infinity;
        for (let i = 0; i <= SEED_STEPS; i++) {
            for (let j = 0; j <= SEED_STEPS; j++) {
                const uv: Base.Point2 = [u0 + ((u1 - u0) * i) / SEED_STEPS, v0 + ((v1 - v0) * j) / SEED_STEPS];
                const d = length3(subtract3(point(uv[0], uv[1]), target));
                if (d < bestDistance) {
                    bestDistance = d;
                    best = uv;
                }
            }
        }
        return best;
    };
    return {
        periods: [closedU ? u1 - u0 : undefined, closedV ? v1 - v0 : undefined],
        point,
        parameters: (target, near) => {
            const solved = (from: Base.Point2): SurfaceFit => {
                let [u, v] = [closedU ? from[0] : clampU(from[0]), closedV ? from[1] : clampV(from[1])];
                const [hu, hv] = [(u1 - u0) * SPLINE_STEP, (v1 - v0) * SPLINE_STEP];
                for (let step = 0; step < NEWTON_STEPS; step++) {
                    const here = point(u, v);
                    const [uLow, uHigh] = closedU ? [u - hu, u + hu] : [Math.max(u0, u - hu), Math.min(u1, u + hu)];
                    const [vLow, vHigh] = closedV ? [v - hv, v + hv] : [Math.max(v0, v - hv), Math.min(v1, v + hv)];
                    const su = scale3(subtract3(point(uHigh, v), point(uLow, v)), 1 / (uHigh - uLow));
                    const sv = scale3(subtract3(point(u, vHigh), point(u, vLow)), 1 / (vHigh - vLow));
                    const miss = subtract3(target, here);
                    const [a, b, c] = [dot3(su, su), dot3(su, sv), dot3(sv, sv)];
                    const determinant = a * c - b * b;
                    if (!(Math.abs(determinant) > 0)) {
                        break;
                    }
                    const limitU = (u1 - u0) * NEWTON_DAMPING;
                    const limitV = (v1 - v0) * NEWTON_DAMPING;
                    const du = Math.max(-limitU, Math.min(limitU, (c * dot3(su, miss) - b * dot3(sv, miss)) / determinant));
                    const dv = Math.max(-limitV, Math.min(limitV, (a * dot3(sv, miss) - b * dot3(su, miss)) / determinant));
                    [u, v] = [closedU ? u + du : clampU(u + du), closedV ? v + dv : clampV(v + dv)];
                    if (Math.abs(du) <= NEWTON_TOLERANCE * (u1 - u0) && Math.abs(dv) <= NEWTON_TOLERANCE * (v1 - v0)) {
                        break;
                    }
                }
                return { uv: [u, v], miss: length3(subtract3(point(u, v), target)) };
            };
            let best = near ? solved(near) : undefined;
            if (!best || best.miss > accepted) {
                const seeded = solved(seed(target));
                best = !best || seeded.miss < best.miss ? seeded : best;
            }
            return best.uv;
        },
        pole: (axis, side) => {
            const row = axis === 0 ? net[side > 0 ? net.length - 1 : 0]! : net.map((column) => column[side > 0 ? column.length - 1 : 0]!);
            const collapsed = row.every((point) => length3(subtract3(point, row[0]!)) <= CLOSED_CURVE_RATIO * Math.max(1, length3(row[0]!)));
            if (!collapsed) {
                return undefined;
            }
            if (axis === 0) {
                return side > 0 ? u1 : u0;
            }
            return side > 0 ? v1 : v0;
        },
    };
}

function profileCurve(model: ModelSnapshot, surface: number): ProfilePolyline {
    const profile = model.attribute(surface, "SweptCurve");
    const curve = isReference(profile) ? model.attribute(profile.ref, "Curve") : null;
    if (!isReference(curve)) {
        throw new UnsupportedGeometryError(`#${surface} sweeps no curve`);
    }
    const frame = frameOf(model, model.attribute(surface, "Position"));
    return polyline(new CurveSampler(model, PROFILE_DENSITY).path(curve.ref).map((point) => pointToWorld(frame, point)));
}

export function parametricSurface(model: ModelSnapshot, curves: CurveSampler, surface: number, divided = false): ParametricSurface | undefined {
    const type = model.entity(surface).type;
    switch (type) {
        case "IfcPlane":
            return plane(frameOf(model, model.attribute(surface, "Position")));
        case "IfcCylindricalSurface":
            return cylinder(frameOf(model, model.attribute(surface, "Position")), positive(model, surface, "Radius"));
        case "IfcSphericalSurface":
            return sphere(frameOf(model, model.attribute(surface, "Position")), positive(model, surface, "Radius"));
        case "IfcToroidalSurface":
            return torus(frameOf(model, model.attribute(surface, "Position")), positive(model, surface, "MajorRadius"), positive(model, surface, "MinorRadius"));
        case "IfcSurfaceOfRevolution": {
            const placement = model.attribute(surface, "AxisPosition");
            if (!isReference(placement)) {
                throw new UnsupportedGeometryError(`#${surface} has no axis`);
            }
            const frame = frameOf(model, model.attribute(surface, "Position"));
            const axis = vectorToWorld(frame, directionOf(model, model.attribute(placement.ref, "Axis"), Z_AXIS));
            return revolution(profileCurve(model, surface), pointToWorld(frame, pointOf(model, model.attribute(placement.ref, "Location"))), scale3(axis, 1 / length3(axis)));
        }
        case "IfcSurfaceOfLinearExtrusion": {
            const frame = frameOf(model, model.attribute(surface, "Position"));
            const direction = vectorToWorld(frame, directionOf(model, model.attribute(surface, "ExtrudedDirection"), Z_AXIS));
            return extrusion(profileCurve(model, surface), scale3(direction, 1 / length3(direction)));
        }
        case "IfcBSplineSurfaceWithKnots":
        case "IfcRationalBSplineSurfaceWithKnots":
            return splineSurface(model, surface, divided);
        case "IfcRectangularTrimmedSurface":
        case "IfcCurveBoundedPlane":
        case "IfcCurveBoundedSurface": {
            const basis = model.attribute(surface, "BasisSurface");
            return isReference(basis) ? parametricSurface(model, curves, basis.ref, divided) : undefined;
        }
        default:
            return undefined;
    }
}
