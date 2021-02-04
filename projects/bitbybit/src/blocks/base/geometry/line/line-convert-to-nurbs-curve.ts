import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, HS } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { lineConstants } from './line-constants';

export function createLineConvertToNurbsCurveBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_line_convert_to_nurbs_curve';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_convert_to_nurbs_curve);
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_convert_to_nurbs_curve_description);
            this.setHelpUrl(environment.docsUrl + lineConstants.helpUrl + '#' + 'converttonurbscurve');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            line: (JavaScript as any).valueToCode(block, 'Line', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.line.convertToNurbsCurve(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
