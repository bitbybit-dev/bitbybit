import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sceneConstants } from './scene-constants';
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
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'backgroundcolour');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_colour
        ]));

        return createStandardContextIIFE(block, blockSelector, inputs, false, `bitbybit.scene.backgroundColour(inputs);`);
    };
}
