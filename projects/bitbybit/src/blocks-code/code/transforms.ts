import { Injectable } from '@angular/core';
import { Matrix, Vector3, Angle } from '@babylonjs/core';

@Injectable()
/**
 * Contains various methods that create transformations
 */
export class Transforms {

    /**
     * Creates a rotation transformations around the center and an axis
     * @param inputs Rotation around center with an axis information
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
     * @param inputs Rotation around center with an X axis information
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
     * @param inputs Rotation around center with an Y axis information
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
     * @param inputs Rotation around center with an Z axis information
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
     * @param inputs Yaw pitch roll rotation information
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
     * @param inputs Scale center xyz trnansformation
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
     * @param inputs Scale XYZ number array information
     */
    scaleXYZ(inputs: ScaleXYZDto): number[] {
        return Matrix.Scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]).toArray() as number[];
    }

    /**
     * Creates uniform scale transformation
     * @param inputs Scale Dto
     */
    uniformScale(inputs: UniformScaleDto): number[] {
        return Matrix.Scaling(inputs.scale, inputs.scale, inputs.scale).toArray() as number[];
    }

    /**
     * Creates uniform scale transformation from the center
     * @param inputs Scale Dto with center point information
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
     * @param inputs Translation information
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