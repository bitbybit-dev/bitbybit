import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { extrudedSurfaceConstants } from './extruded-surface-constants';

export function createExtrudedSurfaceProfileBlocks(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_extruded_surface_profile';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Extrusion')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_extruded_surface_profile_input_extrusion);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_extruded_surface_profile_description);
            this.setHelpUrl(environment.docsUrl + extrudedSurfaceConstants.helpUrl + '#' + 'profile');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            extrusion: (JavaScript as any).valueToCode(block, 'Extrusion', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_extrusion
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.surface.extrusion.profile(inputs);`
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
            getRequired(resources, resources.block_extrusion),
        ]
    }];
}
