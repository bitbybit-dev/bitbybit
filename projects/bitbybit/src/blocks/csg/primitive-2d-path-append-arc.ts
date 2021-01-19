import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

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
            this.appendValueInput('RadiusY')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_append_arc_input_radius_y.toLowerCase());
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
            this.setHelpUrl(environment.docsUrl + solidConstants.solidPathHelpUrl + '#' + 'appendarc');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            path: (JavaScript as any).valueToCode(block, 'Path', (JavaScript as any).ORDER_ATOMIC),
            endPoint: (JavaScript as any).valueToCode(block, 'EndPoint', (JavaScript as any).ORDER_ATOMIC),
            radiusX: (JavaScript as any).valueToCode(block, 'RadiusX', (JavaScript as any).ORDER_ATOMIC),
            radiusY: (JavaScript as any).valueToCode(block, 'RadiusY', (JavaScript as any).ORDER_ATOMIC),
            xAxisRotation: (JavaScript as any).valueToCode(block, 'XAxisRotation', (JavaScript as any).ORDER_ATOMIC),
            clockwise: (JavaScript as any).valueToCode(block, 'Clockwise', (JavaScript as any).ORDER_ATOMIC),
            large: (JavaScript as any).valueToCode(block, 'Large', (JavaScript as any).ORDER_ATOMIC),
            segments: (JavaScript as any).valueToCode(block, 'Segments', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_2d_path, resources.block_point, resources.block_radius_x, resources.block_radius_y,
            resources.block_x_axis_rotation, resources.block_clockwise,
            resources.block_large, resources.block_segments
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.path.appendArc(inputs);`
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
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_point),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_radius_x),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_radius_y),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_x_axis_rotation),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_clockwise),
        ]
    }, {
        entity: keys[6],
        validations: [
            getRequired(resources, resources.block_large),
        ]
    }, {
        entity: keys[7],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}
