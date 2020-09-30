import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createExtrudeLinearPolygonBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_extrude_linear_polygon';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polygon')
                .setCheck('Polygon')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_linear_polygon_input_polygon);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_linear_polygon_input_height.toLowerCase());
            this.appendValueInput('TwistAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_linear_polygon_input_twist_angle.toLowerCase());
            this.appendValueInput('TwistSteps')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_linear_polygon_input_twist_steps.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_extrude_linear_polygon_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polygon: JavaScript.valueToCode(block, 'Polygon', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
            twistAngle: JavaScript.valueToCode(block, 'TwistAngle', JavaScript.ORDER_ATOMIC),
            twistSteps: JavaScript.valueToCode(block, 'TwistSteps', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polygon, resources.block_height, resources.block_angle, resources.block_steps
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const extrusion = BitByBit.CSG.extrusions.extrudeLinear({height: inputs.height, twistAngle: BitByBit.BABYLON.Angle.FromDegrees(inputs.twistAngle).radians(), twistSteps: inputs.twistSteps}, inputs.polygon);
            return extrusion;
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
            getRequired(resources, resources.block_polygon),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_angle),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_steps),
        ]
    }];
}
