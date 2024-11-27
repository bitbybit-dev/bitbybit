
import * as BABYLON from "@babylonjs/core";
import { Base } from "../../inputs/base-inputs";
import * as Inputs from "../../inputs/inputs";

/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations
 * for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */

export class BabylonTransforms {

    /**
     * Creates a rotation transformations around the center and an axis
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center axis
     * @drawable false
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
     * Creates a rotation transformations around the center and an X axis
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center x
     * @drawable false
     */
    rotationCenterX(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationX(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Creates a rotation transformations around the center and an Y axis
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center y
     * @drawable false
     */
    rotationCenterY(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationY(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Creates a rotation transformations around the center and an Z axis
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     * @group rotation
     * @shortname center z
     * @drawable false
     */
    rotationCenterZ(inputs: Inputs.BabylonTransforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.RotationZ(BABYLON.Angle.FromDegrees(inputs.angle).radians()).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Creates a rotation transformations with yaw pitch and roll
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     * @group rotation
     * @shortname yaw pitch roll
     * @drawable false
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
     * Scale transformation around center and xyz directions
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     * @group rotation
     * @shortname center xyz
     * @drawable false
     */
    scaleCenterXYZ(inputs: Inputs.BabylonTransforms.ScaleCenterXYZDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Creates the scale transformation in x, y and z directions
     * @param inputs Scale XYZ number array information
     * @returns transformation
     * @group scale
     * @shortname xyz
     * @drawable false
     */
    scaleXYZ(inputs: Inputs.BabylonTransforms.ScaleXYZDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).asArray()]] as Base.TransformMatrixes;
    }

    /**
     * Creates uniform scale transformation
     * @param inputs Scale Dto
     * @returns transformation
     * @group scale
     * @shortname uniform
     * @drawable false
     */
    uniformScale(inputs: Inputs.BabylonTransforms.UniformScaleDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).asArray()]] as Base.TransformMatrixes;
    }

    /**
     * Creates uniform scale transformation from the center
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     * @group scale
     * @shortname uniform from center
     * @drawable false
     */
    uniformScaleFromCenter(inputs: Inputs.BabylonTransforms.UniformScaleFromCenterDto): Base.TransformMatrixes {
        return [
            [...BABYLON.Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).asArray()],
            [...BABYLON.Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).asArray()],
            [...BABYLON.Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).asArray()],
        ] as Base.TransformMatrixes;
    }

    /**
     * Creates the translation transformation
     * @param inputs Translation information
     * @returns transformation
     * @group translation
     * @shortname xyz
     * @drawable false
     */
    translationXYZ(inputs: Inputs.BabylonTransforms.TranslationXYZDto): Base.TransformMatrixes {
        return [[...BABYLON.Matrix.Translation(inputs.translation[0], inputs.translation[1], inputs.translation[2]).asArray()]] as Base.TransformMatrixes;
    }

    /**
    * Creates the translation transformation
    * @param inputs Translation information
    * @returns transformation
     * @group translations
     * @shortname xyz
     * @drawable false
    */
    translationsXYZ(inputs: Inputs.BabylonTransforms.TranslationsXYZDto): Base.TransformMatrixes[] {
        return inputs.translations.map(translation => [[...BABYLON.Matrix.Translation(translation[0], translation[1], translation[2]).asArray()]]) as Base.TransformMatrixes[];
    }

}
