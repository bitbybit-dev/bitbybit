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

export function createDrawSurfacesColoursBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_surfaces_colours';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Surfaces')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_surfaces)
                .appendField(new FieldVariable(resources.block_babylon_draw_surfaces_colours_input_surfaces_variable), 'DrawnSurfaceMeshes')
                .appendField(resources.block_babylon_draw_surfaces_colours_input_surfaces_2);
            this.appendValueInput('Colours')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_colours.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_opacity.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surfaces_colours_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'drawsurfacesmulticolour');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surfaces: (JavaScript as any).valueToCode(block, 'Surfaces', (JavaScript as any).ORDER_ATOMIC),
            colours: (JavaScript as any).valueToCode(block, 'Colours', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            surfacesMesh: undefined,
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surfaces, resources.block_colour, resources.block_opacity, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.surfacesMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMeshes'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMeshes'), VARIABLE_CATEGORY_NAME)} = bitbybit.verb.surface.drawSurfacesMultiColour(inputs);`
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
            getRequired(resources, resources.block_surfaces),
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
