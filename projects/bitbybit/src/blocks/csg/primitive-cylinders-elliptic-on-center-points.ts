import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitiveCylindersEllipticOnCenterPointsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_cylinders_elliptic_on_center_points';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Centers')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cylinders_elliptic_on_center_points_input_centers);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cylinder_elliptic_input_height.toLowerCase());
            this.appendValueInput('StartRadius')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cylinder_elliptic_input_start_radius.toLowerCase());
            this.appendValueInput('EndRadius')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cylinder_elliptic_input_end_radius.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_cylinder_elliptic_input_segments.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_cylinder_elliptic_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            centers: JavaScript.valueToCode(block, 'Centers', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
            startRadius: JavaScript.valueToCode(block, 'StartRadius', JavaScript.ORDER_ATOMIC),
            endRadius: JavaScript.valueToCode(block, 'EndRadius', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_centers, resources.block_height, resources.block_start_radius,
            resources.block_end_radius, resources.block_segments
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return inputs.centers.map(center => {
                return BitByBit.CSG.primitives.cylinderElliptic({
                    center: [center[0], center[1], center[2]],
                    height: inputs.height,
                    startRadius: [inputs.startRadius[0], inputs.startRadius[1]],
                    endRadius: [inputs.endRadius[0], inputs.endRadius[1]],
                    segments: inputs.segments,
                });
            });
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
            getRequired(resources, resources.block_centers),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_start_radius),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_end_radius),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}
