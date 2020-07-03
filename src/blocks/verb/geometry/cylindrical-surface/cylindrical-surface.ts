import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCylindricalSurfaceBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_cylindrical_surface';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Axis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_cylindrical_surface_input_axis);
            this.appendValueInput('XAxis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_cylindrical_surface_input_x_axis.toLowerCase());
            this.appendValueInput('Base')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_cylindrical_surface_input_base.toLowerCase());
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_cylindrical_surface_input_height.toLowerCase());
            this.appendValueInput('Radius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_cylindrical_surface_input_radius.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_cylindrical_surface_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            axis: JavaScript.valueToCode(block, 'Axis', JavaScript.ORDER_ATOMIC),
            xAxis: JavaScript.valueToCode(block, 'XAxis', JavaScript.ORDER_ATOMIC),
            base: JavaScript.valueToCode(block, 'Base', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
            radius: JavaScript.valueToCode(block, 'Radius', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_axis, resources.block_x_axis, resources.block_base, resources.block_height, resources.block_radius
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return new verb.geom.CylindricalSurface(inputs.axis, inputs.xAxis, inputs.base, inputs.height, inputs.radius);`
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
            getRequired(resources, resources.block_axis),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_x_axis),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_base),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_radius),
        ]
    }];
}
