import { describe, it, expect } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import {
    checkedChoice, checkedCount, checkedDirection, checkedFrame, checkedFrames, checkedIndexes, checkedNumber, checkedPlacements, checkedPoint,
    checkedShape, checkedShapes, withIndexesInRange,
} from "./input-checks";
import { KernelExceptionReader } from "../../kernel-exception";

const thrownBy = (action: () => unknown): InputError => {
    try {
        action();
    } catch (error) {
        expect(error).toBeInstanceOf(InputError);
        return error as InputError;
    }
    throw new Error("expected an InputError, but nothing was thrown");
};

const world = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };

const turnAboutZ = (degrees: number): number[] => {
    const c = Math.cos(degrees * Math.PI / 180);
    const s = Math.sin(degrees * Math.PI / 180);
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};

const moveBy = (x: number, y: number, z: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

const applied = (matrix: readonly number[], point: readonly number[]): number[] =>
    [0, 1, 2].map(row => matrix[row]! * point[0]! + matrix[4 + row]! * point[1]! + matrix[8 + row]! * point[2]! + matrix[12 + row]!);

const rethrown = (thrown: unknown): never => {
    throw thrown;
};

const kernelThrowing = (message: string): KernelExceptionReader => ({
    getExceptionMessage: () => ["Standard_OutOfRange", message],
    decrementExceptionRefcount: () => undefined,
});

describe("input checks", () => {

    describe("checkedShape", () => {
        it.each([
            { value: undefined, reason: "nothing" },
            { value: null, reason: "null" },
            { value: { name: "box" }, reason: "an object that is no shape" },
            { value: { IsNull: () => true }, reason: "an empty shape" },
        ])("should refuse $reason, naming the property", ({ value }) => {
            // Act
            const error = thrownBy(() => checkedShape(value, "tool"));

            // Assert
            expect(error.property).toBe("tool");
        });

        it("should hand back a shape that is not empty", () => {
            // Arrange
            const shape = { IsNull: () => false };

            // Act
            const checked = checkedShape(shape);

            // Assert
            expect(checked).toBe(shape);
        });
    });

    describe("checkedShapes", () => {
        const shape = { IsNull: (): boolean => false };
        const empty = { IsNull: (): boolean => true };

        it.each([
            { list: [shape, empty], position: 1 },
            { list: [undefined, shape], position: 0 },
            { list: [shape, shape, { name: "box" }], position: 2 },
        ])("should refuse a list with a missing or empty shape at position $position, naming it", ({ list, position }) => {
            // Act
            const error = thrownBy(() => checkedShapes(list, "sections"));

            // Assert
            expect(error.property).toBe("sections");
            expect(error.message).toBe(`\`sections\` holds a missing or empty shape at position ${position}, as an operation that failed can leave it.`);
        });

        it("should refuse shapes that are not a list", () => {
            // Act
            const error = thrownBy(() => checkedShapes(shape));

            // Assert
            expect(error.property).toBe("shapes");
            expect(error.message).toBe("`shapes` is not a list of shapes.");
        });

        it("should hand back the list it was given, an empty one included", () => {
            // Arrange
            const list = [shape, shape];

            // Act
            const checked = checkedShapes(list);
            const none = checkedShapes([]);

            // Assert
            expect(checked).toBe(list);
            expect(none).toEqual([]);
        });
    });

    describe("numbers, points and directions", () => {
        it.each([Number.NaN, Number.POSITIVE_INFINITY, -0.5, 181, "5"])("should refuse %s where a number from 0 to 180 is asked for", (value) => {
            // Act
            const error = thrownBy(() => checkedNumber(value, "angle", 0, 180));

            // Assert
            expect(error.property).toBe("angle");
            expect(error.message).toContain("from 0 to 180");
        });

        it("should say or more of a range without an upper end", () => {
            // Act
            const error = thrownBy(() => checkedNumber(-1, "tolerance", 0));

            // Assert
            expect(error.message).toBe("`tolerance` must be a finite number 0 or more; it is -1.");
        });

        it("should refuse a direction of no length and one that is not three numbers", () => {
            // Act
            const zero = thrownBy(() => checkedDirection([0, 0, 0], "normal"));
            const short = thrownBy(() => checkedDirection([0, 1], "normal"));
            const point = thrownBy(() => checkedPoint([0, Number.NaN, 1], "center"));

            // Assert
            expect(zero.message).toContain("points nowhere");
            expect(short.property).toBe("normal");
            expect(point.property).toBe("center");
            expect(checkedDirection([0, 0, -2], "normal")).toEqual([0, 0, -2]);
        });
    });

    describe("counts, indexes and choices", () => {
        it.each([0, -1, 2.5, Number.NaN])("should refuse a count of %s", (count) => {
            // Act
            const error = thrownBy(() => checkedCount(count, "count"));

            // Assert
            expect(error.property).toBe("count");
        });

        it.each([1, 7, Number.POSITIVE_INFINITY])("should take a count of %s", (count) => {
            // Act
            const checked = checkedCount(count, "count");

            // Assert
            expect(checked).toBe(count);
        });

        it.each([[1.5], [-1], [Number.NaN], ["2"]])("should refuse %s as an index", (index) => {
            // Act
            const error = thrownBy(() => checkedIndexes([0, index], "indexes"));

            // Assert
            expect(error.property).toBe("indexes");
            expect(error.message).toContain("not an index");
        });

        it("should refuse indexes that are not a list, and keep a list of whole numbers as it is", () => {
            // Act
            const error = thrownBy(() => checkedIndexes(3, "indexes"));
            const checked = checkedIndexes([4, 0, 4], "indexes");

            // Assert
            expect(error.property).toBe("indexes");
            expect(checked).toEqual([4, 0, 4]);
        });

        it("should refuse a choice that is none of those allowed, listing them", () => {
            // Act
            const error = thrownBy(() => checkedChoice("Plane", ["plane", "cylinder"], "type"));

            // Assert
            expect(error.message).toBe("`type` is Plane, which is none of plane, cylinder.");
        });
    });

    describe("frames", () => {
        it.each([
            { frame: { origin: [0, 0, 0], normal: [0, 0, 1] }, reason: "no direction", says: "is not a frame: it needs" },
            { frame: { ...world, normal: [0, 0, 0] }, reason: "a normal of no length", says: "`normal` has no length" },
            { frame: { ...world, direction: [0, 0, 5] }, reason: "a direction along the normal", says: "runs along its `normal`" },
            { frame: { ...world, origin: [Number.NaN, 0, 0] }, reason: "an origin that is not finite", says: "three finite numbers each" },
        ])("should refuse a frame with $reason", ({ frame, says }) => {
            // Act
            const error = thrownBy(() => checkedFrame(frame, "to"));

            // Assert
            expect(error.property).toBe("to");
            expect(error.message).toContain(says);
        });

        it("should refuse frames that are not a list", () => {
            // Act
            const error = thrownBy(() => checkedFrames(world, "frames"));

            // Assert
            expect(error.message).toBe("`frames` is not a list of frames.");
        });

        it("should name the position of the frame a list cannot use", () => {
            // Act
            const error = thrownBy(() => checkedFrames([world, { ...world, normal: [0, 0, 0] }], "frames"));

            // Assert
            expect(error.property).toBe("frames");
            expect(error.message).toContain("`frames` at position 1 is not a frame");
        });
    });

    describe("checkedPlacements", () => {
        it("should combine a list of matrices first to last, as the frame and transform methods give them", () => {
            // Act
            const [placement] = checkedPlacements([[moveBy(5, 0, 0), turnAboutZ(90)]], "matrices");

            // Assert
            applied(placement!, [1, 0, 0]).forEach((value, i) => expect(value).toBeCloseTo([0, 6, 0][i]!, 12));
        });

        it("should refuse placements that are not a list", () => {
            // Act
            const error = thrownBy(() => checkedPlacements("matrices", "matrices"));

            // Assert
            expect(error.message).toBe("`matrices` is not a list of placements.");
        });

        it("should take a single matrix, and a list of lists, as one placement each", () => {
            // Act
            const placements = checkedPlacements([moveBy(1, 2, 3), [[moveBy(1, 0, 0)], [moveBy(0, 1, 0)]]] as unknown[], "matrices");

            // Assert
            expect(placements).toHaveLength(2);
            expect(applied(placements[0]!, [0, 0, 0])).toEqual([1, 2, 3]);
            expect(applied(placements[1]!, [0, 0, 0])).toEqual([1, 1, 0]);
        });

        it.each([
            { entry: [], reason: "an empty list" },
            { entry: [1, 2, 3], reason: "a short matrix" },
            { entry: [moveBy(0, 0, Number.NaN)], reason: "a matrix holding NaN" },
        ])("should refuse $reason, naming its position", ({ entry }) => {
            // Act
            const error = thrownBy(() => checkedPlacements([moveBy(0, 0, 0), entry] as unknown[], "matrices"));

            // Assert
            expect(error.property).toBe("matrices");
            expect(error.message).toContain("at position 1");
        });
    });

    describe("withIndexesInRange", () => {
        it("should give back what the call gives when nothing is out of range", () => {
            // Act
            const result = withIndexesInRange(kernelThrowing("unused"), "faces", { indexes: [0] }, () => "chosen");

            // Assert
            expect(result).toBe("chosen");
        });

        it("should turn an index the kernel finds past the last face into an input error naming the list that held it", () => {
            // Act
            const error = thrownBy(() => withIndexesInRange(
                kernelThrowing("SelectEdgesBetween: index 9 is outside 0 to 5"), "faces", { indexes: [0, 1], otherIndexes: [9] }, () => rethrown(1)));

            // Assert
            expect(error.property).toBe("otherIndexes");
            expect(error.message).toBe("`otherIndexes` holds 9, past the shape's last: its faces are numbered from 0 to 5.");
        });

        it("should say when the shape has none of what the indexes count", () => {
            // Act
            const error = thrownBy(() => withIndexesInRange(
                kernelThrowing("SelectFacesFacing: index 0 is out of range, since the shape has none"), "faces", { indexes: [0] }, () => rethrown(1)));

            // Assert
            expect(error.message).toContain("the shape has no faces");
        });

        it("should pass on any other failure as the kernel words it", () => {
            // Act
            let thrown: unknown;
            try {
                withIndexesInRange(kernelThrowing("SelectFacesFacing: the direction has no length"), "faces", {}, () => rethrown(1));
            } catch (error) {
                thrown = error;
            }

            // Assert
            expect(thrown).not.toBeInstanceOf(InputError);
            expect((thrown as Error).message).toBe("Standard_OutOfRange: SelectFacesFacing: the direction has no length");
        });
    });
});
