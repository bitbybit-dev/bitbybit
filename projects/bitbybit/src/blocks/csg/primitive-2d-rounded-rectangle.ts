import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitive2dRoundedRectangleBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_rounded_rectangle';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_rounded_rectangle_input_center);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_rounded_rectangle_input_width.toLowerCase());
            this.appendValueInput('Length')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_rounded_rectangle_input_length.toLowerCase());
            this.appendValueInput('RoundRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_rounded_rectangle_input_round_radius.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_rounded_rectangle_input_segments.toLowerCase());
            this.setOutput(true, 'Polygon');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_primitive_2d_rounded_rectangle_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            length: JavaScript.valueToCode(block, 'Length', JavaScript.ORDER_ATOMIC),
            roundRadius: JavaScript.valueToCode(block, 'RoundRadius', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center, resources.block_width, resources.block_length
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const rectangle = BitByBit.CSG.primitives.roundedRectangle({
                center: [inputs.center[0], inputs.center[1]],
                size: [inputs.width, inputs.length],
                roundRadius: inputs.roundRadius,
                segments: inputs.segments,
            });
            return rectangle;
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
            getRequired(resources, resources.block_center),
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
    }];
}
