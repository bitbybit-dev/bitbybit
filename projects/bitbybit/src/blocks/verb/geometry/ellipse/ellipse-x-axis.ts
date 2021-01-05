import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createEllipseXAxisBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_ellipse_x_axis';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Ellipse')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_ellipse_x_axis_input_ellipse);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_ellipse_x_axis_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            ellipse: (JavaScript as any).valueToCode(block, 'Ellipse', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_ellipse
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.curve.ellipse.xAxis(inputs);`
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
            getRequired(resources, resources.block_ellipse),
        ]
    }];
}
