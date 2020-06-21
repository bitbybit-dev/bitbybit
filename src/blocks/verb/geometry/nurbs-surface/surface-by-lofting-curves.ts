import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createSurfaceByLoftingCurvesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_by_lofting_curves';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.blocK_verb_geometry_nurbs_surface_by_lofting_curves_input_curves);
            this.appendValueInput('DegreeV')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.blocK_verb_geometry_nurbs_surface_by_lofting_curves_input_degree_v.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.blocK_verb_geometry_nurbs_surface_by_lofting_curves_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curves: JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC),
            degreeV: JavaScript.valueToCode(block, 'DegreeV', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curves, resources.block_degree_v
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return verb.geom.NurbsSurface.byLoftingCurves(inputs.curves, inputs.degree_v)`
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
            getRequired(resources, resources.block_curves),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_degree_v),
        ]
    }];
}
