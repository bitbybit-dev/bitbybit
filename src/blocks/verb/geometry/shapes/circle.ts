import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createShapesCircleBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_circle';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_shape_circle_center);
            this.appendValueInput('XAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_shape_x_axis);
            this.appendValueInput('YAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_shape_y_axis);
            this.appendValueInput('Radius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_radius);
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            xAxis: JavaScript.valueToCode(block, 'XAxis', JavaScript.ORDER_ATOMIC),
            yAxis: JavaScript.valueToCode(block, 'YAxis', JavaScript.ORDER_ATOMIC),
            radius: JavaScript.valueToCode(block, 'Radius', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center,
            resources.block_base_geometry_shape_x_axis,
            resources.block_base_geometry_shape_y_axis,
            resources.block_radius
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        // const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        // (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return new verb.geom.Circle(inputs.center, inputs.xAxis, inputs.yAxis, inputs.radius);`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}

// function makeRuntimeValidationModel(
//     resources: ResourcesInterface,
//     keys: string[]
// ): ValidationEntityInterface[] {

//     return [{
//         entity: keys[0],
//         validations: [
//             getRequired(resources, resources.block_points),
//         ]
//     }];
// }
