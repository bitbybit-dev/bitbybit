import * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import { BORE_RINGS, SHAFT_RINGS } from "./retaining-rings.constants";
import type { BallBearingDesignation, BallBearingSizes, CompressionSpringPath, CompressionSpringSpec, ParallelKeySizes, RetainingRingKind, RetainingRingSizes } from "./machine-element-types";
import { smoothstep } from "../services/helpers/geometry/scalars";
import { polar2 } from "../services/helpers/geometry/vectors";
import { roundedTo } from "../services/helpers/geometry/scalars";
import { BALL_BEARINGS, MIDPOINT, MOST_ACTIVE_COILS, PARALLEL_KEYS, SMALLEST_KEYED_SHAFT, SMALLEST_SPRING_INDEX, SPRING_CLOSED_RISE, SPRING_EASE, SPRING_END_COILS, SPRING_GRIND_OVERRUN, SPRING_POINTS_PER_COIL, SPRING_ROUNDING_PLACES } from "./machine-elements.constants";

export function ballBearingDesignations(): BallBearingDesignation[] {
    return Object.keys(BALL_BEARINGS) as BallBearingDesignation[];
}

export function ballBearingSizes(designation: BallBearingDesignation): BallBearingSizes {
    const row = BALL_BEARINGS[designation] as BallBearingSizes | undefined;
    if (row === undefined) {
        throw new InputError(`\`designation\` is not one of ${ballBearingDesignations().join(", ")}.`, "designation");
    }
    return { ...row };
}

export function parallelKeySizes(shaftDiameter: number): ParallelKeySizes {
    const row = shaftDiameter > SMALLEST_KEYED_SHAFT ? PARALLEL_KEYS.find(each => shaftDiameter <= each.upTo) : undefined;
    if (row === undefined) {
        throw new InputError(`\`shaftDiameter\` is not more than ${String(SMALLEST_KEYED_SHAFT)} and at most ${String(PARALLEL_KEYS[PARALLEL_KEYS.length - 1]!.upTo)}.`, "shaftDiameter");
    }
    return { width: row.width, height: row.height, shaftDepth: row.shaftDepth, hubDepth: row.hubDepth };
}

export function compressionSpringPath(spec: CompressionSpringSpec): CompressionSpringPath {
    const { wireDiameter, diameter, activeCoils, length } = spec;
    const infinite = Object.entries({ wireDiameter, diameter, activeCoils, length }).find(([, value]) => !Number.isFinite(value));
    if (infinite !== undefined) {
        throw new InputError(`\`${infinite[0]}\` is ${String(infinite[1])}; a spring is made of finite numbers.`, infinite[0]);
    }
    if (!(wireDiameter > 0)) {
        throw new InputError("`wireDiameter` is not more than 0.", "wireDiameter");
    }
    if (!(diameter > SMALLEST_SPRING_INDEX * wireDiameter)) {
        throw new InputError("`diameter`, the outside diameter of the coils, is not more than three times `wireDiameter`.", "diameter");
    }
    if (!(activeCoils > 0)) {
        throw new InputError("`activeCoils` is not more than 0.", "activeCoils");
    }
    if (!(activeCoils <= MOST_ACTIVE_COILS)) {
        throw new InputError(`\`activeCoils\` is more than ${String(MOST_ACTIVE_COILS)}, the most a spring path is drawn for.`, "activeCoils");
    }
    const coils = activeCoils + 2 * SPRING_END_COILS;
    const closedRise = wireDiameter * SPRING_CLOSED_RISE;
    const solidLength = roundedTo(closedRise * coils, SPRING_ROUNDING_PLACES);
    if (!(length >= Math.min(solidLength, closedRise * coils))) {
        throw new InputError(`\`length\` is shorter than the spring's solid length, ${String(solidLength)}, where every coil touches the next.`, "length");
    }
    const pitch = (length - 2 * SPRING_END_COILS * closedRise) / activeCoils;
    const rise = (turn: number): number => {
        const leaving = smoothstep((turn - SPRING_END_COILS + SPRING_EASE) / (2 * SPRING_EASE));
        const arriving = smoothstep((turn - (coils - SPRING_END_COILS) + SPRING_EASE) / (2 * SPRING_EASE));
        return closedRise + (pitch - closedRise) * (leaving - arriving);
    };
    const count = Math.ceil(coils * SPRING_POINTS_PER_COIL);
    const step = coils / count;
    const heights = [0];
    for (let index = 1; index <= count; index++) {
        const middle = (index - MIDPOINT) * step;
        heights.push(heights[index - 1]! + rise(middle) * step);
    }
    const scale = length / heights[count]!;
    const radius = (diameter - wireDiameter) / 2;
    const overrun = Math.ceil(SPRING_GRIND_OVERRUN / step);
    const pointAt = (turn: number, height: number): Inputs.Base.Point3 => [...polar2(radius, 2 * Math.PI * turn), height];
    const before = Array.from({ length: overrun }, (_, index) => pointAt((index - overrun) * step, (index - overrun) * step * closedRise));
    const after = Array.from({ length: overrun }, (_, index) => pointAt(coils + (index + 1) * step, length + (index + 1) * step * closedRise));
    const points = [...before, ...heights.map((height, index) => pointAt(index * step, height * scale)), ...after];
    return { points, pitch, solidLength };
}

const RING_KINDS: readonly RetainingRingKind[] = Object.values(Inputs.Engineering.retainingRingKindEnum);

const ringsOf = (kind: RetainingRingKind): readonly RetainingRingSizes[] => {
    if (!RING_KINDS.includes(kind)) {
        throw new InputError(`\`kind\` is not one of ${RING_KINDS.join(", ")}.`, "kind");
    }
    return kind === "shaft" ? SHAFT_RINGS : BORE_RINGS;
};

export function retainingRingDiameters(kind: RetainingRingKind): number[] {
    return ringsOf(kind).map(row => row.nominal);
}

export function retainingRingSizes(kind: RetainingRingKind, diameter: number): RetainingRingSizes {
    const rows = ringsOf(kind);
    const row = rows.find(candidate => candidate.nominal === diameter);
    if (row === undefined) {
        const standard = kind === "shaft" ? "DIN 471" : "DIN 472";
        const nearest = rows.reduce((best, candidate) => Math.abs(candidate.nominal - diameter) < Math.abs(best.nominal - diameter) ? candidate : best);
        throw new InputError(`\`diameter\` is ${String(diameter)}, a size ${standard} lists no ring for; the nearest is ${String(nearest.nominal)}.`, "diameter");
    }
    return { ...row };
}
