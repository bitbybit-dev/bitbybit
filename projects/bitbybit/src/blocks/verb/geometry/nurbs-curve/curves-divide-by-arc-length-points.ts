import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCurvesDivideByArcLengthPointsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curves_divide_by_arc_length_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curves_divide_by_arc_length_points_input_curves);
            this.appendValueInput('Length')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curves_divide_by_arc_length_points_input_arc_length.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curves_divide_by_arc_length_points_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curves: (JavaScript as any).valueToCode(block, 'Curves', (JavaScript as any).ORDER_ATOMIC),
            length: (JavaScript as any).valueToCode(block, 'Length', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curves, resources.block_length
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
const points = [];
inputs.curves.forEach(curve => {
    const crvSegments = curve.divideByArcLength(inputs.length);
    points.push(...crvSegments.map(s => curve.point(s.u)));
});
return points;
            `
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
            getRequired(resources, resources.block_curves),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_length),
        ]
    }];
}
