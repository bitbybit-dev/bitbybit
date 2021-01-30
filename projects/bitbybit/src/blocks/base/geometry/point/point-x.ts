import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, HS } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';

export function createPointXBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_x';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_point_x);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_point_x_description);
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl + '#' + 'getx');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.getX(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
