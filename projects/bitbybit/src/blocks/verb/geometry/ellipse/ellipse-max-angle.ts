import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { ellipseConstants } from './ellipse-constants';

export function createEllipseMaxAngleBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_ellipse_max_angle';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Ellipse')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_ellipse_max_angle_input_ellipse);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_ellipse_max_angle_description);
            this.setHelpUrl(environment.docsUrl + ellipseConstants.helpUrl + '#' + 'maxangle');
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
            `return bitbybit.curve.ellipse.maxAngle(inputs);`
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
