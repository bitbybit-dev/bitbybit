import { InputError } from "@bitbybit-dev/base";
import { isFrameShaped, isTriple, squareFrame } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { KernelExceptionReader, readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";

type Vec3 = Inputs.Base.Vector3;

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/** A shape the caller handed in, refused when it is missing or empty, as an operation that failed can leave it. */
export function checkedShape(shape: unknown, property = "shape"): TopoDS_Shape {
    const candidate = shape as { IsNull?: unknown } | null | undefined;
    if (candidate === null || candidate === undefined || typeof candidate.IsNull !== "function" || (shape as TopoDS_Shape).IsNull()) {
        throw new InputError(`\`${property}\` is missing or empty, as an operation that failed can leave it.`, property);
    }
    return shape as TopoDS_Shape;
}

/** Three finite numbers. */
export function checkedPoint(value: unknown, property: string): Vec3 {
    if (!isTriple(value)) {
        throw new InputError(`\`${property}\` is not a point: it needs three finite numbers.`, property);
    }
    return value;
}

/** Three finite numbers that are not all 0. */
export function checkedDirection(value: unknown, property: string): Vec3 {
    if (!isTriple(value)) {
        throw new InputError(`\`${property}\` is not a direction: it needs three finite numbers.`, property);
    }
    if (value[0] === 0 && value[1] === 0 && value[2] === 0) {
        throw new InputError(`\`${property}\` is [0, 0, 0], which points nowhere.`, property);
    }
    return value;
}

/** A finite number from `least` to `most`. */
export function checkedNumber(value: unknown, property: string, least = -Infinity, most = Infinity): number {
    if (!isFiniteNumber(value) || value < least || value > most) {
        const range = most === Infinity ? `${least} or more` : `from ${least} to ${most}`;
        throw new InputError(`\`${property}\` must be a finite number ${range}; it is ${String(value)}.`, property);
    }
    return value;
}

/** A whole number of 1 or more, or Infinity for as many as there are. */
export function checkedCount(value: unknown, property: string): number {
    if (!(typeof value === "number" && value >= 1 && (Number.isInteger(value) || value === Infinity))) {
        throw new InputError(`\`${property}\` must be a whole number of 1 or more; it is ${String(value)}.`, property);
    }
    return value;
}

/** Whole numbers from 0; whether each is below the count of faces or edges only the shape can say. */
export function checkedIndexes(value: unknown, property: string): number[] {
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` is not a list of indexes.`, property);
    }
    const faulty = value.find(index => !(typeof index === "number" && Number.isInteger(index) && index >= 0));
    if (faulty !== undefined) {
        throw new InputError(`\`${property}\` holds ${String(faulty)}, which is not an index: indexes are whole numbers from 0.`, property);
    }
    return value as number[];
}

/** One of `allowed`. */
export function checkedChoice<T>(value: unknown, allowed: readonly T[], property: string): T {
    if (!allowed.includes(value as T)) {
        throw new InputError(`\`${property}\` is ${String(value)}, which is none of ${allowed.join(", ")}.`, property);
    }
    return value as T;
}

/**
 * A frame the caller handed in: an origin, a normal and a direction, three finite numbers each, whose
 * normal has a length and whose direction does not run along it.
 */
export function checkedFrame(value: unknown, property: string): Inputs.Base.Frame {
    if (!isFrameShaped(value)) {
        throw new InputError(`\`${property}\` is not a frame: it needs \`origin\`, \`normal\` and \`direction\`, three finite numbers each.`, property);
    }
    const fault = squareFrame(value.origin, value.normal, value.direction);
    if (fault === "normal") {
        throw new InputError(`\`${property}\` is not a frame: its \`normal\` has no length.`, property);
    }
    if (fault === "direction") {
        throw new InputError(`\`${property}\` is not a frame: its \`direction\` runs along its \`normal\` or has no length.`, property);
    }
    return value;
}

/** A list of frames, each checked as `checkedFrame` checks one. */
export function checkedFrames(value: unknown, property: string): Inputs.Base.Frame[] {
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` is not a list of frames.`, property);
    }
    return value.map((frame, index) => {
        try {
            return checkedFrame(frame, property);
        } catch (error) {
            throw error instanceof InputError ? new InputError(error.message.replace(`\`${property}\` is`, `\`${property}\` at position ${index} is`), property) : error;
        }
    });
}

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const isMatrix = (value: unknown): value is number[] => Array.isArray(value) && value.length === 16 && value.every(isFiniteNumber);

/** The product of two column-major 4 x 4 matrices: `first` applied, then `second`. */
const followedBy = (first: readonly number[], second: readonly number[]): number[] =>
    Array.from({ length: 16 }, (_, index) => {
        const column = Math.floor(index / 4);
        const row = index % 4;
        return second[row]! * first[column * 4]! + second[4 + row]! * first[column * 4 + 1]!
            + second[8 + row]! * first[column * 4 + 2]! + second[12 + row]! * first[column * 4 + 3]!;
    });

/** The matrices of a placement, however deep the lists hold them, in order. */
const matricesOf = (value: unknown): unknown[] =>
    isMatrix(value) ? [value] : Array.isArray(value) ? value.flatMap(matricesOf) : [value];

/**
 * The placements a caller handed in, each as one column-major matrix: an entry is a matrix of
 * sixteen finite numbers, or a list of them applied first to last, as the frame and transform
 * methods give them.
 */
export function checkedPlacements(value: unknown, property: string): number[][] {
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` is not a list of placements.`, property);
    }
    return value.map((entry, position) => {
        const matrices = matricesOf(entry);
        if (matrices.length === 0 || !matrices.every(isMatrix)) {
            throw new InputError(`\`${property}\` holds something other than a placement at position ${position}: each is a matrix of sixteen finite numbers, or a list of them.`, property);
        }
        return matrices.reduce<number[]>((total, matrix) => followedBy(total, matrix), IDENTITY);
    });
}

/**
 * Runs a kernel call that reads indexes, turning an index the kernel finds past the last face or
 * edge into an input error naming the list that held it.
 * @param occ - The kernel the call runs in, which reads its exception
 * @param noun - What the indexes count, as "faces" or "edges"
 * @param lists - The lists of indexes the call was given, by the name of their property
 * @param call - The kernel call
 */
export function withIndexesInRange<T>(occ: KernelExceptionReader, noun: string, lists: Record<string, readonly number[]>, call: () => T): T {
    try {
        return call();
    } catch (thrown) {
        const read = readKernelException(occ, thrown);
        const outside = read instanceof Error ? /index (-?\d+) is (?:outside 0 to (\d+)|out of range)/.exec(read.message) : null;
        if (outside === null) {
            throw read;
        }
        const index = Number(outside[1]);
        const property = Object.keys(lists).find(name => lists[name]!.includes(index)) ?? Object.keys(lists)[0]!;
        const counted = outside[2] === undefined ? `the shape has no ${noun}` : `its ${noun} are numbered from 0 to ${outside[2]}`;
        throw new InputError(`\`${property}\` holds ${index}, past the shape's last: ${counted}.`, property);
    }
}
