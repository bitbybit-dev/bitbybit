import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createSurfaceTransformBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_transform';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Surface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geom_surface_transform_surface);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geom_surface_transform_transformation);
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geom_surface_transform_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surface: (JavaScript as any).valueToCode(block, 'Surface', (JavaScript as any).ORDER_ATOMIC),
            matrix: (JavaScript as any).valueToCode(block, 'Matrix', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
    const points = inputs.surface.controlPoints();
    const transformation = inputs.matrix;
    let twoDimensionalPoints = [];
    points.forEach(ptCollection => {
        let transformedControlPoints = ptCollection;
        if(transformation.length && transformation.length > 0 && isNaN(transformation[0])){
            transformation.forEach(transform => {
                transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrixArray(transformedControlPoints, transform);
            });
        } else {
            transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrixArray(transformedControlPoints, transformation);
        }
        twoDimensionalPoints.push(transformedControlPoints);
    });
    return BitByBit.verb.geom.NurbsSurface.byKnotsControlPointsWeights(inputs.surface.degreeU(), inputs.surface.degreeV(), inputs.surface.knotsU(), inputs.surface.knotsV(), twoDimensionalPoints, inputs.surface.weights());
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
            getRequired(resources, resources.block_surface),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

