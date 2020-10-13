import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createCsgTransformBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_transform';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('CsgMesh')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_transform_input_csg_mesh);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_transform_input_transformation.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_transform_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            csgMesh: JavaScript.valueToCode(block, 'CsgMesh', JavaScript.ORDER_ATOMIC),
            matrix: JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solid, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
    const transformation = inputs.matrix;
    let transformedMesh = inputs.csgMesh;
    if(transformation.length && transformation.length > 0){
        transformation.forEach(transform => {
            transformedMesh = BitByBit.CSG.transforms.transform(transform.toArray(), transformedMesh);
        });
    } else {
        transformedMesh = BitByBit.CSG.transforms.transform(transformation.toArray(), transformedMesh);
    }
    return transformedMesh;
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
            getRequired(resources, resources.block_solid),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

