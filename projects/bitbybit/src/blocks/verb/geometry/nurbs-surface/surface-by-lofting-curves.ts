import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { surfaceConstants } from './surface-constants';

export function createSurfaceByLoftingCurvesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_by_lofting_curves';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_lofting_curves_input_curves);
            this.appendValueInput('DegreeV')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_lofting_curves_input_degree_v.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_surface_by_lofting_curves_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'createsurfacebyloftingcurves');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curves: (JavaScript as any).valueToCode(block, 'Curves', (JavaScript as any).ORDER_ATOMIC),
            degreeV: (JavaScript as any).valueToCode(block, 'DegreeV', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curves, resources.block_degree_v
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.surface.createSurfaceByLoftingCurves(inputs);`
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
            getRequired(resources, resources.block_curves),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_degree_v),
        ]
    }];
}
