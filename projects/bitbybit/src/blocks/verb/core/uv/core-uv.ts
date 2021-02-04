import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { uvConstants } from './uv-constants';

export function createCoreUVBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_core_uv';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('U')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_uv_input_u);
            this.appendValueInput('V')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_core_uv_input_v);
            this.setOutput(true, 'UV');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_core_uv_description);
            this.setHelpUrl(environment.docsUrl + uvConstants.helpUrl);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            u: (JavaScript as any).valueToCode(block, 'U', (JavaScript as any).ORDER_ATOMIC),
            v: (JavaScript as any).valueToCode(block, 'V', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_u, resources.block_v
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return {u: inputs.u, v: inputs.v};`);
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
            getRequired(resources, resources.block_u),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_v),
        ]
    }];
}
