import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

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
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            factor: JavaScript.valueToCode(block, 'Factor', JavaScript.ORDER_ATOMIC),
            radius: JavaScript.valueToCode(block, 'Radius', JavaScript.ORDER_ATOMIC),
            numberPoints: JavaScript.valueToCode(block, 'NumberPoints', JavaScript.ORDER_ATOMIC),
            phi: JavaScript.valueToCode(block, 'Phi', JavaScript.ORDER_ATOMIC),
            widening: JavaScript.valueToCode(block, 'Widening', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_transform
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
    const phi = inputs.phi;
    const b = Math.log(phi) / (Math.PI / inputs.widening);
    const spiral = [];
    const step = inputs.radius / inputs.numberPoints;
    for(let i = 0; i <= inputs.radius; i += step){
        const th = Math.log(i / inputs.factor) / b;
        const x = i * Math.cos(th);
        const y = i * Math.sin(th);
        spiral.push([x ? x : 0, y ? y : 0, 0]);
    }
    return spiral;
`);
        return [code, JavaScript.ORDER_ATOMIC];
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

