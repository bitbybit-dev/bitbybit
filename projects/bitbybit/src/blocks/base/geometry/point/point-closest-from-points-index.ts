import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createPointClosestFromPointsIndexBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_closest_from_points_index';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_closest_from_points_index_input_point);
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_closest_from_points_index_input_points.toLowerCase());
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_point_closest_from_points_index_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC),
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_points
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
    let smallestDistanceSoFar = Number.MAX_SAFE_INTEGER;
    let closestPointIndex;
    for(let i = 0; i < inputs.points.length; i++){
        const pt = inputs.points[i];
        const currentDist = BitByBit.verb.core.Vec.dist(inputs.point, pt);
        if(currentDist < smallestDistanceSoFar){
            smallestDistanceSoFar = currentDist;
            closestPointIndex = i;
        }
    }
    return closestPointIndex + 1;
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
            getRequired(resources, resources.block_point),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_points),
        ]
    }];
}

