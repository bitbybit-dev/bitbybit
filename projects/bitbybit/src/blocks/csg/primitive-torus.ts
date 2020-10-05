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
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            innerRadius: JavaScript.valueToCode(block, 'InnerRadius', JavaScript.ORDER_ATOMIC),
            outerRadius: JavaScript.valueToCode(block, 'OuterRadius', JavaScript.ORDER_ATOMIC),
            innerSegments: JavaScript.valueToCode(block, 'InnerSegments', JavaScript.ORDER_ATOMIC),
            outerSegments: JavaScript.valueToCode(block, 'OuterSegments', JavaScript.ORDER_ATOMIC),
            innerRotation: JavaScript.valueToCode(block, 'InnerRotation', JavaScript.ORDER_ATOMIC),
            outerRotation: JavaScript.valueToCode(block, 'OuterRotation', JavaScript.ORDER_ATOMIC),
            startAngle: JavaScript.valueToCode(block, 'StartAngle', JavaScript.ORDER_ATOMIC),
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
            `
            const torus = BitByBit.CSG.primitives.torus({
                center: [inputs.center[0], inputs.center[2], inputs.center[1]],
                innerRadius: inputs.innerRadius,
                outerRadius: inputs.outerRadius,
                innerSegments: inputs.innerSegments,
                outerSegments: inputs.outerSegments,
                innerRotation: BitByBit.BABYLON.Angle.FromDegrees(inputs.innerRotation).radians(),
                outerRotation: BitByBit.BABYLON.Angle.FromDegrees(inputs.outerRotation).radians(),
                startAngle: BitByBit.BABYLON.Angle.FromDegrees(inputs.startAngle).radians(),
            });
            return torus;
`
        );
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
