import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitiveEllipsoidBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_ellipsoid';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_ellipsoid_input_center);
            this.appendValueInput('Radius')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_ellipsoid_input_radius.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_ellipsoid_input_segments.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_cuboid_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            radius: JavaScript.valueToCode(block, 'Radius', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center, resources.block_radius, resources.block_segments,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const ellipsoid = BitByBit.CSG.primitives.ellipsoid({
                center: [inputs.center[0], inputs.center[2], inputs.center[1]],
                radius: [inputs.radius[0], inputs.radius[2], inputs.radius[1]],
                segments: inputs.segments,
                axes: [
                    [-1, 0, 0],
                    [0, -1, 0],
                    [0, 0, -1],
                ],
            });
            return ellipsoid;
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
            getRequired(resources, resources.block_radius),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}
