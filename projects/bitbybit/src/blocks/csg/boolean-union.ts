import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createBooleanUnionBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_boolean_union';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('UnionObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_union_input_union_object);
            this.appendValueInput('WithObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_union_input_with_object.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_union_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            unionObject: JavaScript.valueToCode(block, 'UnionObject', JavaScript.ORDER_ATOMIC),
            withObject: JavaScript.valueToCode(block, 'WithObject', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solid, resources.block_solid
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const union = BitByBit.CSG.booleans.union(inputs.unionObject, inputs.withObject);
            return union;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
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
