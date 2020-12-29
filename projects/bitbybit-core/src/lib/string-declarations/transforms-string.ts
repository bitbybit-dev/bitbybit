import { simplifyDeclaration } from './simplify-declaration';

export const transformsString = simplifyDeclaration(`
import * as Inputs from '../inputs/inputs';
/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations
 * for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */
export declare class Transforms {
    /**
     * Creates a rotation transformations around the center and an axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterAxis.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     */
    rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): number[][];
    /**
     * Creates a rotation transformations around the center and an X axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterX.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     */
    rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Y axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterY.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     */
    rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Z axis
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     */
    rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations with yaw pitch and roll
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/rotationCenterYawPitchRoll.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     */
    rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): number[][];
    /**
     * Scale transformation around center and xyz directions
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/scaleCenterXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     */
    scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): number[][];
    /**
     * Creates the scale transformation in x, y and z directions
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/scaleXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale XYZ number array information
     * @returns transformation
     */
    scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): number[];
    /**
     * Creates uniform scale transformation
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/uniformScale.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale Dto
     * @returns transformation
     */
    uniformScale(inputs: Inputs.Transforms.UniformScaleDto): number[];
    /**
     * Creates uniform scale transformation from the center
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/uniformScaleFromCenter.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     */
    uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): number[][];
    /**
     * Creates the translation transformation
     * <div>
     *  <img src="../assets/images/blockly-images/transforms/translationXYZ.png" alt="Blockly Image"/>
     * </div>
     * @param inputs Translation information
     * @returns transformation
     */
    translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): number[];
}
`);
