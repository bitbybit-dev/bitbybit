import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitive2dStarBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_star';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_center);
            this.appendValueInput('Vertices')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_vertices.toLowerCase());
            this.appendValueInput('Density')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_density.toLowerCase());
            this.appendValueInput('OuterRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_outer_radius.toLowerCase());
            this.appendValueInput('InnerRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_inner_radius.toLowerCase());
            this.appendValueInput('StartAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_star_input_start_angle.toLowerCase());
            this.setOutput(true, 'Polygon');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_primitive_2d_star_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: JavaScript.valueToCode(block, 'Center', JavaScript.ORDER_ATOMIC),
            vertices: JavaScript.valueToCode(block, 'Vertices', JavaScript.ORDER_ATOMIC),
            density: JavaScript.valueToCode(block, 'Density', JavaScript.ORDER_ATOMIC),
            outerRadius: JavaScript.valueToCode(block, 'OuterRadius', JavaScript.ORDER_ATOMIC),
            innerRadius: JavaScript.valueToCode(block, 'InnerRadius', JavaScript.ORDER_ATOMIC),
            startAngle: JavaScript.valueToCode(block, 'StartAngle', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_center, resources.block_vertices, resources.block_density,
            resources.block_outer_radius, resources.block_inner_radius, resources.block_start_angle,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return BitByBit.CSG.primitives.star({
                center: [inputs.center[0], inputs.center[2]],
                vertices: inputs.vertices,
                density: inputs.density,
                outerRadius: inputs.outerRadius,
                innerRadius: inputs.innerRadius,
                startAngle: BitByBit.BABYLON.Angle.FromDegrees(inputs.startAngle).radians(),
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
            getRequired(resources, resources.block_center),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_vertices),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_density),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_outer_radius),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_inner_radius),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_start_angle),
        ]
    }];
}
