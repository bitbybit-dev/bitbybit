import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { cross3, dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import type { Frame3 } from "./build-types";
import { planeFrame } from "./entity-writer";
import { direction2Of, direction3Of, frameFrom } from "./math";
import { errorFrom } from "../__test__/build-setup";

const SEED = 2026;
const RUNS = 3000;
const FRAME_RUNS = 1500;
const NO_DIRECTION = "A direction needs a finite length above zero";
const NO_SQUARE_X = "A frame's X direction has no part square to its Z axis";
const UNIT_SLACK = 4 * Number.EPSILON;
const SQUARE_SLACK = 1e-15;
const KEPT_SINE = 1e-3;
const NEAR_PARALLEL_SINE = 1e-8;
const ROUNDING_SINE = 1e-10;
const HINT_SLACK = 1e-12;
const PLAN_VECTOR_THAT_ONCE_DIFFERED: Base.Vector2 = [2, 13];

const finite = fc.double({ noNaN: true, noDefaultInfinity: true });
const notFinite = fc.constantFrom(Infinity, -Infinity, Number.NaN);
const ordinary = fc.double({ min: -1e3, max: 1e3, noNaN: true }).filter((value) => Math.abs(value) > 1e-3);
const anyPlan = fc.tuple(finite, finite).filter(([x, y]) => x !== 0 || y !== 0);
const anySpatial = fc.tuple(finite, finite, finite).filter(([x, y, z]) => x !== 0 || y !== 0 || z !== 0);
const ordinarySpatial = fc.tuple(ordinary, ordinary, ordinary);
const scale = fc.constantFrom(1e-300, 1e-12, 1, 7.5, 1e12, 1e300);

function scaledToLargest(vector: readonly number[]): number[] {
    const largest = Math.max(...vector.map(Math.abs));
    return vector.map((value) => value / largest);
}

function unit(vector: Base.Vector3): Base.Vector3 {
    const scaled = scaledToLargest(vector);
    const length = Math.hypot(...scaled);
    return [scaled[0]! / length, scaled[1]! / length, scaled[2]! / length];
}

function sineBetween(a: Base.Vector3, b: Base.Vector3): number {
    const across = cross3(unit(a), unit(b));
    return Math.hypot(...across);
}

function isOrthonormalRightHanded(frame: Frame3): boolean {
    const lengths = [frame.x, frame.y, frame.z].map((axis) => Math.abs(dot3(axis, axis) - 1));
    const squares = [dot3(frame.x, frame.y), dot3(frame.y, frame.z), dot3(frame.z, frame.x)].map(Math.abs);
    const turned = cross3(frame.x, frame.y);
    const handedness = Math.hypot(turned[0] - frame.z[0], turned[1] - frame.z[1], turned[2] - frame.z[2]);
    return [...lengths, ...squares, handedness].every((error) => error <= SQUARE_SLACK);
}

function squareTo(z: Base.Vector3): Base.Vector3 {
    const [x, y, w] = z.map(Math.abs) as [number, number, number];
    const across: Base.Vector3 = x <= y && x <= w ? [1, 0, 0] : y <= w ? [0, 1, 0] : [0, 0, 1];
    const along = dot3(across, z);
    return unit([across[0] - along * z[0], across[1] - along * z[1], across[2] - along * z[2]]);
}

describe("direction2Of and direction3Of over every finite vector", () => {
    it("should normalise a plan vector to the same digits as the same vector lying in space, bit for bit", () => {
        // Arrange
        const property = fc.property(anyPlan, ([x, y]) => {
            const plan = direction2Of([x, y]);
            const spatial = direction3Of([x, y, 0]);
            return Object.is(plan[0], spatial[0]) && Object.is(plan[1], spatial[1]);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should normalise the plan vector [2, 13], whose two-argument hypotenuse rounds differently, to the digits of the vector in space", () => {
        // Act
        const plan = direction2Of(PLAN_VECTOR_THAT_ONCE_DIFFERED);
        const spatial = direction3Of([PLAN_VECTOR_THAT_ONCE_DIFFERED[0], PLAN_VECTOR_THAT_ONCE_DIFFERED[1], 0]);

        // Assert
        expect(plan).toEqual([spatial[0], spatial[1]]);
    });

    it("should give a finite direction of length one along every finite vector, the largest and the subnormal included", () => {
        // Arrange
        const property = fc.property(anySpatial, (vector) => {
            const direction = direction3Of(vector);
            const along = scaledToLargest(vector);
            const across = cross3(direction, [along[0]!, along[1]!, along[2]!]);
            return direction.every(Number.isFinite)
                && Math.abs(Math.hypot(...direction) - 1) <= UNIT_SLACK
                && Math.hypot(...across) <= UNIT_SLACK * Math.hypot(...along)
                && dot3(direction, [along[0]!, along[1]!, along[2]!]) > 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should give a plan direction of length one along every finite plan vector", () => {
        // Arrange
        const property = fc.property(anyPlan, (vector) => {
            const direction = direction2Of(vector);
            return direction.every(Number.isFinite) && Math.abs(Math.hypot(...direction) - 1) <= UNIT_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should refuse every vector with an infinite or undefined component, as it refuses one of no length", () => {
        // Arrange
        const spoiled = fc.tuple(finite, finite, finite, notFinite, fc.nat({ max: 2 }));
        const property = fc.property(spoiled, ([x, y, z, bad, at]) => {
            const spatial: Base.Vector3 = [x, y, z];
            spatial[at] = bad;
            const plan: Base.Vector2 = [spatial[0], spatial[1]];
            plan[at % 2] = bad;
            const refusals = [errorFrom(() => direction3Of(spatial)), errorFrom(() => direction2Of(plan))];
            return refusals.every((refusal) => refusal instanceof RangeError && refusal.message === NO_DIRECTION);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("frameFrom over Z axes and X hints of every size", () => {
    it("should square a hint well away from the Z axis into a right-handed orthonormal frame whose X lies in the plane of the hint, on its side", () => {
        // Arrange
        const pairs = fc.tuple(ordinarySpatial, ordinarySpatial, scale, scale).filter(([z, hint]) => sineBetween(z, hint) >= KEPT_SINE);
        const property = fc.property(pairs, ([z, hint, zScale, hintScale]) => {
            const frame = frameFrom([1, 2, 3], [z[0] * zScale, z[1] * zScale, z[2] * zScale], [hint[0] * hintScale, hint[1] * hintScale, hint[2] * hintScale]);
            const expectedX = unit([hint[0] - dot3(hint, unit(z)) * unit(z)[0], hint[1] - dot3(hint, unit(z)) * unit(z)[1], hint[2] - dot3(hint, unit(z)) * unit(z)[2]]);
            return isOrthonormalRightHanded(frame)
                && Math.hypot(frame.z[0] - unit(z)[0], frame.z[1] - unit(z)[1], frame.z[2] - unit(z)[2]) <= SQUARE_SLACK
                && Math.hypot(frame.x[0] - expectedX[0], frame.x[1] - expectedX[1], frame.x[2] - expectedX[2]) <= HINT_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: FRAME_RUNS });
    });

    it("should square a hint close to the Z axis, but not within rounding of it, into a right-handed orthonormal frame on the hint's side", () => {
        // Arrange
        const tilts = fc.double({ min: NEAR_PARALLEL_SINE, max: KEPT_SINE, noNaN: true });
        const property = fc.property(ordinarySpatial, tilts, fc.boolean(), scale, (z, tilt, opposite, hintScale) => {
            const zUnit = unit(z);
            const across = squareTo(zUnit);
            const sign = opposite ? -1 : 1;
            const hint: Base.Vector3 = [0, 1, 2].map((axis) => (sign * zUnit[axis]! + tilt * across[axis]!) * hintScale) as Base.Vector3;
            const frame = frameFrom([0, 0, 0], z, hint);
            return isOrthonormalRightHanded(frame) && dot3(frame.x, across) > 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: FRAME_RUNS });
    });

    it("should refuse every hint within rounding of the Z axis, either way along it, naming the X direction", () => {
        // Arrange
        const tilts = fc.double({ min: -ROUNDING_SINE, max: ROUNDING_SINE, noNaN: true });
        const property = fc.property(ordinarySpatial, tilts, fc.boolean(), scale, (z, tilt, opposite, hintScale) => {
            const zUnit = unit(z);
            const across = squareTo(zUnit);
            const sign = opposite ? -1 : 1;
            const hint: Base.Vector3 = [0, 1, 2].map((axis) => (sign * zUnit[axis]! + tilt * across[axis]!) * hintScale) as Base.Vector3;
            const refusal = errorFrom(() => frameFrom([0, 0, 0], z, hint));
            return refusal instanceof RangeError && refusal.message === NO_SQUARE_X;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: FRAME_RUNS });
    });
});

describe("planeFrame over every normal and hint", () => {
    it("should give a right-handed orthonormal frame along any normal for any hint, one along the normal or of no length included", () => {
        // Arrange
        const hints = fc.oneof(anySpatial, fc.constant<Base.Vector3>([0, 0, 0]));
        const property = fc.property(anySpatial, hints, (normal, hint) => {
            const frame = planeFrame([0, 0, 0], normal, hint);
            const along = unit(normal);
            return isOrthonormalRightHanded(frame) && Math.hypot(frame.z[0] - along[0], frame.z[1] - along[1], frame.z[2] - along[2]) <= SQUARE_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should give a right-handed orthonormal frame when the hint lies along the normal but for rounding, whichever way it points", () => {
        // Arrange
        const tilts = fc.double({ min: -NEAR_PARALLEL_SINE, max: NEAR_PARALLEL_SINE, noNaN: true });
        const property = fc.property(ordinarySpatial, tilts, fc.boolean(), (normal, tilt, opposite) => {
            const along = unit(normal);
            const across = squareTo(along);
            const sign = opposite ? -1 : 1;
            const hint: Base.Vector3 = [0, 1, 2].map((axis) => sign * along[axis]! + tilt * across[axis]!) as Base.Vector3;
            return isOrthonormalRightHanded(planeFrame([0, 0, 0], normal, hint));
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: FRAME_RUNS });
    });
});
