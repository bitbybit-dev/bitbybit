import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitive2dPathAppendArcBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_path_append_arc';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Path')
                .setCheck('Path')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_path);
            this.appendValueInput('EndPoint')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_end_point.toLowerCase());
            this.appendValueInput('RadiusX')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_radius_x.toLowerCase());
            this.appendValueInput('RadiusZ')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_radius_z.toLowerCase());
            this.appendValueInput('XAxisRotation')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_x_axis_rotation.toLowerCase());
            this.appendValueInput('Clockwise')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_clockwise.toLowerCase());
            this.appendValueInput('Large')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_large.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_segments.toLowerCase());
            this.setOutput(true, 'Path');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_primitive_2d_path_append_arc_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            path: JavaScript.valueToCode(block, 'Path', JavaScript.ORDER_ATOMIC),
            endPoint: JavaScript.valueToCode(block, 'EndPoint', JavaScript.ORDER_ATOMIC),
            radiusX: JavaScript.valueToCode(block, 'RadiusX', JavaScript.ORDER_ATOMIC),
            radiusZ: JavaScript.valueToCode(block, 'RadiusZ', JavaScript.ORDER_ATOMIC),
            xAxisRotation: JavaScript.valueToCode(block, 'XAxisRotation', JavaScript.ORDER_ATOMIC),
            clockwise: JavaScript.valueToCode(block, 'Clockwise', JavaScript.ORDER_ATOMIC),
            large: JavaScript.valueToCode(block, 'Large', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_2d_path, resources.block_points
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const endpoint = [inputs.endPoint[0], inputs.endPoint[2]];
            const radius = [inputs.radiusX, inputs.radiusZ];
            return BitByBit.CSG.geometries.path2.appendArc({
                endpoint,
                radius,
                xaxisrotation: inputs.xAxisRotation,
                clockwise: inputs.clockwise,
                large: inputs.large,
                segments: inputs.segments,
            }, inputs.path);
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
            getRequired(resources, resources.block_2d_path),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_points),
        ]
    }];
}
