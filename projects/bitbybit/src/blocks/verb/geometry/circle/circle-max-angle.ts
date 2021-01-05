import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCircleMaxAngleBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_circle_max_angle';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Circle')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_circle_max_angle_input_circle);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_circle_max_angle_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            circle: (JavaScript as any).valueToCode(block, 'Circle', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_circle
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.curve.circle.maxAngle(inputs);`
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
            getRequired(resources, resources.block_circle),
        ]
    }];
}
