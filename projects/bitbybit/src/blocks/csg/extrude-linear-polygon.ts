import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

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
            this.setHelpUrl(environment.docsUrl + solidConstants.solidExtrusionsHelpUrl + '#' + 'extrudelinear');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            geometry: (JavaScript as any).valueToCode(block, 'Polygon', (JavaScript as any).ORDER_ATOMIC),
            height: (JavaScript as any).valueToCode(block, 'Height', (JavaScript as any).ORDER_ATOMIC),
            twistAngle: (JavaScript as any).valueToCode(block, 'TwistAngle', (JavaScript as any).ORDER_ATOMIC),
            twistSteps: (JavaScript as any).valueToCode(block, 'TwistSteps', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polygon, resources.block_height, resources.block_angle, resources.block_steps
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.extrusions.extrudeLinear(inputs);`
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
