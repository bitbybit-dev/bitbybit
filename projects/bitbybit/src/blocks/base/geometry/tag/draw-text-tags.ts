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
import { environment } from 'projects/bitbybit/src/environments/environment';
import { tagConstants } from './tag-constants';

export function createDrawTextTagsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_draw_text_tags';

    Blocks[blockSelector] = {
        init(): void {
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
            this.setHelpUrl(environment.docsUrl + tagConstants.helpUrl + '#' + 'drawtags');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            tags: (JavaScript as any).valueToCode(block, 'TextTags', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_text_tags, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.tagsVariable = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnTextTags'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnTextTags'), VARIABLE_CATEGORY_NAME)} = bitbybit.tag.drawTags(inputs);`);
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
