import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';

export function createGroupListElementsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_lists_group_list_elements';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('List')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_lists_group_list_elements_input_list);
            this.appendValueInput('NumberOfElements')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_lists_group_list_elements_input_number_of_elements.toLowerCase());
            this.appendValueInput('Segmented')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_lists_group_list_elements_input_segmented.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_lists_group_list_elements_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            list: (JavaScript as any).valueToCode(block, 'List', (JavaScript as any).ORDER_ATOMIC),
            numberOfElements: (JavaScript as any).valueToCode(block, 'NumberOfElements', (JavaScript as any).ORDER_ATOMIC),
            segmented: (JavaScript as any).valueToCode(block, 'Segmented', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_curve, resources.block_tolerance
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
const grouped = [];
const clonedList = [...inputs.list.reverse()];
let index = 0;
while(clonedList.length > 0)
{
    if(index % inputs.numberOfElements === 0){
        const lastGroup = index !== 0 ? grouped[grouped.length - 1] : [];
        grouped.push(index !== 0 && inputs.segmented ? [lastGroup[lastGroup.length - 1]] : []);
    }
    const groupToFill = grouped[grouped.length - 1];
    groupToFill.push(clonedList.pop());
    if(index === inputs.numberOfElements) {
        groupToFill.push(clonedList.pop());
        index++;
    }
    index++;
}
return grouped;
`
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
            getRequired(resources, resources.block_curve),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_curve),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_curve),
        ]
    }];
}
