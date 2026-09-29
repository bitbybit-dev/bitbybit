import { describe, it, expect } from "vitest";
import { Frame } from "./frame";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Vector } from "./vector";
import { InputError } from "../kernel-calls";
import * as Inputs from "../inputs";

type Frame3 = Inputs.Base.Frame;

const geometryHelper = new GeometryHelper();
const math = new MathBitByBit();
const frames = new Frame(new Vector(math, geometryHelper), math, geometryHelper);

const loose = <T>(value: unknown): T => value as T;

const expectVector = (received: readonly number[], expected: readonly number[]): void => {
    expect(received).toHaveLength(expected.length);
    received.forEach((value, i) => expect(value).toBeCloseTo(expected[i]!, 9));
};

const expectFrame = (received: Frame3, expected: Frame3): void => {
    expectVector(received.origin, expected.origin);
    expectVector(received.normal, expected.normal);
    expectVector(received.direction, expected.direction);
};

const thrownBy = (action: () => unknown): InputError => {
    try {
        action();
    } catch (error) {
        expect(error).toBeInstanceOf(InputError);
        return error as InputError;
    }
    throw new Error("expected an InputError, but nothing was thrown");
};

const frameOf = (origin: Inputs.Base.Point3, normal: Inputs.Base.Vector3, direction: Inputs.Base.Vector3): Frame3 => ({ origin, normal, direction });

