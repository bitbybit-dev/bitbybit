import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createCsgTransformSolidsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_transform_solids';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Solids')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_transform_solids_input_solids);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_transform_solids_input_transformation.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_transform_solids_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            solids: (JavaScript as any).valueToCode(block, 'Solids', (JavaScript as any).ORDER_ATOMIC),
            matrix: (JavaScript as any).valueToCode(block, 'Matrix', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solids, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
    const transformation = inputs.matrix;
    let solidsToTransform = inputs.solids;
    return solidsToTransform.map(solid => {
        let transformedMesh = BitByBit.CSG.geometries.geom3.clone(solid);
        if(transformation.length && transformation.length > 0){
            transformation.flat().forEach(transform => {
                transformedMesh = BitByBit.CSG.transforms.transform(transform.toArray(), transformedMesh);
            });
        } else {
            transformedMesh = BitByBit.CSG.transforms.transform(transformation.toArray(), transformedMesh);
        }
        return transformedMesh;
    });
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

