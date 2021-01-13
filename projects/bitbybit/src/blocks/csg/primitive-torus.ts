import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitiveTorusBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_torus';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_center);
            this.appendValueInput('InnerRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_inner_radius.toLowerCase());
            this.appendValueInput('OuterRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_outer_radius.toLowerCase());
            this.appendValueInput('InnerSegments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_inner_segments.toLowerCase());
            this.appendValueInput('OuterSegments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_outer_segments.toLowerCase());
            this.appendValueInput('InnerRotation')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_inner_rotation.toLowerCase());
            this.appendValueInput('OuterRotation')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_outer_rotation.toLowerCase());
            this.appendValueInput('StartAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_torus_input_start_angle.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_torus_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
            innerRadius: (JavaScript as any).valueToCode(block, 'InnerRadius', (JavaScript as any).ORDER_ATOMIC),
            outerRadius: (JavaScript as any).valueToCode(block, 'OuterRadius', (JavaScript as any).ORDER_ATOMIC),
            innerSegments: (JavaScript as any).valueToCode(block, 'InnerSegments', (JavaScript as any).ORDER_ATOMIC),
            outerSegments: (JavaScript as any).valueToCode(block, 'OuterSegments', (JavaScript as any).ORDER_ATOMIC),
            innerRotation: (JavaScript as any).valueToCode(block, 'InnerRotation', (JavaScript as any).ORDER_ATOMIC),
            outerRotation: (JavaScript as any).valueToCode(block, 'OuterRotation', (JavaScript as any).ORDER_ATOMIC),
            startAngle: (JavaScript as any).valueToCode(block, 'StartAngle', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center, resources.block_inner_radius, resources.block_outer_radius, resources.block_inner_segments,
            resources.block_outer_segments, resources.block_inner_rotation, resources.block_outer_rotation, resources.block_start_angle
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.solid.shapes.torus(inputs);`
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
            getRequired(resources, resources.block_center),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_inner_radius),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_outer_radius),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_inner_segments),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_outer_segments),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_inner_rotation),
        ]
    }, {
        entity: keys[6],
        validations: [
            getRequired(resources, resources.block_outer_rotation),
        ]
    }, {
        entity: keys[7],
        validations: [
            getRequired(resources, resources.block_start_angle),
        ]
    }];
}