const dotOf = (a: readonly number[], b: readonly number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;

const largestOf = (vector: readonly number[]): number => vector.reduce((best, value) => Math.abs(value) > Math.abs(best) ? value : best, 0);

const turned = (points: Inputs.Base.Point3[], aboutY: number, aboutZ: number): Inputs.Base.Point3[] => {
    const [y, z] = [aboutY * Math.PI / 180, aboutZ * Math.PI / 180];
    return points.map(([px, py, pz]) => {
        const x1 = px * Math.cos(y) + pz * Math.sin(y);
        const z1 = -px * Math.sin(y) + pz * Math.cos(y);
        return [x1 * Math.cos(z) - py * Math.sin(z), x1 * Math.sin(z) + py * Math.cos(z), z1];
    });
};

const tilted = (): Frame3 => frames.rotate({ frame: frames.rotate({ frame: frames.create({ origin: [1, -2, 3], normal: [0, 1, 1], direction: [1, 0, 0] }), axis: Inputs.Frame.frameAxisEnum.z, angle: 20 }), axis: Inputs.Frame.frameAxisEnum.x, angle: -35 });

const unitVector = (vector: readonly number[]): Inputs.Base.Vector3 => {
    const length = Math.hypot(vector[0]!, vector[1]!, vector[2]!);
    return [vector[0]! / length, vector[1]! / length, vector[2]! / length];
};

const jittered = (points: Inputs.Base.Point3[], seed: number, size: number): Inputs.Base.Point3[] => {
    let state = seed;
    const next = (): number => {
        state = (state * 16807) % 2147483647;
        return (state / 2147483647 - 0.5) * 2 * size;
    };
    return points.map(([x, y, z]) => [x + next(), y + next(), z + next()]);
};

const regularPolygon = (sides: number, radius: number): Inputs.Base.Point3[] =>
    Array.from({ length: sides }, (_, i) => [radius * Math.cos(2 * Math.PI * i / sides), radius * Math.sin(2 * Math.PI * i / sides), 0]);

const firstOfLargest = (vector: readonly number[]): number => {
    let largest = 0;
    for (let i = 1; i < 3; i++) {
        if (Math.abs(vector[i]!) > Math.abs(vector[largest]!) + 1e-12) {
            largest = i;
        }
    }
    return vector[largest]!;
};

describe("Frame", () => {

    describe("create", () => {
        it("should square a rough direction onto the plane and scale both axes to length 1", () => {
            // Act
            const frame = frames.create({ origin: [1, 2, 3], normal: [0, 0, 5], direction: [2, 0, 7] });

            // Assert
            expectFrame(frame, frameOf([1, 2, 3], [0, 0, 1], [1, 0, 0]));
        });

        it("should give the world frame from the defaults", () => {
            // Act
            const frame = frames.create({});

            // Assert
            expectFrame(frame, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should refuse a normal of zero length, naming it", () => {
            // Act
            const error = thrownBy(() => frames.create({ normal: [0, 0, 0] }));

            // Assert
            expect(error.property).toBe("normal");
        });

        it("should refuse a direction along the normal, naming it", () => {
            // Act
            const error = thrownBy(() => frames.create({ normal: [0, 0, 1], direction: [0, 0, -3] }));

            // Assert
            expect(error.property).toBe("direction");
        });

        it("should refuse an origin that is not three numbers", () => {
            // Act
            const error = thrownBy(() => frames.create({ origin: loose<Inputs.Base.Point3>([1, 2]) }));

            // Assert
            expect(error.property).toBe("origin");
        });

        it("should refuse a normal that is not three finite numbers", () => {
            // Act
            const error = thrownBy(() => frames.create({ normal: [0, Number.NaN, 1] }));

            // Assert
            expect(error.property).toBe("normal");
        });
    });

    describe("create at the edges of precision", () => {
        const normal: Inputs.Base.Vector3 = [1, 2, 3];
        const across = unitVector([2, -1, 0]);
        const leaning = (sine: number): Inputs.Base.Vector3 => {
            const along = unitVector(normal);
            return [along[0] + sine * across[0], along[1] + sine * across[1], along[2] + sine * across[2]];
        };

        it("should square a direction leaning three billionths of a radian off the normal to full precision", () => {
            // Act
            const frame = frames.create({ normal, direction: leaning(3e-9) });

            // Assert
            expect(Math.abs(dotOf(frame.normal, frame.direction))).toBeLessThan(1e-15);
            frame.direction.forEach((value, i) => expect(value).toBeCloseTo(across[i]!, 6));
        });

        it("should refuse a direction within a billionth of a radian of the normal", () => {
            // Act
            const error = thrownBy(() => frames.create({ normal, direction: leaning(5e-10) }));

            // Assert
            expect(error.property).toBe("direction");
        });

        it.each([
            { normal: [0, 0, 1e155] as Inputs.Base.Vector3, direction: [1, 0, 0] as Inputs.Base.Vector3 },
            { normal: [0, 0, 1] as Inputs.Base.Vector3, direction: [1e200, 0, 1e199] as Inputs.Base.Vector3 },
            { normal: [0, 0, 1e-200] as Inputs.Base.Vector3, direction: [3e-310, 0, 0] as Inputs.Base.Vector3 },
        ])("should read a normal $normal and a direction $direction of any finite size", ({ normal: huge, direction }) => {
            // Act
            const frame = frames.create({ normal: huge, direction });

            // Assert
            expectFrame(frame, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });
    });

    describe("world and the named planes", () => {
        it("should give the world frame as new arrays on every call", () => {
            // Arrange
            const first = frames.world();

            // Act
            first.origin[0] = 99;
            const second = frames.world();

            // Assert
            expectFrame(second, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should lay xy along the world X and Y with its normal along Z", () => {
            // Act
            const frame = frames.xy({ origin: [0, 0, 2] });

            // Assert
            expectFrame(frame, frameOf([0, 0, 2], [0, 0, 1], [1, 0, 0]));
            expectVector(frames.yDirection({ frame }), [0, 1, 0]);
        });

        it("should lay yz along the world Y and Z with its normal along X", () => {
            // Act
            const frame = frames.yz({ origin: [3, 0, 0] });

            // Assert
            expectFrame(frame, frameOf([3, 0, 0], [1, 0, 0], [0, 1, 0]));
            expectVector(frames.yDirection({ frame }), [0, 0, 1]);
        });

        it("should lay zx on the ground with its normal up the world Y", () => {
            // Act
            const frame = frames.zx({ origin: [1, 0, 1] });

            // Assert
            expectFrame(frame, frameOf([1, 0, 1], [0, 1, 0], [0, 0, 1]));
            expectVector(frames.yDirection({ frame }), [1, 0, 0]);
        });

        it("should place the named planes at the origin by default", () => {
            // Act
            const frame = frames.zx({});

            // Assert
            expectVector(frame.origin, [0, 0, 0]);
        });
    });

    describe("fromThreePoints", () => {
        it("should run the X axis toward the second point and the Y axis toward the third", () => {
            // Act
            const frame = frames.fromThreePoints({ origin: [1, 1, 1], xPoint: [4, 1, 1], planePoint: [3, 1, -2] });

            // Assert
            expectFrame(frame, frameOf([1, 1, 1], [0, 1, 0], [1, 0, 0]));
            expectVector(frames.yDirection({ frame }), [0, 0, -1]);
        });

        it("should refuse an X point at the origin", () => {
            // Act
            const error = thrownBy(() => frames.fromThreePoints({ origin: [1, 1, 1], xPoint: [1, 1, 1], planePoint: [0, 0, 0] }));

            // Assert
            expect(error.property).toBe("xPoint");
        });

        it("should refuse three points on one line", () => {
            // Act
            const error = thrownBy(() => frames.fromThreePoints({ origin: [0, 0, 0], xPoint: [1, 1, 1], planePoint: [3, 3, 3] }));

            // Assert
            expect(error.property).toBe("planePoint");
        });

        it("should refuse a plane point within a billionth of a radian of the X line, as create refuses such a direction", () => {
            // Act
            const error = thrownBy(() => frames.fromThreePoints({ origin: [0, 0, 0], xPoint: [1, 0, 0], planePoint: [1, 1e-10, 0] }));

            // Assert
            expect(error.property).toBe("planePoint");
        });

        it("should build a frame from points far apart without overflowing", () => {
            // Act
            const frame = frames.fromThreePoints({ origin: [0, 0, 0], xPoint: [1e200, 0, 0], planePoint: [0, 1e200, 0] });

            // Assert
            expectFrame(frame, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });
    });

    describe("fromPointAndNormal", () => {
        it.each([
            { normal: [0, 0, 1] as Inputs.Base.Vector3, direction: [1, 0, 0] },
            { normal: [0, 0, -1] as Inputs.Base.Vector3, direction: [-1, 0, 0] },
            { normal: [0, 1, 0] as Inputs.Base.Vector3, direction: [0, 0, 1] },
            { normal: [1, 0, 0] as Inputs.Base.Vector3, direction: [0, 0, 1] },
            { normal: [-1, 0, 0] as Inputs.Base.Vector3, direction: [0, 0, -1] },
            { normal: [0, -2, 1] as Inputs.Base.Vector3, direction: [0, -1 / Math.sqrt(5), -2 / Math.sqrt(5)] },
            { normal: [0, 1, 2] as Inputs.Base.Vector3, direction: [0, 2 / Math.sqrt(5), -1 / Math.sqrt(5)] },
            { normal: [1, 2, 3] as Inputs.Base.Vector3, direction: [0, 3 / Math.sqrt(13), -2 / Math.sqrt(13)] },
            { normal: [3, 2, 1] as Inputs.Base.Vector3, direction: [-2 / Math.sqrt(13), 3 / Math.sqrt(13), 0] },
            { normal: [2, 3, 1] as Inputs.Base.Vector3, direction: [3 / Math.sqrt(13), -2 / Math.sqrt(13), 0] },
            { normal: [3, 1, 2] as Inputs.Base.Vector3, direction: [-2 / Math.sqrt(13), 0, 3 / Math.sqrt(13)] },
        ])("should choose the X axis $direction for the normal $normal", ({ normal, direction }) => {
            // Act
            const frame = frames.fromPointAndNormal({ origin: [5, 6, 7], normal });

            // Assert
            expectVector(frame.direction, direction);
            expectVector(frame.origin, [5, 6, 7]);
        });

        it("should refuse a normal of zero length", () => {
            // Act
            const error = thrownBy(() => frames.fromPointAndNormal({ normal: [0, 0, 0] }));

            // Assert
            expect(error.property).toBe("normal");
        });
    });

    describe("bestFit", () => {
        it("should sit at the average, face by the right-hand rule and run along the widest spread toward the first point", () => {
            // Act
            const frame = frames.bestFit({ points: [[0, 0, 0], [4, 0, 0], [4, 2, 0], [0, 2, 0]] });

            // Assert
            expectFrame(frame, frameOf([2, 1, 0], [0, 0, 1], [-1, 0, 0]));
        });

        it("should keep the widest axis as it is when the first point already lies along it", () => {
            // Act
            const frame = frames.bestFit({ points: [[4, 0, 0], [4, 2, 0], [0, 2, 0], [0, 0, 0]] });

            // Assert
            expectFrame(frame, frameOf([2, 1, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should turn the normal over when the points run the other way", () => {
            // Act
            const frame = frames.bestFit({ points: [[0, 2, 0], [4, 2, 0], [4, 0, 0], [0, 0, 0]] });

            // Assert
            expectFrame(frame, frameOf([2, 1, 0], [0, 0, -1], [-1, 0, 0]));
        });

        it("should find a tilted plane through points laid out in it", () => {
            // Arrange
            const plane = tilted();
            const points = frames.pointsToWorld({ frame: plane, points: [[-3, -1, 0], [3, -1, 0], [3, 1, 0], [-3, 1, 0]] });

            // Act
            const frame = frames.bestFit({ points });

            // Assert
            expectVector(frame.origin, plane.origin);
            expectVector(frame.normal, plane.normal);
            expectVector(frame.direction, frames.vectorToWorld({ frame: plane, vector: [-1, 0, 0] }));
        });

        it("should decide the normal by its largest component when the points turn both ways", () => {
            // Act
            const frame = frames.bestFit({ points: [[0, 0, 0], [2, 2, 0], [2, 0, 0], [0, 2, 0]] });

            // Assert
            expectVector(frame.normal, [0, 0, 1]);
            expect(Math.abs(frame.direction[2])).toBeCloseTo(0, 9);
        });

        it("should decide the direction by its largest component when the first point lies across the spread", () => {
            // Act
            const frame = frames.bestFit({ points: [[0, -1, 0], [2, -1, 0], [2, 1, 0], [0, 1, 0], [-2, 1, 0], [-2, -1, 0]] });

            // Assert
            expectFrame(frame, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should turn a tie-broken direction so that its largest component is positive", () => {
            // Arrange
            const points = turned([[0, -1, 0], [2, -1, 0], [2, 1, 0], [0, 1, 0], [-2, 1, 0], [-2, -1, 0]], 138, 145);
            const widest = turned([[1, 0, 0]], 138, 145)[0]!;

            // Act
            const frame = frames.bestFit({ points });

            // Assert
            expect(largestOf(frame.direction)).toBeGreaterThan(0);
            expect(Math.abs(dotOf(frame.direction, widest))).toBeCloseTo(1, 9);
        });

        it("should turn a tie-broken normal so that its largest component is positive", () => {
            // Arrange
            const points = turned([[0, 0, 0], [2, 2, 0], [2, 0, 0], [0, 2, 0]], 46, 145);
            const up = turned([[0, 0, 1]], 46, 145)[0]!;

            // Act
            const frame = frames.bestFit({ points });

            // Assert
            expect(firstOfLargest(frame.normal)).toBeGreaterThan(0);
            expect(Math.abs(dotOf(frame.normal, up))).toBeCloseTo(1, 9);
        });

        it("should refuse fewer than three points", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: [[0, 0, 0], [1, 0, 0]] }));

            // Assert
            expect(error.property).toBe("points");
        });

        it.each([
            { sides: 4, seed: 11 },
            { sides: 6, seed: 23 },
            { sides: 12, seed: 37 },
        ])("should point X at the first point of a regular $sides-gon, whose spread is the same every way, whatever the rounding", ({ sides, seed }) => {
            // Arrange
            const plane = tilted();
            const points = jittered(frames.pointsToWorld({ frame: plane, points: regularPolygon(sides, 3) }), seed, 1e-12);

            // Act
            const frame = frames.bestFit({ points });

            // Assert
            expectVector(frame.normal, plane.normal);
            expectVector(frame.direction, plane.direction);
        });

        it("should point X at the next point when the first sits on the center of an even spread", () => {
            // Arrange
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [0, 2, 0], [-2, 0, 0], [0, -2, 0], [2, 0, 0]];

            // Act
            const frame = frames.bestFit({ points });

            // Assert
            expectFrame(frame, frameOf([0, 0, 0], [0, 0, 1], [0, 1, 0]));
        });

        it("should keep the widest spread when it is wider by more than a millionth", () => {
            // Act
            const frame = frames.bestFit({ points: [[1, 1, 0], [-1, 1, 0], [-1, -1, 0], [1, -1, 0]].map(([x, y, z]) => [x! * 1.00001, y!, z!] as Inputs.Base.Point3) });

            // Assert
            expectVector(frame.direction, [1, 0, 0]);
        });

        it.each([1e200, 1e-200])("should fit points spread over %s as it fits the same points at unit size", (size) => {
            // Arrange
            const unit: Inputs.Base.Point3[] = [[0, 0, 0], [4, 0.1, 0], [4, 3, 0.1], [0, 3, 0]];
            const expected = frames.bestFit({ points: unit });

            // Act
            const frame = frames.bestFit({ points: unit.map(([x, y, z]) => [x * size, y * size, z * size]) });

            // Assert
            expectVector(frame.normal, expected.normal);
            expectVector(frame.direction, expected.direction);
            expectVector(frame.origin.map(value => value / size), expected.origin);
        });

        it("should decide a bow-tie's normal the same way under any rounding noise", () => {
            // Arrange
            const leaning = frames.create({ normal: [1, -1, 0], direction: [0, 0, 1] });
            const bowTie = frames.pointsToWorld({ frame: leaning, points: [[0, 0, 0], [2, 2, 0], [2, 0, 0], [0, 2, 0]] });

            // Act
            const normals = Array.from({ length: 40 }, (_, seed) => frames.bestFit({ points: jittered(bowTie, seed + 1, 1e-13) }).normal);

            // Assert
            normals.forEach(normal => {
                expect(firstOfLargest(normal)).toBeGreaterThan(0);
                expectVector(normal, normals[0]!);
            });
        });

        it("should refuse a rectangle ten million times longer than it is wide, and fit one a hundred thousand times longer", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: [[0, 0, 0], [1000, 0, 0], [1000, 1e-4, 0], [0, 1e-4, 0]] }));
            const frame = frames.bestFit({ points: [[0, 0, 0], [1000, 0, 0], [1000, 1e-2, 0], [0, 1e-2, 0]] });

            // Assert
            expect(error.property).toBe("points");
            expect(error.message).toContain("a millionth");
            expectVector(frame.normal, [0, 0, 1]);
        });

        it("should refuse points on one line", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [5, 5, 5]] }));

            // Assert
            expect(error.property).toBe("points");
            expect(error.message).toContain("one line");
        });

        it("should refuse points that all coincide", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }));

            // Assert
            expect(error.property).toBe("points");
        });

        it("should name the position of an entry that is not a point", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: loose<Inputs.Base.Point3[]>([[0, 0, 0], [1, 0, 0], [1, 2], [0, 1, 0]]) }));

            // Assert
            expect(error.property).toBe("points");
            expect(error.message).toContain("position 2");
        });

        it("should refuse points that are not a list", () => {
            // Act
            const error = thrownBy(() => frames.bestFit({ points: loose<Inputs.Base.Point3[]>("points") }));

            // Assert
            expect(error.property).toBe("points");
        });
    });

    describe("reading a frame", () => {
        it("should read squared unit axes from a rough frame", () => {
            // Arrange
            const frame = frameOf([1, 2, 3], [0, 0, 2], [3, 0, 1]);

            // Act
            const read = [frames.origin({ frame }), frames.normal({ frame }), frames.direction({ frame }), frames.yDirection({ frame })];

            // Assert
            expectVector(read[0]!, [1, 2, 3]);
            expectVector(read[1]!, [0, 0, 1]);
            expectVector(read[2]!, [1, 0, 0]);
            expectVector(read[3]!, [0, 1, 0]);
        });

        it("should hand back new arrays rather than the frame's own", () => {
            // Arrange
            const frame = frameOf([1, 2, 3], [0, 0, 1], [1, 0, 0]);

            // Act
            const origin = frames.origin({ frame });

            // Assert
            expect(origin).not.toBe(frame.origin);
        });

        it.each([
            { frame: loose<Frame3>(undefined), reason: "missing" },
            { frame: loose<Frame3>([1, 2, 3]), reason: "a list" },
            { frame: loose<Frame3>({ origin: [0, 0, 0], normal: [0, 0, 1] }), reason: "without a direction" },
            { frame: frameOf([0, 0, 0], [0, 0, 0], [1, 0, 0]), reason: "with a normal of zero length" },
            { frame: frameOf([0, 0, 0], [0, 1, 0], [0, 2, 0]), reason: "with its direction along its normal" },
        ])("should refuse a frame $reason, naming the input", ({ frame }) => {
            // Act
            const error = thrownBy(() => frames.normal({ frame }));

            // Assert
            expect(error.property).toBe("frame");
        });
    });

    describe("changing a frame", () => {
        it("should move a frame by a vector and keep its axes", () => {
            // Act
            const moved = frames.translate({ frame: frames.zx({ origin: [1, 1, 1] }), translation: [2, 0, -1] });

            // Assert
            expectFrame(moved, frameOf([3, 1, 0], [0, 1, 0], [0, 0, 1]));
        });

        it("should refuse a translation that is not three numbers", () => {
            // Act
            const error = thrownBy(() => frames.translate({ frame: frames.world(), translation: loose<Inputs.Base.Vector3>([1, 2]) }));

            // Assert
            expect(error.property).toBe("translation");
        });

        it("should move a frame along its own normal, either way", () => {
            // Arrange
            const ground = frames.zx({ origin: [0, 0, 0] });

            // Act
            const up = frames.offset({ frame: ground, distance: 3 });
            const down = frames.offset({ frame: ground, distance: -2 });

            // Assert
            expectFrame(up, frameOf([0, 3, 0], [0, 1, 0], [0, 0, 1]));
            expectVector(down.origin, [0, -2, 0]);
        });

        it("should refuse a distance that is not a finite number", () => {
            // Act
            const error = thrownBy(() => frames.offset({ frame: frames.world(), distance: Number.POSITIVE_INFINITY }));

            // Assert
            expect(error.property).toBe("distance");
        });

        it.each([
            { axis: Inputs.Frame.frameAxisEnum.z, normal: [0, 0, 1], direction: [0, 1, 0] },
            { axis: Inputs.Frame.frameAxisEnum.x, normal: [0, -1, 0], direction: [1, 0, 0] },
            { axis: Inputs.Frame.frameAxisEnum.y, normal: [1, 0, 0], direction: [0, 0, -1] },
        ])("should turn the world frame a quarter turn about its own $axis axis by the right-hand rule", ({ axis, normal, direction }) => {
            // Act
            const turned = frames.rotate({ frame: frames.translate({ frame: frames.world(), translation: [1, 2, 3] }), axis, angle: 90 });

            // Assert
            expectVector(turned.origin, [1, 2, 3]);
            expectVector(turned.normal, normal);
            expectVector(turned.direction, direction);
        });

        it("should turn about the frame's own axis rather than the world's", () => {
            // Arrange
            const ground = frames.zx({ origin: [0, 0, 0] });

            // Act
            const turned = frames.rotate({ frame: ground, axis: Inputs.Frame.frameAxisEnum.z, angle: 90 });

            // Assert
            expectFrame(turned, frameOf([0, 0, 0], [0, 1, 0], [1, 0, 0]));
        });

        it("should turn about the normal a quarter turn by default", () => {
            // Act
            const turned = frames.rotate({ frame: frames.world() });

            // Assert
            expectVector(turned.direction, [0, 1, 0]);
        });

        it("should refuse an axis that is not x, y or z", () => {
            // Act
            const error = thrownBy(() => frames.rotate({ frame: frames.world(), axis: loose<Inputs.Frame.frameAxisEnum>("X"), angle: 30 }));

            // Assert
            expect(error.property).toBe("axis");
        });

        it("should turn a frame over, keeping its origin and X axis", () => {
            // Arrange
            const frame = frames.zx({ origin: [1, 2, 3] });

            // Act
            const flipped = frames.flip({ frame });

            // Assert
            expectFrame(flipped, frameOf([1, 2, 3], [0, -1, 0], [0, 0, 1]));
            expectVector(frames.yDirection({ frame: flipped }), [-1, 0, 0]);
        });
    });

    describe("frames within frames", () => {
        it("should place a child given in the parent's coordinates into the world", () => {
            // Arrange
            const parent = frames.zx({ origin: [0, 1, 0] });

            // Act
            const child = frames.frameToWorld({ parent, child: frames.xy({ origin: [2, 3, 4] }) });

            // Assert
            expectFrame(child, frameOf([3, 5, 2], [0, 1, 0], [0, 0, 1]));
        });

        it("should turn a child's axes by the parent's", () => {
            // Arrange
            const parent = frames.zx({ origin: [0, 0, 0] });

            // Act
            const child = frames.frameToWorld({ parent, child: frames.yz({ origin: [0, 0, 0] }) });

            // Assert
            expectFrame(child, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should give back the child it was handed when converted there and back", () => {
            // Arrange
            const parent = tilted();
            const child = frames.rotate({ frame: frames.create({ origin: [4, -1, 2], normal: [1, 1, 0], direction: [0, 0, 1] }), axis: Inputs.Frame.frameAxisEnum.y, angle: 15 });

            // Act
            const back = frames.frameToLocal({ parent, child: frames.frameToWorld({ parent, child }) });

            // Assert
            expectFrame(back, child);
        });

        it("should nest the same whichever pair is joined first", () => {
            // Arrange
            const a = tilted();
            const b = frames.rotate({ frame: frames.yz({ origin: [1, 2, 0] }), axis: Inputs.Frame.frameAxisEnum.x, angle: 40 });
            const c = frames.offset({ frame: frames.rotate({ frame: frames.world(), axis: Inputs.Frame.frameAxisEnum.y, angle: 70 }), distance: 2 });

            // Act
            const innerFirst = frames.frameToWorld({ parent: a, child: frames.frameToWorld({ parent: b, child: c }) });
            const outerFirst = frames.frameToWorld({ parent: frames.frameToWorld({ parent: a, child: b }), child: c });

            // Assert
            expectFrame(innerFirst, outerFirst);
        });

        it("should describe the world frame from inside a parent", () => {
            // Arrange
            const parent = frames.zx({ origin: [0, 1, 0] });

            // Act
            const world = frames.frameToLocal({ parent, child: frames.world() });

            // Assert
            expectFrame(world, frameOf([0, 0, -1], [1, 0, 0], [0, 1, 0]));
        });

        it("should name the parent or the child when one is not a frame", () => {
            // Act
            const parentError = thrownBy(() => frames.frameToWorld({ parent: loose<Frame3>({}), child: frames.world() }));
            const childError = thrownBy(() => frames.frameToLocal({ parent: frames.world(), child: loose<Frame3>(null) }));

            // Assert
            expect(parentError.property).toBe("parent");
            expect(childError.property).toBe("child");
        });
    });

    describe("many frames at once", () => {
        const several = (): Frame3[] => [tilted(), frames.world(), frames.zx({ origin: [3, 0, -1] }), frames.flip({ frame: frames.yz({ origin: [0, 2, 5] }) })];

        it.each([
            {
                name: "translateFrames",
                many: (list: Frame3[]): Frame3[] => frames.translateFrames({ frames: list, translation: [1, -2, 0.5] }),
                one: (frame: Frame3): Frame3 => frames.translate({ frame, translation: [1, -2, 0.5] }),
            },
            {
                name: "offsetFrames",
                many: (list: Frame3[]): Frame3[] => frames.offsetFrames({ frames: list, distance: -1.5 }),
                one: (frame: Frame3): Frame3 => frames.offset({ frame, distance: -1.5 }),
            },
            {
                name: "rotateFrames",
                many: (list: Frame3[]): Frame3[] => frames.rotateFrames({ frames: list, axis: Inputs.Frame.frameAxisEnum.y, angle: 37 }),
                one: (frame: Frame3): Frame3 => frames.rotate({ frame, axis: Inputs.Frame.frameAxisEnum.y, angle: 37 }),
            },
            {
                name: "flipFrames",
                many: (list: Frame3[]): Frame3[] => frames.flipFrames({ frames: list }),
                one: (frame: Frame3): Frame3 => frames.flip({ frame }),
            },
            {
                name: "framesToWorld",
                many: (list: Frame3[]): Frame3[] => frames.framesToWorld({ parent: tilted(), children: list }),
                one: (frame: Frame3): Frame3 => frames.frameToWorld({ parent: tilted(), child: frame }),
            },
            {
                name: "framesToLocal",
                many: (list: Frame3[]): Frame3[] => frames.framesToLocal({ parent: tilted(), children: list }),
                one: (frame: Frame3): Frame3 => frames.frameToLocal({ parent: tilted(), child: frame }),
            },
        ])("$name should give what the single method gives each frame, in order", ({ many, one }) => {
            // Arrange
            const list = several();

            // Act
            const results = many(list);

            // Assert
            expect(results).toEqual(list.map(one));
        });

        it("should move each frame along its own normal, so frames facing apart move apart", () => {
            // Arrange
            const up = frames.world();
            const down = frames.flip({ frame: frames.world() });

            // Act
            const [raised, lowered] = frames.offsetFrames({ frames: [up, down], distance: 2 });

            // Assert
            expectVector(raised!.origin, [0, 0, 2]);
            expectVector(lowered!.origin, [0, 0, -2]);
        });

        it("should turn each frame about its own axis, through its own origin", () => {
            // Arrange
            const list = [frames.xy({ origin: [5, 0, 0] }), frames.zx({ origin: [0, 0, 7] })];

            // Act
            const [first, second] = frames.rotateFrames({ frames: list, axis: Inputs.Frame.frameAxisEnum.z, angle: 90 });

            // Assert
            expectFrame(first!, frameOf([5, 0, 0], [0, 0, 1], [0, 1, 0]));
            expectFrame(second!, frameOf([0, 0, 7], [0, 1, 0], [1, 0, 0]));
        });

        it("should put a whole layout into one parent and bring it back", () => {
            // Arrange
            const parent = tilted();
            const layout = frames.grid({ countX: 3, countY: 2, spacingX: 1.5, spacingY: 2, centered: true });

            // Act
            const placed = frames.framesToWorld({ parent, children: layout });
            const back = frames.framesToLocal({ parent, children: placed });

            // Assert
            back.forEach((frame, i) => expectFrame(frame, layout[i]!));
            placed.forEach(frame => expect(dotOf(frame.normal, parent.normal)).toBeCloseTo(1, 12));
        });

        it("should use the defaults for what is left out: no move, a distance of 1, a quarter turn about Z", () => {
            // Arrange
            const list = [frames.world()];

            // Act
            const translated = frames.translateFrames({ frames: list });
            const offset = frames.offsetFrames({ frames: list });
            const rotated = frames.rotateFrames({ frames: list });

            // Assert
            expectFrame(translated[0]!, frames.world());
            expectVector(offset[0]!.origin, [0, 0, 1]);
            expectVector(rotated[0]!.direction, [0, 1, 0]);
        });

        it("should give an empty list for an empty list", () => {
            // Act
            const results = [
                frames.translateFrames({ frames: [], translation: [1, 0, 0] }),
                frames.offsetFrames({ frames: [], distance: 1 }),
                frames.rotateFrames({ frames: [], axis: Inputs.Frame.frameAxisEnum.x, angle: 10 }),
                frames.flipFrames({ frames: [] }),
                frames.framesToWorld({ parent: frames.world(), children: [] }),
                frames.framesToLocal({ parent: frames.world(), children: [] }),
            ];

            // Assert
            expect(results).toEqual([[], [], [], [], [], []]);
        });

        it("should give new frames and leave the list it was handed alone", () => {
            // Arrange
            const list = several();
            const copy = structuredClone(list);

            // Act
            const moved = frames.translateFrames({ frames: list, translation: [0, 0, 0] });

            // Assert
            expect(list).toEqual(copy);
            moved.forEach((frame, i) => {
                expect(frame).not.toBe(list[i]);
                expect(frame.origin).not.toBe(list[i]!.origin);
            });
        });

        it("should refuse frames that are not a list, and name the position of one that is not a frame", () => {
            // Act
            const notList = thrownBy(() => frames.flipFrames({ frames: loose<Frame3[]>(frames.world()) }));
            const notFrame = thrownBy(() => frames.offsetFrames({ frames: [frames.world(), frameOf([0, 0, 0], [0, 0, 0], [1, 0, 0])], distance: 1 }));
            const notChild = thrownBy(() => frames.framesToWorld({ parent: frames.world(), children: [loose<Frame3>({ origin: [0, 0, 0] })] }));

            // Assert
            expect(notList.message).toBe("`frames` is not a list of frames.");
            expect(notList.property).toBe("frames");
            expect(notFrame.message).toBe("`frames` at position 1 is not a frame: its `normal` has no length.");
            expect(notFrame.property).toBe("frames");
            expect(notChild.message).toContain("`children` at position 0 is not a frame");
            expect(notChild.property).toBe("children");
        });

        it("should refuse an axis that is not x, y or z even when there are no frames to turn", () => {
            // Act
            const error = thrownBy(() => frames.rotateFrames({ frames: [], axis: loose<Inputs.Frame.frameAxisEnum>("X"), angle: 30 }));

            // Assert
            expect(error.property).toBe("axis");
        });

        it("should refuse a parent that is not a frame, and a distance or angle that is not finite", () => {
            // Act
            const parent = thrownBy(() => frames.framesToLocal({ parent: loose<Frame3>(undefined), children: [frames.world()] }));
            const distance = thrownBy(() => frames.offsetFrames({ frames: [frames.world()], distance: Number.NaN }));
            const angle = thrownBy(() => frames.rotateFrames({ frames: [frames.world()], axis: Inputs.Frame.frameAxisEnum.z, angle: Number.POSITIVE_INFINITY }));

            // Assert
            expect([parent.property, distance.property, angle.property]).toEqual(["parent", "distance", "angle"]);
        });
    });

    describe("points and vectors", () => {
        const table = (): Frame3 => frames.zx({ origin: [0, 1, 0] });

        it("should read a point's coordinates along the frame's X, Y and normal", () => {
            // Act
            const point = frames.pointToWorld({ frame: table(), point: [1, 2, 3] });

            // Assert
            expectVector(point, [2, 4, 1]);
        });

        it("should give a point's signed distance from the plane as its third coordinate", () => {
            // Act
            const below = frames.pointToLocal({ frame: table(), point: [0, -4, 0] });
            const back = frames.pointToLocal({ frame: table(), point: [2, 4, 1] });

            // Assert
            expectVector(below, [0, 0, -5]);
            expectVector(back, [1, 2, 3]);
        });

        it("should convert every point in order, there and back", () => {
            // Arrange
            const frame = tilted();
            const local: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [1, 2, 0], [0, 2, -1]];

            // Act
            const world = frames.pointsToWorld({ frame, points: local });
            const back = frames.pointsToLocal({ frame, points: world });

            // Assert
            expect(world).toHaveLength(4);
            world.forEach((point, i) => expectVector(point, frames.pointToWorld({ frame, point: local[i]! })));
            back.forEach((point, i) => expectVector(point, local[i]!));
        });

        it("should turn a vector without moving it by the origin", () => {
            // Arrange
            const frame = frames.zx({ origin: [5, 5, 5] });

            // Act
            const up = frames.vectorToWorld({ frame, vector: [0, 0, 2] });
            const local = frames.vectorToLocal({ frame, vector: [1, 0, 0] });

            // Assert
            expectVector(up, [0, 2, 0]);
            expectVector(local, [0, 1, 0]);
        });

        it("should refuse a point or a vector that is not three numbers", () => {
            // Act
            const pointError = thrownBy(() => frames.pointToLocal({ frame: table(), point: loose<Inputs.Base.Point3>([1]) }));
            const vectorError = thrownBy(() => frames.vectorToWorld({ frame: table(), vector: loose<Inputs.Base.Vector3>("up") }));

            // Assert
            expect(pointError.property).toBe("point");
            expect(vectorError.property).toBe("vector");
        });
    });

    describe("matrices", () => {
        it("should give the frame's axes as columns and its origin as the translation", () => {
            // Act
            const matrices = frames.toMatrix({ frame: frames.zx({ origin: [1, 2, 3] }) });

            // Assert
            expect(matrices).toHaveLength(1);
            expectVector(matrices[0]!, [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 2, 3, 1]);
        });

        it("should move points the way pointsToWorld does", () => {
            // Arrange
            const frame = tilted();
            const local: Inputs.Base.Point3[] = [[1, 0, 0], [0, 2, 0], [0, 0, 3], [1, -1, 2]];

            // Act
            const moved = geometryHelper.transformControlPoints(frames.toMatrix({ frame }), local);

            // Assert
            moved.forEach((point, i) => expectVector(point, frames.pointToWorld({ frame, point: local[i]! })));
        });

        it("should read back the frame a matrix was made from", () => {
            // Arrange
            const frame = tilted();

            // Act
            const read = frames.fromMatrix({ transformation: frames.toMatrix({ frame }) });

            // Assert
            expectFrame(read, frame);
        });

        it("should drop scaling", () => {
            // Act
            const read = frames.fromMatrix({ transformation: [[2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 1, 1, 1, 1]] });

            // Assert
            expectFrame(read, frameOf([1, 1, 1], [0, 0, 1], [1, 0, 0]));
        });

        it("should apply a list of matrices in order", () => {
            // Arrange
            const moveAlongX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1];
            const quarterTurnAboutZ: Inputs.Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

            // Act
            const read = frames.fromMatrix({ transformation: [moveAlongX, quarterTurnAboutZ] });

            // Assert
            expectFrame(read, frameOf([0, 5, 0], [0, 0, 1], [0, 1, 0]));
        });

        it("should read nested lists of matrices", () => {
            // Arrange
            const moveAlongX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1];
            const moveAlongY: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 0, 1];

            // Act
            const read = frames.fromMatrix({ transformation: loose<Inputs.Base.TransformMatrixes>([[moveAlongX], [moveAlongY]]) });

            // Assert
            expectVector(read.origin, [5, 2, 0]);
        });

        it("should accept one matrix given without a list", () => {
            // Act
            const read = frames.fromMatrix({ transformation: loose<Inputs.Base.TransformMatrixes>([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7, 8, 9, 1]) });

            // Assert
            expectFrame(read, frameOf([7, 8, 9], [0, 0, 1], [1, 0, 0]));
        });

        it("should keep the X and Z axes of a mirror", () => {
            // Act
            const read = frames.fromMatrix({ transformation: [[1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] });

            // Assert
            expectFrame(read, frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0]));
        });

        it("should keep the Z axis of a shear and square the X axis to it", () => {
            // Arrange
            const shearZAlongX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1];

            // Act
            const read = frames.fromMatrix({ transformation: [shearZAlongX] });

            // Assert
            expectFrame(read, frameOf([0, 0, 0], [Math.SQRT1_2, 0, Math.SQRT1_2], [Math.SQRT1_2, 0, -Math.SQRT1_2]));
        });

        it("should refuse a matrix with a perspective part, naming its place in the list", () => {
            // Arrange
            const identity: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            const perspective: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 1];

            // Act
            const error = thrownBy(() => frames.fromMatrix({ transformation: [identity, perspective] }));

            // Assert
            expect(error.property).toBe("transformation");
            expect(error.message).toContain("matrix 1");
        });

        it("should read back a frame far from the origin without losing its axes to the translation", () => {
            // Arrange
            const far = frames.translate({ frame: tilted(), translation: [1e12, -3e12, 5e11] });

            // Act
            const read = frames.fromMatrix({ transformation: frames.toMatrix({ frame: far }) });

            // Assert
            read.normal.forEach((value, i) => expect(Math.abs(value - far.normal[i]!)).toBeLessThan(1e-15));
            read.direction.forEach((value, i) => expect(Math.abs(value - far.direction[i]!)).toBeLessThan(1e-15));
            expect(read.origin).toEqual(far.origin);
        });

        it.each([
            { transformation: loose<Inputs.Base.TransformMatrixes>([]), reason: "an empty list" },
            { transformation: loose<Inputs.Base.TransformMatrixes>("matrix"), reason: "text" },
            { transformation: loose<Inputs.Base.TransformMatrixes>([[1, 2, 3]]), reason: "a short matrix" },
            { transformation: loose<Inputs.Base.TransformMatrixes>([[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, Number.NaN, 1]]), reason: "a matrix holding NaN" },
            { transformation: [[0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]] as Inputs.Base.TransformMatrixes, reason: "a matrix that flattens X" },
            { transformation: [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]] as Inputs.Base.TransformMatrixes, reason: "a matrix that flattens Z" },
        ])("should refuse $reason", ({ transformation }) => {
            // Act
            const error = thrownBy(() => frames.fromMatrix({ transformation }));

            // Assert
            expect(error.property).toBe("transformation");
        });

        it("should carry points placed on one frame onto the same place on another", () => {
            // Arrange
            const from = tilted();
            const to = frames.rotate({ frame: frames.zx({ origin: [3, -1, 2] }), axis: Inputs.Frame.frameAxisEnum.x, angle: 25 });
            const local: Inputs.Base.Point3[] = [[0, 0, 0], [1, 2, 3], [-2, 0, 1]];

            // Act
            const carried = geometryHelper.transformControlPoints(frames.matrixFromTo({ to, from }), frames.pointsToWorld({ frame: from, points: local }));

            // Assert
            carried.forEach((point, i) => expectVector(point, frames.pointToWorld({ frame: to, point: local[i]! })));
        });

        it("should start from the world frame when from is left out", () => {
            // Arrange
            const to = tilted();

            // Act
            const matrix = frames.matrixFromTo({ to });

            // Assert
            expectVector(matrix[0]!, frames.toMatrix({ frame: to })[0]!);
        });

        it("should name from or to when one is not a frame", () => {
            // Act
            const fromError = thrownBy(() => frames.matrixFromTo({ to: frames.world(), from: loose<Frame3>({ origin: [0, 0, 0] }) }));
            const toError = thrownBy(() => frames.matrixFromTo({ to: loose<Frame3>(3) }));

            // Assert
            expect(fromError.property).toBe("from");
            expect(toError.property).toBe("to");
        });
    });

    describe("patterns", () => {
        it("should lay a grid out row by row, along X first, from the frame's origin", () => {
            // Act
            const grid = frames.grid({ countX: 3, countY: 2, spacingX: 2, spacingY: 5 });

            // Assert
            [[0, 0, 0], [2, 0, 0], [4, 0, 0], [0, 5, 0], [2, 5, 0], [4, 5, 0]].forEach((origin, i) => expectVector(grid[i]!.origin, origin));
            expect(grid).toHaveLength(6);
            grid.forEach(frame => expectFrame(frame, frameOf(frame.origin, [0, 0, 1], [1, 0, 0])));
        });

        it("should center a grid in the plane of the frame it follows", () => {
            // Act
            const grid = frames.grid({ frame: frames.zx({ origin: [0, 3, 0] }), countX: 2, countY: 2, spacingX: 1, spacingY: 1, centered: true });

            // Assert
            expect(grid).toHaveLength(4);
            [[-0.5, 3, -0.5], [-0.5, 3, 0.5], [0.5, 3, -0.5], [0.5, 3, 0.5]].forEach((origin, i) => expectVector(grid[i]!.origin, origin));
            grid.forEach(frame => expectFrame(frame, frameOf(frame.origin, [0, 1, 0], [0, 0, 1])));
        });

        it("should give a three by three grid by default", () => {
            // Act
            const grid = frames.grid({});

            // Assert
            expect(grid).toHaveLength(9);
            expectVector(grid[8]!.origin, [4, 4, 0]);
        });

        it.each([
            { countX: 2.5, property: "countX" },
            { countX: 0, property: "countX" },
            { countY: -1, property: "countY" },
            { spacingX: Number.NaN, property: "spacingX" },
            { spacingY: Number.NEGATIVE_INFINITY, property: "spacingY" },
        ])("should refuse $property of a grid that cannot be laid out", ({ property, ...inputs }) => {
            // Act
            const error = thrownBy(() => frames.grid(inputs));

            // Assert
            expect(error.property).toBe(property);
        });

        it("should space a full ring evenly without repeating the first frame, turning each with it", () => {
            // Act
            const ring = frames.polar({ count: 4, radius: 2 });

            // Assert
            [[2, 0, 0], [0, 2, 0], [-2, 0, 0], [0, -2, 0]].forEach((origin, i) => expectVector(ring[i]!.origin, origin));
            [[1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]].forEach((direction, i) => expectVector(ring[i]!.direction, direction));
            ring.forEach(frame => expectVector(frame.normal, [0, 0, 1]));
        });

        it("should put a frame at each end of a partial sweep", () => {
            // Act
            const ring = frames.polar({ count: 3, radius: 4, angle: 90 });

            // Assert
            [[4, 0, 0], [4 * Math.SQRT1_2, 4 * Math.SQRT1_2, 0], [0, 4, 0]].forEach((origin, i) => expectVector(ring[i]!.origin, origin));
        });

        it("should keep the axes of the frame when frames do not turn, starting at the start angle", () => {
            // Act
            const ring = frames.polar({ frame: frames.zx({ origin: [0, 1, 0] }), count: 2, radius: 3, angle: 180, startAngle: 90, rotate: false });

            // Assert
            expectFrame(ring[0]!, frameOf([3, 1, 0], [0, 1, 0], [0, 0, 1]));
            expectFrame(ring[1]!, frameOf([-3, 1, 0], [0, 1, 0], [0, 0, 1]));
        });

        it("should turn frames in place about the center at radius zero", () => {
            // Act
            const ring = frames.polar({ count: 2, radius: 0, angle: 360 });

            // Assert
            ring.forEach(frame => expectVector(frame.origin, [0, 0, 0]));
            expectVector(ring[1]!.direction, [-1, 0, 0]);
        });

        it("should ring six frames three units out by default", () => {
            // Act
            const ring = frames.polar({});

            // Assert
            expect(ring).toHaveLength(6);
            expectVector(ring[1]!.origin, [1.5, 1.5 * Math.sqrt(3), 0]);
        });

        it("should put a single frame at the start angle", () => {
            // Act
            const ring = frames.polar({ count: 1, radius: 1, angle: 90, startAngle: 90 });

            // Assert
            expect(ring).toHaveLength(1);
            expectVector(ring[0]!.origin, [0, 1, 0]);
        });

        it("should sweep backwards for a negative angle", () => {
            // Act
            const ring = frames.polar({ count: 2, radius: 1, angle: -90 });

            // Assert
            expectVector(ring[1]!.origin, [0, -1, 0]);
        });

        it("should space a full turn backwards evenly, clockwise", () => {
            // Act
            const ring = frames.polar({ count: 4, radius: 1, angle: -360 });

            // Assert
            [[1, 0, 0], [0, -1, 0], [-1, 0, 0], [0, 1, 0]].forEach((origin, i) => expectVector(ring[i]!.origin, origin));
        });

        it.each([720, -400, 360.5])("should refuse an angle of %s, beyond a full turn", (angle) => {
            // Act
            const error = thrownBy(() => frames.polar({ count: 4, angle }));

            // Assert
            expect(error.property).toBe("angle");
        });

        it("should refuse a negative radius or a count below one", () => {
            // Act
            const radiusError = thrownBy(() => frames.polar({ radius: -1 }));
            const countError = thrownBy(() => frames.polar({ count: 0 }));

            // Assert
            expect(radiusError.property).toBe("radius");
            expect(countError.property).toBe("count");
        });

        it("should lay a honeycomb out row by row, shifting every second row by half a hexagon", () => {
            // Arrange
            const w = Math.sqrt(3);

            // Act
            const cells = frames.hexGrid({ countX: 2, countY: 3, radius: 1 });

            // Assert
            [[0, 0, 0], [w, 0, 0], [w / 2, 1.5, 0], [w * 1.5, 1.5, 0], [0, 3, 0], [w, 3, 0]].forEach((origin, i) => expectVector(cells[i]!.origin, origin));
            cells.forEach(frame => expectFrame(frame, frameOf(frame.origin, [0, 0, 1], [1, 0, 0])));
        });

        it("should center a honeycomb on the frame's origin, in its plane", () => {
            // Arrange
            const w = Math.sqrt(3);

            // Act
            const cells = frames.hexGrid({ frame: frames.zx({ origin: [0, 2, 0] }), countX: 2, countY: 2, radius: 1, centered: true });

            // Assert
            [[-0.75, 2, -0.75 * w], [-0.75, 2, 0.25 * w], [0.75, 2, -0.25 * w], [0.75, 2, 0.75 * w]].forEach((origin, i) => expectVector(cells[i]!.origin, origin));
        });

        it("should center a single row without the half-hexagon shift of the rows it does not have", () => {
            // Arrange
            const w = Math.sqrt(3);

            // Act
            const cells = frames.hexGrid({ countX: 3, countY: 1, radius: 1, centered: true });

            // Assert
            [[-w, 0, 0], [0, 0, 0], [w, 0, 0]].forEach((origin, i) => expectVector(cells[i]!.origin, origin));
        });

        it("should center a honeycomb of 160,000 cells symmetrically", () => {
            // Act
            const cells = frames.hexGrid({ countX: 400, countY: 400, radius: 1, centered: true });

            // Assert
            expect(cells).toHaveLength(160000);
            const first = cells[0]!.origin;
            const last = cells[cells.length - 1]!.origin;
            expectVector([first[0] + last[0], first[1] + last[1], first[2] + last[2]], [0, 0, 0]);
            expectVector(first, [-(399 * Math.sqrt(3) + Math.sqrt(3) / 2) / 2, -399 * 1.5 / 2, 0]);
        });

        it("should refuse a hexagon of no size", () => {
            // Act
            const error = thrownBy(() => frames.hexGrid({ radius: 0 }));

            // Assert
            expect(error.property).toBe("radius");
        });
    });
});
