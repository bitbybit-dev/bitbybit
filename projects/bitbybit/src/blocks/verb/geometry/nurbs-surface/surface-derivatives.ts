import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { surfaceConstants } from './surface-constants';

export function createSurfaceDerivativesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_derivatives';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Surface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_derivatives_input_surface);
            this.appendValueInput('U')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_derivatives_input_u.toLowerCase());
            this.appendValueInput('V')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_derivatives_input_v.toLowerCase());
            this.appendValueInput('NumDerivatives')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_derivatives_input_num_derivatives.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_surface_derivatives_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'derivatives');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surface: (JavaScript as any).valueToCode(block, 'Surface', (JavaScript as any).ORDER_ATOMIC),
            u: (JavaScript as any).valueToCode(block, 'U', (JavaScript as any).ORDER_ATOMIC),
            v: (JavaScript as any).valueToCode(block, 'V', (JavaScript as any).ORDER_ATOMIC),
            numDerivatives: (JavaScript as any).valueToCode(block, 'NumDerivatives', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_parameter_u, resources.block_parameter_v, resources.block_num_derivatives
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.verb.surface.derivatives(inputs);`);
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
            getRequired(resources, resources.block_surface),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_parameter_u),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_parameter_v),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_num_derivatives),
        ]
    }];
}
