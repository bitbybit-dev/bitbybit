import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createLinesConvertToNurbsCurvesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_lines_convert_to_nurbs_curves';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Lines')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_lines_convert_to_nurbs_curves);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_lines_convert_to_nurbs_curves_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            lines: JavaScript.valueToCode(block, 'Lines', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.lines.map(line => new BitByBit.verb.geom.Line(line.start, line.end));`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
