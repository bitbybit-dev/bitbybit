import { Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';
export function createSceneBackgroundColourBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_scene_background_colour';

    Blocks[blockSelector] = {
        init() {
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
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_colour
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
`
        scene.clearColor = BABYLON.Color3.FromHexString(inputs.colour);
`
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [
    {
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    }];
}
