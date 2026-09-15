
import * as BABYLON from "@babylonjs/core";
import { Base } from "../../inputs/base-inputs";
import * as Inputs from "../../inputs";

/**
 * Builds transformation matrices for moving, rotating and scaling geometry, using the BabylonJS
 * math. A transformation is a 4x4 matrix as 16 numbers in column-major order; most methods return a
 * short list of them that is applied in order, so a rotation about a point is a move to the origin,
 * the rotation, and the move back. Angles are in degrees. The `transforms` service on the base
 * package builds the same matrices without the engine.
 */

export class BabylonTransforms {

    /**
     * Builds a rotation about an axis that passes through a center point, as three matrices applied
     * in order: move the center to the origin, rotate, move back. The angle is in degrees.
     * @param inputs - The angle in degrees, the axis direction and the center it passes through
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center axis
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.babylon.transforms.rotationCenterAxis({ angle: 90, axis: [0, 1, 0], center: [5, 0, 0] });
     * ```
     */
    rotationCenterAxis(inputs: Inputs.BabylonTransforms.RotationCenterAxisDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationAxis(
                new BABYLON.Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
                BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the X axis through a center point, as three
     * matrices applied in order: move the center to the origin, rotate, move back. The angle is in
     * degrees.
     * @param inputs - The angle in degrees and the center
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center x
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.babylon.transforms.rotationCenterX({ angle: 90, center: [0, 0, 0] });
     * ```
     */
    rotationCenterX(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationX(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the Y axis through a center point, as three
     * matrices applied in order: move the center to the origin, rotate, move back. The angle is in
     * degrees.
     * @param inputs - The angle in degrees and the center
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center y
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.babylon.transforms.rotationCenterY({ angle: 90, center: [0, 0, 0] });
     * ```
     */
    rotationCenterY(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationY(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the Z axis through a center point, as three
     * matrices applied in order: move the center to the origin, rotate, move back. The angle is in
     * degrees.
     * @param inputs - The angle in degrees and the center
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center z
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.babylon.transforms.rotationCenterZ({ angle: 90, center: [0, 0, 0] });
     * ```
     */
    rotationCenterZ(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationZ(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation from three angles about a center point: yaw turns about Y, pitch about X
     * and roll about Z, in degrees. The result is three matrices applied in order: move the center
     * to the origin, rotate, move back.
     * @param inputs - The yaw, pitch and roll in degrees and the center
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname yaw pitch roll
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.babylon.transforms.rotationCenterYawPitchRoll({ yaw: 90, pitch: 0, roll: 0, center: [0, 0, 0] });
     * ```
     */
    rotationCenterYawPitchRoll(inputs: Inputs.BabylonTransforms.RotationCenterYawPitchRollDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationYawPitchRoll(
                BABYLON.Angle.FromDegrees(inputs.yaw).radians(),
                BABYLON.Angle.FromDegrees(inputs.pitch).radians(),
                BABYLON.Angle.FromDegrees(inputs.roll).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale with its own factor per axis, measured from a center point that stays in
     * place, as three matrices applied in order: move the center to the origin, scale, move back.
     * @param inputs - The center and the factor for each axis
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center xyz
     * @drawable false
     * @example
     * ```typescript
     * const stretch = bitbybit.babylon.transforms.scaleCenterXYZ({ center: [5, 5, 5], scaleXyz: [2, 1, 0.5] });
     * ```
     */
    scaleCenterXYZ(inputs: Inputs.BabylonTransforms.ScaleCenterXYZDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale with its own factor per axis, measured from the origin; `[2, 3, 1]` doubles X,
     * triples Y and keeps Z.
     * @param inputs - The factor for each axis
     * @returns A list with the one scale matrix
     * @group scale
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const stretch = bitbybit.babylon.transforms.scaleXYZ({ scaleXyz: [2, 3, 1] });
     * ```
     */
    scaleXYZ(inputs: Inputs.BabylonTransforms.ScaleXYZDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).asArray()]] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale by the same factor on every axis, measured from the origin, so 2 makes
     * everything twice as big and twice as far from the origin.
     * @param inputs - The factor
     * @returns A list with the one scale matrix
     * @group scale
     * @shortname uniform
     * @drawable false
     * @example
     * ```typescript
     * const double = bitbybit.babylon.transforms.uniformScale({ scale: 2 });
     * ```
     */
    uniformScale(inputs: Inputs.BabylonTransforms.UniformScaleDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).asArray()]] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale by the same factor on every axis, measured from a center point that stays in
     * place, as three matrices applied in order: move the center to the origin, scale, move back.
     * @param inputs - The factor and the center
     * @returns The list of matrices to apply in order
     * @group scale
     * @shortname uniform from center
     * @drawable false
     * @example
     * ```typescript
     * const half = bitbybit.babylon.transforms.uniformScaleFromCenter({ scale: 0.5, center: [5, 5, 5] });
     * ```
     */
    uniformScaleFromCenter(inputs: Inputs.BabylonTransforms.UniformScaleFromCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a move by a vector; `[10, 5, 0]` moves 10 along X, 5 along Y and nothing along Z.
     * @param inputs - The vector to move by
     * @returns A list with the one translation matrix
     * @group translation
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const move = bitbybit.babylon.transforms.translationXYZ({ translation: [10, 5, 0] });
     * ```
     */
    translationXYZ(inputs: Inputs.BabylonTransforms.TranslationXYZDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Translation(inputs.translation[0], inputs.translation[1], inputs.translation[2]).asArray()]] as Base.TransformMatrixes;
    }

    /**
     * Builds one move per vector, for transforming many objects each by its own vector, in the same
     * order.
     * @param inputs - The vectors to move by
     * @returns One transformation per vector, in the same order
     * @group translations
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const moves = bitbybit.babylon.transforms.translationsXYZ({ translations: [[1, 0, 0], [0, 2, 0]] });
     * ```
     */
    translationsXYZ(inputs: Inputs.BabylonTransforms.TranslationsXYZDto): Base.TransformMatrixes[] {
        return inputs.translations.map(translation => [[...BABYLON.Matrix.Translation(translation[0], translation[1], translation[2]).asArray()]]);
    }

}
