import { ALIGN_RIGHT, Block, Blocks, VARIABLE_CATEGORY_NAME, FieldVariable } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { surfaceConstants } from '../../verb/geometry/nurbs-surface/surface-constants';

export function createDrawSurfacesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_surfaces';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Surfaces')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_surfaces)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_surfaces_variable), 'DrawnSurfacesMesh')
                .appendField(resources.block_babylon_input_draw_surfaces_2);
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
            this.setTooltip(resources.block_babylon_draw_surfaces_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'drawsurfaces');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surfaces: (JavaScript as any).valueToCode(block, 'Surfaces', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            surfacesMesh: undefined,
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surfaces, resources.block_colour, resources.block_opacity, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.surfacesMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfacesMesh'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfacesMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.surface.drawSurfaces(inputs);`
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
