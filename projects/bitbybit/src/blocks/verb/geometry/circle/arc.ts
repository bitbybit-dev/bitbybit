import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { circleConstants } from './circle-constants';

export function createArcBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_arc';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_center);
            this.appendValueInput('XAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_x_axis.toLowerCase());
            this.appendValueInput('YAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_y_axis.toLowerCase());
            this.appendValueInput('Radius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_radius.toLowerCase());
            this.appendValueInput('MinAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_min_angle.toLowerCase());
            this.appendValueInput('MaxAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_arc_input_max_angle.toLowerCase());
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_arc_description);
            this.setHelpUrl(environment.docsUrl + circleConstants.helpUrl + '#' + 'createarc');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
            xAxis: (JavaScript as any).valueToCode(block, 'XAxis', (JavaScript as any).ORDER_ATOMIC),
            yAxis: (JavaScript as any).valueToCode(block, 'YAxis', (JavaScript as any).ORDER_ATOMIC),
            radius: (JavaScript as any).valueToCode(block, 'Radius', (JavaScript as any).ORDER_ATOMIC),
            minAngle: (JavaScript as any).valueToCode(block, 'MinAngle', (JavaScript as any).ORDER_ATOMIC),
            maxAngle: (JavaScript as any).valueToCode(block, 'MaxAngle', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center,
            resources.block_x_axis,
            resources.block_y_axis,
            resources.block_radius,
            resources.block_min_angle,
            resources.block_max_angle,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.verb.curve.circle.createArc(inputs);`
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
            getRequired(resources, resources.block_center),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_x_axis),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_y_axis),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_radius),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_min_angle),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_max_angle),
        ]
    }];
}
