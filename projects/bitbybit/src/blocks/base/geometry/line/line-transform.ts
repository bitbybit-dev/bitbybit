import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createLineTransformBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_line_transform';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_line_transform_line);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_line_transform_transformation.toLowerCase());
            this.setOutput(true, 'Line');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_line_transform_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            line: JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC),
            matrix: JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
    const transformation = inputs.matrix;
    let transformedControlPoints = [inputs.line.start, inputs.line.end];
    if(transformation.length && transformation.length > 0){
        transformation.flat().forEach(transform => {
            transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transform);
        });
    } else {
        transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transformation);
    }
    return {
        start: transformedControlPoints[0],
        end: transformedControlPoints[1]
    };
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
            getRequired(resources, resources.block_line),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

