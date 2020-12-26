import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';
export function createSceneBackgroundColourBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_scene_background_colour';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .appendField(resources.block_babylon_input_scene_background_colour);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_scene_background_colour_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_colour
        ]));

        return createStandardContextIIFE(block, blockSelector, inputs, false, `bitbybit.scene.backgroundColour(inputs);`);
    };
}
