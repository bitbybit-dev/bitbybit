import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createPointsTransformBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_points_transform';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_points_transform_points);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_points_transform_transformation.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_points_transform_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
            matrix: (JavaScript as any).valueToCode(block, 'Matrix', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
    const transformation = inputs.matrix;
    let transformedControlPoints = inputs.points;
    if(transformation.length && transformation.length > 0){
        transformation.flat().forEach(transform => {
            transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transform);
        });
    } else {
        transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transformation);
    }
    return transformedControlPoints;
`);
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
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

