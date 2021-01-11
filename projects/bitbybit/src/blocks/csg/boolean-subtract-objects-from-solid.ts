import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createBooleanSubtractObjectsFromSolidBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_boolean_subtract_objects_from_solid';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('SubtractObjects')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_subtract_objects_from_solid_input_objects);
            this.appendValueInput('Solid')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_subtract_objects_from_solid_input_solid.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_subtract_objects_from_solid_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            subtractObjects: (JavaScript as any).valueToCode(block, 'SubtractObjects', (JavaScript as any).ORDER_ATOMIC),
            solid: (JavaScript as any).valueToCode(block, 'Solid', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solids, resources.block_solid
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.booleans.subtract({objects: [inputs.solid, ...inputs.subtractObjects]});`
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
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_solid),
        ]
    }];
}
