import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createSurfaceIsocurvesSubdivisionBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_isocurves_subdivision';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Surface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_isocurves_subdivision_input_surface);
            this.appendValueInput('IsocurveSegments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_isocurves_subdivision_input_segments.toLowerCase());
            this.appendValueInput('IncludeLast')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_isocurves_subdivision_input_include_last.toLowerCase());
            this.appendValueInput('UseV')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_isocurves_subdivision_input_use_v.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_surface_isocurves_subdivision_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surface: JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC),
            isocurveSegments: JavaScript.valueToCode(block, 'IsocurveSegments', JavaScript.ORDER_ATOMIC),
            includeLast: JavaScript.valueToCode(block, 'IncludeLast', JavaScript.ORDER_ATOMIC),
            useV: JavaScript.valueToCode(block, 'UseV', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_segments, resources.block_include_last, resources.block_use_v
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const step = (0.999999 / inputs.isocurveSegments);
            const params = BitByBit.verb.core.Vec.span(0.0000001, 0.999999, step);
            if(!inputs.includeLast) {
                params.pop();
            }
            return params.map(parameter => {
                return inputs.surface.isocurve(parameter, inputs.useV);
            });
`);
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
            getRequired(resources, resources.block_segments),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_include_last),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_use_v),
        ]
    }];
}
