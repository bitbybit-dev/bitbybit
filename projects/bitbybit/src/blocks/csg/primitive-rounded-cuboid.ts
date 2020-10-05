import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitiveRoundedCuboidBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_rounded_cuboid';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_center);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_width.toLowerCase());
            this.appendValueInput('Length')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_length.toLowerCase());
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_height.toLowerCase());
            this.appendValueInput('RoundRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_round_radius.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_rounded_cuboid_input_segments.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_rounded_cuboid_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            length: JavaScript.valueToCode(block, 'Length', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
            roundRadius: JavaScript.valueToCode(block, 'RoundRadius', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center, resources.block_width, resources.block_length,
            resources.block_height, resources.block_round_radius, resources.block_segments
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const roundedCuboid = BitByBit.CSG.primitives.roundedCuboid({
                center: [inputs.center[0], inputs.center[2], inputs.center[1]],
                size: [inputs.width, inputs.length, inputs.height],
                roundRadius: inputs.roundRadius,
                segments: inputs.segments,
            });
            return roundedCuboid;
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
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_round_radius),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}