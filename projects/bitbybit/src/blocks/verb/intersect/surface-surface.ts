import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { intersectConstants } from './intersect-constants';

export function createIntersectSurfaceSurfaceBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_intersect_surface_surface';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('FirstSurface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_intersect_surface_surface_input_curve);
            this.appendValueInput('SecondSurface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_intersect_surface_surface_input_surface.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_intersect_surface_surface_description);
            this.setHelpUrl(environment.docsUrl + intersectConstants.helpUrl + '#' + 'surfaces');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            firstSurface: (JavaScript as any).valueToCode(block, 'FirstSurface', (JavaScript as any).ORDER_ATOMIC),
            secondSurface: (JavaScript as any).valueToCode(block, 'SecondSurface', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_surface, resources.block_tolerance
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.intersect.surfaces(inputs);`
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
            getRequired(resources, resources.block_surface),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_surface),
        ]
    }];
}
