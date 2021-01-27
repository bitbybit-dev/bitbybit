import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

export function createPrimitive2dStarBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_star';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_center);
            this.appendValueInput('Vertices')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_vertices.toLowerCase());
            this.appendValueInput('Density')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_density.toLowerCase());
            this.appendValueInput('OuterRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_outer_radius.toLowerCase());
            this.appendValueInput('InnerRadius')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_inner_radius.toLowerCase());
            this.appendValueInput('StartAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_star_input_start_angle.toLowerCase());
            this.setOutput(true, 'Polygon');
            this.setColour('#fff');
            this.setTooltip(resources.block_jscad_primitive_2d_star_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidPolygonHelpUrl + '#' + 'star');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
            vertices: (JavaScript as any).valueToCode(block, 'Vertices', (JavaScript as any).ORDER_ATOMIC),
            density: (JavaScript as any).valueToCode(block, 'Density', (JavaScript as any).ORDER_ATOMIC),
            outerRadius: (JavaScript as any).valueToCode(block, 'OuterRadius', (JavaScript as any).ORDER_ATOMIC),
            innerRadius: (JavaScript as any).valueToCode(block, 'InnerRadius', (JavaScript as any).ORDER_ATOMIC),
            startAngle: (JavaScript as any).valueToCode(block, 'StartAngle', (JavaScript as any).ORDER_ATOMIC),
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
            `return bitbybit.jscad.polygon.star(inputs);`
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
