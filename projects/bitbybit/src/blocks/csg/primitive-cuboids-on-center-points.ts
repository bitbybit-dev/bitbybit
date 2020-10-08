import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitiveCuboidsOnCenterPointsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_cuboids_on_center_points';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Centers')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cuboids_on_center_points_input_centers);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cuboids_on_center_points_input_width.toLowerCase());
            this.appendValueInput('Length')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cuboids_on_center_points_input_length.toLowerCase());
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cuboids_on_center_points_input_height.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_cuboids_on_center_points_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            centers: JavaScript.valueToCode(block, 'Centers', JavaScript.ORDER_ATOMIC),
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            length: JavaScript.valueToCode(block, 'Length', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_centers, resources.block_width, resources.block_length, resources.block_height
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return inputs.centers.map(center => {
                return BitByBit.CSG.primitives.cuboid({center: [center[0], center[1], center[2]], size: [inputs.width, inputs.height, inputs.length]});
            });
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
            getRequired(resources, resources.block_centers),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_width),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_length),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }];
}
