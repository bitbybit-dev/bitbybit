import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../../validations';

export function createDrawTextTagBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_draw_text_tag';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('TextTag')
                .setCheck('TextTag')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_draw_text_tag_input_text_tag);
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_base_geometry_draw_text_tag_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            textTag: JavaScript.valueToCode(block, 'TextTag', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_text_tag
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            const textNode = document.createElement('span');
            const id = '_tag' + ${new Date().getTime()} + BitByBitBlocklyHelperService.tagBag.length;
            inputs.textTag.id = id;
            textNode.id = id;
            textNode.textContent = inputs.textTag.text;
            document.querySelector('.canvasZone').appendChild(textNode);
            inputs.textTag.needsUpdate = true;
            BitByBitBlocklyHelperService.tagBag.push(inputs.textTag);
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
            getRequired(resources, resources.block_text_tag),
        ]
    }];
}
