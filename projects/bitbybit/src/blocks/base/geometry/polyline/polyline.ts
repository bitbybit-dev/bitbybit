import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { polylineConstants } from './polyline-constants';

export function createPolylineBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline);
            this.setOutput(true, 'Polyline');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_description);
            this.setHelpUrl(environment.docsUrl + polylineConstants.helpUrl + '#' + 'create');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.polyline.create(inputs);`
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
            getRequired(resources, resources.block_points),
        ]
    }];
}
