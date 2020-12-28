import { Injectable } from '@angular/core';
import { Matrix, Vector3, Angle } from '@babylonjs/core';

/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */
@Injectable()
export class Transforms {

    /**
     * Creates a rotation transformations around the center and an axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterAxis.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     */
    rotationCenterAxis(inputs: RotationCenterAxisDto): number[][] {
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
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterX.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     */
    rotationCenterX(inputs: RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationX(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations around the center and an Y axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterY.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     */
    rotationCenterY(inputs: RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationY(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations around the center and an Z axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     */
    rotationCenterZ(inputs: RotationCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.RotationZ(Angle.FromDegrees(inputs.angle).radians()).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates a rotation transformations with yaw pitch and roll
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterYawPitchRoll.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     */
    rotationCenterYawPitchRoll(inputs: RotationCenterYawPitchRollDto): number[][] {
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
     *  <img src="../assets/images/blockly-images/transforms/scaleCenterXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     */
    scaleCenterXYZ(inputs: ScaleCenterXYZDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates the scale transformation in x, y and z directions
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/scaleXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale XYZ number array information
     * @returns transformation
     */
    scaleXYZ(inputs: ScaleXYZDto): number[] {
        return Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).toArray() as number[];
    }

    /**
     * Creates uniform scale transformation
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/uniformScale.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale Dto
     * @returns transformation
     */
    uniformScale(inputs: UniformScaleDto): number[] {
        return Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).toArray() as number[];
    }

    /**
     * Creates uniform scale transformation from the center
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/uniformScaleFromCenter.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     */
    uniformScaleFromCenter(inputs: UniformScaleFromCenterDto): number[][] {
        return [
            Matrix.Translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]).toArray() as number[],
            Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).toArray() as number[],
            Matrix.Translation(inputs.center[0], inputs.center[1], inputs.center[2]).toArray() as number[],
        ];
    }

    /**
     * Creates the translation transformation
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/translationXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Translation information
     * @returns transformation
     */
    translationXYZ(inputs: TranslationXYZDto): number[] {
        return Matrix.Translation(inputs.translation[0], inputs.translation[1], inputs.translation[2]).toArray() as number[];
    }

}

interface RotationCenterAxisDto {
    angle: number;
    axis: number[];
    center: number[];
}

interface RotationCenterDto {
    angle: number;
    center: number[];
}

interface RotationCenterYawPitchRollDto {
    yaw: number;
    pitch: number;
    roll: number;
    center: number[];
}

interface ScaleXYZDto {
    scaleXyz: number[];
}

interface ScaleCenterXYZDto {
    center: number[];
    scaleXyz: number[];
}

interface UniformScaleDto {
    scale: number;
}

interface UniformScaleFromCenterDto {
    scale: number;
    center: number[];
}

interface TranslationXYZDto {
    translation: number[];
}