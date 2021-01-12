import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitive2dPathCloseBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_path_close';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Path')
                .setCheck('Path')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_close_input_close);
            this.setOutput(true, 'Path');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_primitive_2d_path_close_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            path: (JavaScript as any).valueToCode(block, 'Path', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_2d_path
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.path.close(inputs);`
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
            getRequired(resources, resources.block_2d_path),
        ]
    }];
}
