import type * as Inputs from "../../inputs";

type Point3 = Inputs.Base.Point3;
type Homogeneous = [number, number, number, number];

export const expandedKnots = (knots: readonly number[], multiplicities: readonly number[]): number[] =>
    knots.flatMap((knot, at) => Array.from({ length: multiplicities[at] ?? 0 }, () => knot));

export const knotDomain = (degree: number, knots: readonly number[]): [number, number] => [knots[degree]!, knots[knots.length - degree - 1]!];

const spanOf = (degree: number, knots: readonly number[], t: number): number => {
    const last = knots.length - degree - 2;
    if (t >= knots[last + 1]!) {
        return last;
    }
    if (t <= knots[degree]!) {
        return degree;
    }
    let low = degree;
    let high = last + 1;
    while (high - low > 1) {
        const middle = (low + high) >> 1;
        if (t < knots[middle]!) {
            high = middle;
        } else {
            low = middle;
        }
    }
    return low;
};

const deBoor = (degree: number, knots: readonly number[], parameter: number, at: (index: number) => Homogeneous): Homogeneous => {
    const [first, last] = knotDomain(degree, knots);
    const t = Math.min(Math.max(parameter, first), last);
    const span = spanOf(degree, knots, t);
    const points = Array.from({ length: degree + 1 }, (_, j) => at(span - degree + j));
    for (let r = 1; r <= degree; r++) {
        for (let j = degree; j >= r; j--) {
            const left = knots[span - degree + j]!;
            const right = knots[span + 1 + j - r]!;
            const alpha = right === left ? 0 : (t - left) / (right - left);
            const previous = points[j - 1]!;
            const current = points[j]!;
            const keep = 1 - alpha;
            points[j] = [keep * previous[0] + alpha * current[0], keep * previous[1] + alpha * current[1], keep * previous[2] + alpha * current[2], keep * previous[3] + alpha * current[3]];
        }
    }
    return points[degree]!;
};

const lifted = (point: Point3, weight: number): Homogeneous => [point[0] * weight, point[1] * weight, point[2] * weight, weight];

const projected = (point: Homogeneous): Point3 => [point[0] / point[3], point[1] / point[3], point[2] / point[3]];

export const nurbsCurvePoint = (degree: number, points: readonly Point3[], weights: readonly number[] | undefined, knots: readonly number[], t: number): Point3 =>
    projected(deBoor(degree, knots, t, (index) => lifted(points[index]!, weights?.[index] ?? 1)));

export const nurbsSurfacePoint = (
    degrees: readonly [number, number],
    net: readonly (readonly Point3[])[],
    weights: readonly (readonly number[])[] | undefined,
    knots: readonly [readonly number[], readonly number[]],
    u: number,
    v: number,
): Point3 => {
    const [uDegree, vDegree] = degrees;
    const [uKnots, vKnots] = knots;
    const row = (index: number): Homogeneous => deBoor(vDegree, vKnots, v, (column) => lifted(net[index]![column]!, weights?.[index]?.[column] ?? 1));
    return projected(deBoor(uDegree, uKnots, u, row));
};
