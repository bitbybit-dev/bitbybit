import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';

export function createPointTransformBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_transform';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_transform_point);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_transform_transformation.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_point_transform_description);
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl + '#' + 'transformpoint');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC),
            matrix: (JavaScript as any).valueToCode(block, 'Matrix', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.transformPoint(inputs);`);
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
            getRequired(resources, resources.block_point),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

