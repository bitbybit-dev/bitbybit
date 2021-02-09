import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { surfaceConstants } from '../../verb/geometry/nurbs-surface/surface-constants';

export function createDrawSurfaceBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_surface';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Surface')
                .setCheck('NurbsSurface')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_surface)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_surface_variable), 'DrawnSurfaceMesh')
                .appendField(resources.block_babylon_input_draw_surface_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surface_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'drawsurface');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surface: (JavaScript as any).valueToCode(block, 'Surface', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            surfaceMesh: undefined,
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surface, resources.block_colour, resources.block_opacity, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.surfaceMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMesh'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.verb.surface.drawSurface(inputs);`
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_surface),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },
    {
        entity: keys[2],
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    }];
}
