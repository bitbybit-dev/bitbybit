import { InputError } from "@bitbybit-dev/base";
import { BitbybitFrame_CurveFrame, BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { readKernelException } from "../../kernel-exception";
import { checkedChoice, checkedDirection, checkedNumber, checkedShape } from "./input-checks";

const CURVE_FRAME_KINDS: readonly Inputs.OCCT.curveFrameEnum[] = [
    Inputs.OCCT.curveFrameEnum.frenet,
    Inputs.OCCT.curveFrameEnum.perpendicular,
    Inputs.OCCT.curveFrameEnum.rotationMinimizing,
];

/** The frame at the origin, normal along z and direction along x, that `from` means when it is left out. */
export const WORLD_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };

/** The frames in the kernel's numbers, nine to a frame: origin, normal, direction. */
export function framesFromNumbers(numbers: ArrayLike<number>): Inputs.Base.Frame[] {
    const frames: Inputs.Base.Frame[] = [];
    for (let at = 0; at + 8 < numbers.length; at += 9) {
        frames.push({
            origin: [numbers[at]!, numbers[at + 1]!, numbers[at + 2]!],
            normal: [numbers[at + 3]!, numbers[at + 4]!, numbers[at + 5]!],
            direction: [numbers[at + 6]!, numbers[at + 7]!, numbers[at + 8]!],
        });
    }
    return frames;
}

/** The kernel's nine numbers for each frame, one frame after another. */
export function numbersOfFrames(frames: readonly Inputs.Base.Frame[]): number[] {
    return frames.flatMap(frame => [...frame.origin, ...frame.normal, ...frame.direction]);
}

/** The kernel's value for a kind of curve frame. */
export function curveFrameKind(occ: BitbybitOcctModule, kind: Inputs.OCCT.curveFrameEnum): BitbybitFrame_CurveFrame {
    switch (kind) {
        case Inputs.OCCT.curveFrameEnum.frenet:
            return occ.BitbybitFrame_CurveFrame.Frenet;
        case Inputs.OCCT.curveFrameEnum.rotationMinimizing:
            return occ.BitbybitFrame_CurveFrame.RotationMinimizing;
        default:
            return occ.BitbybitFrame_CurveFrame.Perpendicular;
    }
}

/**
 * Frames along an edge or a wire at `values`, fractions from 0 to 1 or lengths from the start, each
 * checked before the kernel reads it; a length past the end is refused as an input error naming
 * `property`, as the kernel finds it.
 */
export function framesOnCurve(
    occ: BitbybitOcctModule, shape: unknown, values: readonly number[], isLength: boolean, kind: unknown, up: unknown, property: string,
): Inputs.Base.Frame[] {
    const curve = checkedShape(shape);
    const frameKind = checkedChoice(kind, CURVE_FRAME_KINDS, "kind");
    const upVector = checkedDirection(up, "up");
    if (!Array.isArray(values)) {
        throw new InputError(`\`${property}\` is not a list of numbers.`, property);
    }
    values.forEach(value => checkedNumber(value, property, 0, isLength ? Infinity : 1));
    try {
        return framesFromNumbers(occ.FramesOnCurve(curve, values, isLength, curveFrameKind(occ, frameKind), upVector));
    } catch (thrown) {
        const read = readKernelException(occ, thrown);
        const off = read instanceof Error ? /value (\d+) lies off the curve, which runs from 0 to (\S+)/.exec(read.message) : null;
        if (off === null) {
            throw read;
        }
        throw new InputError(`\`${property}\` holds ${values[Number(off[1])]}, past the end of the curve, which is ${Number(off[2])} long.`, property);
    }
}
