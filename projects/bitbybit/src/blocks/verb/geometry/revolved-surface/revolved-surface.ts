import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createRevolvedSurfaceBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_revolved_surface';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Profile')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_revolved_surface_input_profile);
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_revolved_surface_input_center.toLowerCase());
            this.appendValueInput('Axis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_revolved_surface_input_axis.toLowerCase());
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_revolved_surface_input_angle.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_revolved_surface_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            profile: (JavaScript as any).valueToCode(block, 'Profile', (JavaScript as any).ORDER_ATOMIC),
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
            axis: (JavaScript as any).valueToCode(block, 'Axis', (JavaScript as any).ORDER_ATOMIC),
            angle: (JavaScript as any).valueToCode(block, 'Angle', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_profile, resources.block_center, resources.block_axis, resources.block_angle
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return new BitByBit.verb.geom.RevolvedSurface(inputs.profile, inputs.center, inputs.axis, BitByBit.BABYLON.Angle.FromDegrees(inputs.angle).radians())`
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
            getRequired(resources, resources.block_profile),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_center),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_axis),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_angle),
        ]
    }];
}
