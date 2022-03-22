
import { Matrix, Vector3, Angle } from '@babylonjs/core';
import * as Inputs from '../../inputs/inputs';

/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations
 * for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */

export class BabylonTransforms {

    /**
     * Creates a rotation transformations around the center and an axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/rotationCenterAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#rotationCenterAxis
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     */
    rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationAxis(
                new Vector3(inputs.axis[0], inputs.axis[1], inputs.axis[2]),
                Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations around the center and an X axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/rotationCenterX.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#rotationCenterX
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     */
    rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationX(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations around the center and an Y axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/rotationCenterY.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#rotationCenterY
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     */
    rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationY(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations around the center and an Z axis
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/rotationCenterZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#rotationCenterZ
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     */
    rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationZ(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations with yaw pitch and roll
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/rotationCenterYawPitchRoll.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#rotationCenterYawPitchRoll
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     */
    rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationYawPitchRoll(
                Angle.FromDegrees(inputs.yaw).radians(),
                Angle.FromDegrees(inputs.pitch).radians(),
                Angle.FromDegrees(inputs.roll).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Scale transformation around center and xyz directions
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/scaleCenterXYZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#scaleCenterXYZ
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     */
    scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates the scale transformation in x, y and z directions
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/scaleXYZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#scaleXYZ
     * @param inputs Scale XYZ number array information
     * @returns transformation
     */
    scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): number[][] {
        return [Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).toArray() as number[]];
    }

    /**
     * Creates uniform scale transformation
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/uniformScale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#uniformScale
     * @param inputs Scale Dto
     * @returns transformation
     */
    uniformScale(inputs: Inputs.Transforms.UniformScaleDto): number[][] {
        return [Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).toArray() as number[]];
    }

    /**
     * Creates uniform scale transformation from the center
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/uniformScaleFromCenter.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#uniformScaleFromCenter
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     */
    uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates the translation transformation
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/transforms/translationXYZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_transforms.BabylonTransforms.html#translationXYZ
     * @param inputs Translation information
     * @returns transformation
     */
    translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): number[][] {
        return [Matrix.Translation(inputs.translation[0], inputs.translation[1], inputs.translation[2]).toArray() as number[]];
    }

}
