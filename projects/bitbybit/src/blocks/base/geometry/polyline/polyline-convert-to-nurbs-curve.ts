import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, HS } from '../../../validations';
import { polylineConstants } from './polyline-constants';
import { environment } from 'projects/bitbybit/src/environments/environment';

export function createPolylineConvertToNurbsCurveBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_convert_to_nurbs_curve';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_convert_to_nurbs_curve);
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_convert_to_nurbs_curve_description);
            this.setHelpUrl(environment.docsUrl + polylineConstants.helpUrl + '#' + 'converttonurbscurve');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: (JavaScript as any).valueToCode(block, 'Polyline', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.polyline.convertToNurbsCurve(inputs);`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
