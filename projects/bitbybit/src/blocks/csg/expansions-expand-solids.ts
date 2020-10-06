import { ALIGN_RIGHT, Block, Blocks, FieldDropdown } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createExpansionsExpandSolidsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_expansions_expand_solids';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Solids')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_expand_solids_input_solids);
            this.appendValueInput('Delta')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_expand_solids_input_delta.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_expand_solids_input_segments.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_expansions_expand_solids_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            solids: JavaScript.valueToCode(block, 'Solids', JavaScript.ORDER_ATOMIC),
            delta: JavaScript.valueToCode(block, 'Delta', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solids, resources.block_delta, resources.block_segments
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const result = BitByBit.CSG.expansions.expand({
                delta: inputs.delta,
                corners: 'round',
                segments: inputs.segments,
            }, ...inputs.solids);
            return result;
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
            getRequired(resources, resources.block_solids),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_delta),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}
