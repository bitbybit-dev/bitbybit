import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCurvesTransformBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curves_transform';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geom_curves_transform_curves);
            this.appendValueInput('Matrix')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geom_curves_transform_transformation.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geom_curves_transform_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curves: JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC),
            matrix: JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curves, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
const curvesTransformed = [];
inputs.curves.forEach(curve => {
    const points = curve.controlPoints();
    const transformation = inputs.matrix;
    let transformedControlPoints = points;
    if(transformation.length && transformation.length > 0){
        transformation.forEach(transform => {
            transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(transformedControlPoints, transform);
        });
    } else {
        transformedControlPoints = BitByBit.BitByBitBlocklyHelperService.transformPointsByMatrix(points, transformation);
    }
    curvesTransformed.push(verb.geom.NurbsCurve.byKnotsControlPointsWeights(curve.degree(), curve.knots(), transformedControlPoints, curve.weights()));
});
return curvesTransformed;

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
            getRequired(resources, resources.block_curves),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

