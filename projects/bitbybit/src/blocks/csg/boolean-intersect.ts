import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

export function createBooleanIntersectBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_boolean_intersect';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('IntersectObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_intersect_input_intersect_object);
            this.appendValueInput('WithObject')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_intersect_input_with_object.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_intersect_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidBooleansHelpUrl + '#' + 'intersect');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            intersectObject: (JavaScript as any).valueToCode(block, 'IntersectObject', (JavaScript as any).ORDER_ATOMIC),
            withObject: (JavaScript as any).valueToCode(block, 'WithObject', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solid, resources.block_solid
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.booleans.intersect({objects: [inputs.intersectObject, inputs.withObject]});`
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
            getRequired(resources, resources.block_solid),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_solid),
        ]
    }];
}
