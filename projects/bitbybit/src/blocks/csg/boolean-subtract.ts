import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

export function createBooleanSubtractBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_boolean_subtract';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('SubtractObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_subtract_input_subtract_object);
            this.appendValueInput('SubtractFromObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_subtract_input_subtract_from_object.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_jscad_subtract_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidBooleansHelpUrl + '#' + 'subtract');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            subtractObject: (JavaScript as any).valueToCode(block, 'SubtractObject', (JavaScript as any).ORDER_ATOMIC),
            subtractFromObject: (JavaScript as any).valueToCode(block, 'SubtractFromObject', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solid, resources.block_solid
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.jscad.booleans.subtract({objects: [inputs.subtractFromObject, inputs.subtractObject]});`
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
            getRequired(resources, resources.block_solid),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_solid),
        ]
    }];
}
