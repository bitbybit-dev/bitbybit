import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';

export function createPointSpiralBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_spiral';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Factor')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_spiral_input_factor);
            this.appendValueInput('Radius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_spiral_input_radius.toLowerCase());
            this.appendValueInput('NumberPoints')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_spiral_input_number_points.toLowerCase());
            this.appendValueInput('Phi')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_spiral_input_phi.toLowerCase());
            this.appendValueInput('Widening')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_spiral_input_increase.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_point_spiral_description);
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl + '#' + 'spiral');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            factor: (JavaScript as any).valueToCode(block, 'Factor', (JavaScript as any).ORDER_ATOMIC),
            radius: (JavaScript as any).valueToCode(block, 'Radius', (JavaScript as any).ORDER_ATOMIC),
            numberPoints: (JavaScript as any).valueToCode(block, 'NumberPoints', (JavaScript as any).ORDER_ATOMIC),
            phi: (JavaScript as any).valueToCode(block, 'Phi', (JavaScript as any).ORDER_ATOMIC),
            widening: (JavaScript as any).valueToCode(block, 'Widening', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.spiral(inputs);`);
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
            getRequired(resources, resources.block_point),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_transform),
        ]
    }];
}

