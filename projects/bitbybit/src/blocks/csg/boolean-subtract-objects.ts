import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { solidConstants } from './solid-constants';
import { environment } from '../../environments/environment';

export function createBooleanSubtractObjectsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_boolean_subtract_objects';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('SubtractObjects')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_subtract_objects_input_objects);
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_jscad_subtract_objects_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidBooleansHelpUrl + '#' + 'subtract');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            objects: (JavaScript as any).valueToCode(block, 'SubtractObjects', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solids
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.jscad.booleans.subtract(inputs);`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_solids),
        ]
    }];
}
