import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sweptSurfaceConstants } from './swept-surface-constants';

export function createSweptSurfaceBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_swept_surface';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Profile')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_swept_surface_input_profile);
            this.appendValueInput('Rail')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_swept_surface_input_rail.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_swept_surface_description);
            this.setHelpUrl(environment.docsUrl + sweptSurfaceConstants.helpUrl + '#' + 'create');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            profile: (JavaScript as any).valueToCode(block, 'Profile', (JavaScript as any).ORDER_ATOMIC),
            rail: (JavaScript as any).valueToCode(block, 'Rail', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_profile, resources.block_rail
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.surface.sweep.create(inputs);`
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
            getRequired(resources, resources.block_rail),
        ]
    }];
}
