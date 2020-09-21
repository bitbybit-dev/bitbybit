import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../../validations';

export function createDrawTextTagsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_draw_text_tags';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('TextTags')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_draw_text_tags_input_text_tags)
                .appendField(new FieldVariable(resources.block_base_geometry_draw_text_tags_input_text_tags_variable), 'DrawnTextTags');
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_geometry_draw_text_tags_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            textTags: JavaScript.valueToCode(block, 'TextTags', JavaScript.ORDER_ATOMIC),
            updatable: JavaScript.valueToCode(block, 'Updatable', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_text_tags, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.tagsVariable = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnTextTags'), VARIABLE_CATEGORY_NAME)};

            if(inputs.tagsVariable && inputs.updatable) {

                // check if list has grown, and add new empty tags to tags variable so that
                if(inputs.tagsVariable < inputs.textTags) {
                    for(let i = inputs.tagsVariable.length - 1; i < inputs.textTags.length - 1; i++){
                        const tagToCreate = inputs.textTags[i];
                        const textNode = document.createElement('span');
                        const id = '_tag' + ${new Date().getTime()} + BitByBit.BitByBitBlocklyHelperService.tagBag.length;
                        tagToCreate.id = id;
                        textNode.id = id;
                        document.querySelector('.canvasZone').appendChild(textNode);
                        tagToCreate.needsUpdate = true;
                        BitByBit.BitByBitBlocklyHelperService.tagBag.push(tagToCreate);
                        inputs.tagsVariable.push(tagToCreate);
                    }
                }

                inputs.tagsVariable.forEach((tagFromVar, index) => {
                    const tagToUpdate = BitByBit.BitByBitBlocklyHelperService.tagBag.find(tag => tag.id === tagFromVar.id);
                    const tagToUpdateWith = inputs.textTags[index];
                    if(tagToUpdateWith){
                        Object.keys(tagToUpdateWith).forEach(key => {
                            tagToUpdate[key] = tagToUpdateWith[key];
                        });
                        tagToUpdate.needsUpdate = true;
                    } else {
                        // delete tag
                        BitByBit.BitByBitBlocklyHelperService.tagBag = BitByBit.BitByBitBlocklyHelperService.tagBag.filter(tag => tag.id !== tagToUpdate.id)
                        const element = document.getElementById(tagToUpdate.id);
                        element.parentNode.removeChild(element);
                    }
                });
            } else {
                const tagsToCreate = [];
                inputs.textTags.forEach((tag, index) => {
                    const textNode = document.createElement('span');
                    const id = '_tag' + ${new Date().getTime()} + BitByBit.BitByBitBlocklyHelperService.tagBag.length;
                    tag.id = id;
                    textNode.id = id;
                    textNode.textContent = tag.text;
                    document.querySelector('.canvasZone').appendChild(textNode);
                    tag.needsUpdate = true;
                    BitByBit.BitByBitBlocklyHelperService.tagBag.push(tag);
                    tagsToCreate.push(tag);
                });
                ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnTextTags'), VARIABLE_CATEGORY_NAME)} = tagsToCreate;
            }

`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_text_tags),
        ]
    }];
}
