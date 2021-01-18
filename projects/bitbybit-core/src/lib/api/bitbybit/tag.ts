import { Injectable } from '@angular/core';
import { Matrix, Vector3, Angle, Mesh } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';
import { TagInterface } from '../../models/tag.interface';
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';

/**
 * Tags help you to put text on top of your 3D objects. Tags are heavily used in data visualization scenarios
 * where you need to convery additional textual information.
 */
@Injectable()
export class Tag {

    /**
     * Creates a tag dto
     * <div>
     *  <img src="../assets/images/blockly-images/tag/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#create
     * @param inputs Tag description
     * @returns A tag
     */
    create(inputs: Inputs.Tag.TagDto): Inputs.Tag.TagDto {
        const tag = new Inputs.Tag.TagDto();
        tag.text = inputs.text;
        tag.position = inputs.position;
        tag.colour = inputs.colour;
        tag.size = inputs.size;
        tag.adaptDepth = inputs.adaptDepth;
        return tag;
    }

    /**
     * Draws a single tag
     * <div>
     *  <img src="../assets/images/blockly-images/tag/drawTag.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtag
     * @param inputs Information to draw the tag
     * @returns A tag
     */
    drawTag(inputs: Inputs.Tag.DrawTagDto): Inputs.Tag.TagDto {
        if (inputs.tagVariable && inputs.updatable) {
            const tagToUpdate = BitByBitBlocklyHelperService.tagBag.find(tag => tag.id === inputs.tagVariable.id);
            Object.keys(inputs.tag).forEach(key => {
                tagToUpdate[key] = inputs.tag[key];
            });
            tagToUpdate.needsUpdate = true;
        } else {
            const textNode = document.createElement('span');
            const id = '_tag' + new Date().getTime() + BitByBitBlocklyHelperService.tagBag.length;
            inputs.tag.id = id;
            textNode.id = id;
            textNode.textContent = inputs.tag.text;
            document.querySelector('.canvasZone').appendChild(textNode);
            inputs.tag.needsUpdate = true;
            BitByBitBlocklyHelperService.tagBag.push(inputs.tag);
        }
        return inputs.tag;
    }

    /**
     * Draws multiple tags
     * <div>
     *  <img src="../assets/images/blockly-images/tag/drawTags.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtags
     * @param inputs Information to draw the tags
     * @returns Tags
     */
    drawTags(inputs: Inputs.Tag.DrawTagsDto): Inputs.Tag.TagDto[] {
        if (inputs.tagsVariable && inputs.updatable) {

            // check if list has grown, and add new empty tags to tags variable so that
            if (inputs.tagsVariable.length < inputs.tags.length) {
                for (let i = inputs.tagsVariable.length - 1; i < inputs.tags.length - 1; i++) {
                    const tagToCreate = inputs.tags[i];
                    const textNode = document.createElement('span');
                    const id = '_tag' + new Date().getTime() + BitByBitBlocklyHelperService.tagBag.length;
                    tagToCreate.id = id;
                    textNode.id = id;
                    document.querySelector('.canvasZone').appendChild(textNode);
                    tagToCreate.needsUpdate = true;
                    BitByBitBlocklyHelperService.tagBag.push(tagToCreate);
                    inputs.tagsVariable.push(tagToCreate);
                }
            }

            inputs.tagsVariable.forEach((tagFromVar, index) => {
                const tagToUpdate = BitByBitBlocklyHelperService.tagBag.find(tag => tag.id === tagFromVar.id);
                const tagToUpdateWith = inputs.tags[index];
                if (tagToUpdateWith) {
                    Object.keys(tagToUpdateWith).forEach(key => {
                        tagToUpdate[key] = tagToUpdateWith[key];
                    });
                    tagToUpdate.needsUpdate = true;
                } else {
                    // delete tag
                    BitByBitBlocklyHelperService.tagBag = BitByBitBlocklyHelperService.tagBag.filter(tag => tag.id !== tagToUpdate.id);
                    const element = document.getElementById(tagToUpdate.id);
                    element.parentNode.removeChild(element);
                }
            });
        } else {
            const tagsToCreate = [];
            inputs.tags.forEach((tag, index) => {
                const textNode = document.createElement('span');
                const id = '_tag' + new Date().getTime() + BitByBitBlocklyHelperService.tagBag.length;
                tag.id = id;
                textNode.id = id;
                textNode.textContent = tag.text;
                document.querySelector('.canvasZone').appendChild(textNode);
                tag.needsUpdate = true;
                BitByBitBlocklyHelperService.tagBag.push(tag);
                tagsToCreate.push(tag);
                inputs.tagsVariable = tagsToCreate;
            });
        }
        return inputs.tagsVariable;
    }
}
