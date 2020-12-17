import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createExtrudedSurfaceBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_extruded_surface';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Profile')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_extruded_surface_input_profile);
            this.appendValueInput('Direction')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_extruded_surface_input_direction.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_extruded_surface_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            profile: (JavaScript as any).valueToCode(block, 'Profile', (JavaScript as any).ORDER_ATOMIC),
            direction: (JavaScript as any).valueToCode(block, 'Direction', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_profile, resources.block_direction
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return new BitByBit.verb.geom.ExtrudedSurface(inputs.profile, inputs.direction);`
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
            getRequired(resources, resources.block_direction),
        ]
    }];
}
