
import * as BABYLON from "@babylonjs/core";
import type { Base } from "../../inputs/base-inputs";
import * as Inputs from "../../inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../resolved-inputs";

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
        const resolved = resolveDto(Inputs.BabylonTransforms.RotationCenterAxisDto, inputs) as Resolved.BabylonTransforms.RotationCenterAxisDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.RotationAxis(
                new BABYLON.Vector3(resolved.axis[0], resolved.axis[1], resolved.axis[2]),
                BABYLON.Angle.FromDegrees(resolved.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.RotationCenterDto, inputs) as Resolved.BabylonTransforms.RotationCenterDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.RotationX(BABYLON.Angle.FromDegrees(resolved.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.RotationCenterDto, inputs) as Resolved.BabylonTransforms.RotationCenterDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.RotationY(BABYLON.Angle.FromDegrees(resolved.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.RotationCenterDto, inputs) as Resolved.BabylonTransforms.RotationCenterDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.RotationZ(BABYLON.Angle.FromDegrees(resolved.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.RotationCenterYawPitchRollDto, inputs) as Resolved.BabylonTransforms.RotationCenterYawPitchRollDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.RotationYawPitchRoll(
                BABYLON.Angle.FromDegrees(resolved.yaw).radians(),
                BABYLON.Angle.FromDegrees(resolved.pitch).radians(),
                BABYLON.Angle.FromDegrees(resolved.roll).radians()).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.ScaleCenterXYZDto, inputs) as Resolved.BabylonTransforms.ScaleCenterXYZDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(resolved.scaleXyz[0], resolved.scaleXyz[1], resolved.scaleXyz[2]).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.ScaleXYZDto, inputs) as Resolved.BabylonTransforms.ScaleXYZDto;
        return [[...BABYLON.Matrix.Scaling(resolved.scaleXyz[0], resolved.scaleXyz[1], resolved.scaleXyz[2]).asArray()]] as Base.TransformMatrixes;
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
        const resolved = resolveDto(Inputs.BabylonTransforms.UniformScaleDto, inputs) as Resolved.BabylonTransforms.UniformScaleDto;
        return [[...BABYLON.Matrix.Scaling(resolved.scale, resolved.scale, resolved.scale).asArray()]] as Base.TransformMatrixes;
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
        const resolved = resolveDto(Inputs.BabylonTransforms.UniformScaleFromCenterDto, inputs) as Resolved.BabylonTransforms.UniformScaleFromCenterDto;
        return [
            [...BABYLON.Matrix.Translation(-resolved.center[0], -resolved.center[1], -resolved.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(resolved.scale, resolved.scale, resolved.scale).asArray()],
            [...BABYLON.Matrix.Translation(resolved.center[0], resolved.center[1], resolved.center[2]).asArray()],
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
        const resolved = resolveDto(Inputs.BabylonTransforms.TranslationXYZDto, inputs) as Resolved.BabylonTransforms.TranslationXYZDto;
        return [[...BABYLON.Matrix.Translation(resolved.translation[0], resolved.translation[1], resolved.translation[2]).asArray()]] as Base.TransformMatrixes;
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
