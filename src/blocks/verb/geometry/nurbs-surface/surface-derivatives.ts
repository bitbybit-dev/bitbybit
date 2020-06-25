import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createSurfaceDerivativesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_derivatives';

    Blocks[blockSelector] = {
        init() {
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
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surface: JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC),
            u: JavaScript.valueToCode(block, 'U', JavaScript.ORDER_ATOMIC),
            v: JavaScript.valueToCode(block, 'V', JavaScript.ORDER_ATOMIC),
            numDerivatives: JavaScript.valueToCode(block, 'NumDerivatives', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_parameter_u, resources.block_parameter_v, resources.block_num_derivatives
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.surface.derivatives(inputs.u, inputs.v, inputs.numDerivatives);`);
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
