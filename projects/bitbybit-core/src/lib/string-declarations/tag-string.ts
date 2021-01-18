import { simplifyDeclaration } from './simplify-declaration';

export const tagString = simplifyDeclaration(`
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';
/**
 * Tags help you to put text on top of your 3D objects. Tags are heavily used in data visualization scenarios
 * where you need to convery additional textual information.
 */
export declare class Tag {
    /**
     * Creates a tag dto
     * <div>
     *  <img src="../assets/images/blockly-images/tag/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#create
     * @param inputs Tag description
     * @returns A tag
     */
    create(inputs: BaseTypes.TagDto): BaseTypes.TagDto;
    /**
     * Draws a single tag
     * <div>
     *  <img src="../assets/images/blockly-images/tag/drawTag.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtag
     * @param inputs Information to draw the tag
     * @returns A tag
     */
    drawTag(inputs: Inputs.Tag.DrawTagDto): BaseTypes.TagDto;
    /**
     * Draws multiple tags
     * <div>
     *  <img src="../assets/images/blockly-images/tag/drawTags.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtags
     * @param inputs Information to draw the tags
     * @returns Tags
     */
    drawTags(inputs: Inputs.Tag.DrawTagsDto): BaseTypes.TagDto[];
}
`);
