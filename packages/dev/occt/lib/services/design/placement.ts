import { InputError } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type { BaseBitByBit } from "../../base";
import { DesignProblem } from "./problems";

/** A placement as a column-major 4 x 4 matrix. */
export type Matrix = Inputs.Base.TransformMatrix;

/** The first three numbers of a list, as a point or a vector. */
export function tripleOf(values: readonly number[]): Inputs.Base.Vector3 {
    return [values[0]!, values[1]!, values[2]!];
}

/** A vector scaled to length 1; one of no length is a problem at `path`. */
export function unitVector(vector: readonly number[], path: string, base: BaseBitByBit): Inputs.Base.Vector3 {
    const unit = base.vector.normalized({ vector: [...vector] });
    if (unit === undefined) {
        throw new DesignProblem(path, "the direction has no length");
    }
    return tripleOf(unit);
}

/** The frame with its normal scaled to length 1 and its direction turned square to it, or undefined when the direction runs along the normal. */
export function squaredFrame(origin: Inputs.Base.Point3, normal: Inputs.Base.Vector3, direction: Inputs.Base.Vector3, base: BaseBitByBit): Inputs.Base.Frame | undefined {
    try {
        return base.frame.create({ origin, normal, direction });
    } catch (thrown) {
        if (thrown instanceof InputError) {
            return undefined;
        }
        throw thrown;
    }
}

/** The matrix that moves the world's origin and axes onto a frame. */
export function frameMatrix(frame: Inputs.Base.Frame, base: BaseBitByBit): Matrix {
    return base.frame.toMatrix({ frame })[0]!;
}

/** A frame moved by a placement. */
export function movedFrame(matrix: Matrix, frame: Inputs.Base.Frame, base: BaseBitByBit): Inputs.Base.Frame {
    return base.frame.frameToWorld({ parent: base.frame.fromMatrix({ transformation: [matrix] }), child: frame });
}

/**
 * The placement a joint gives: it brings `connector` (a frame in the component's own coordinates)
 * onto `target`, the connector's normal against the target's (along it with `flip`), the x axes
 * along each other turned by `angle` degrees about the target's normal, and `offset` along that
 * normal.
 */
export function jointMatrix(connector: Inputs.Base.Frame, target: Inputs.Base.Frame, flip: boolean, angle: number, offset: number, base: BaseBitByBit): Matrix {
    const raised = base.frame.offset({ frame: target, distance: offset });
    const turned = base.frame.rotate({ frame: raised, axis: Inputs.Frame.frameAxisEnum.z, angle });
    const meeting = flip ? turned : base.frame.flip({ frame: turned });
    return base.frame.matrixFromTo({ from: connector, to: meeting })[0]!;
}
