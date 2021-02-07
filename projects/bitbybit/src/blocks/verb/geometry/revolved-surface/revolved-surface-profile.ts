import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { revolvedSurfaceConstants } from './revolved-surface-constants';

export function createRevolvedSurfaceProfileBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_revolved_surface_profile';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Revolution')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_revolved_surface_profile_input_revolution);
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_revolved_surface_profile_description);
            this.setHelpUrl(environment.docsUrl + revolvedSurfaceConstants.helpUrl + '#' + 'profile');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            revolution: (JavaScript as any).valueToCode(block, 'Revolution', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_revolution
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.verb.surface.revolved.profile(inputs);`
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
            getRequired(resources, resources.block_revolution),
        ]
    }];
}
