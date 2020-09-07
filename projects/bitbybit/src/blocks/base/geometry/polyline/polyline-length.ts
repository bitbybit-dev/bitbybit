import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPolylineLengthBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_length';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_length);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_length_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        let distanceOfPolyline = 0;
        for (var i = 1; i < inputs.polyline.points.length; i++) {
            const previousPoint = inputs.polyline.points[i - 1];
            const currentPoint = inputs.polyline.points[i];
            distanceOfPolyline += verb.core.Vec.dist(previousPoint, currentPoint);
        };
        return distanceOfPolyline;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
