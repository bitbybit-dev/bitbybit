import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { sceneConstants } from '../scene/scene-constants';

export function createDrawGridBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_grid';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_grid)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_grid_variable), 'Grid')
                .appendField(resources.block_babylon_input_draw_grid_2);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_height.toLowerCase());
            this.appendValueInput('Subdivisions')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_subdivisions.toLowerCase());
            this.appendValueInput('MajorUnitFrequency')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_major_unit_frequency.toLowerCase());
            this.appendValueInput('MinorUnitVisibility')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_minor_unit_visibility.toLowerCase());
            this.appendValueInput('GridRatio')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_grid_ratio.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('BackFaceCulling')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_back_face_culling.toLowerCase());
            this.appendValueInput('MainColor')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_main_colour.toLowerCase());
            this.appendValueInput('LineColor')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_secondary_colour.toLowerCase());
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_draw_grid_description);
            this.setHelpUrl(environment.docsUrl + sceneConstants.helpUrl + '#' + 'drawgridmesh');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            height: (JavaScript as any).valueToCode(block, 'Height', (JavaScript as any).ORDER_ATOMIC),
            subdivisions: (JavaScript as any).valueToCode(block, 'Subdivisions', (JavaScript as any).ORDER_ATOMIC),
            majorUnitFrequency: (JavaScript as any).valueToCode(block, 'MajorUnitFrequency', (JavaScript as any).ORDER_ATOMIC),
            minorUnitVisibility: (JavaScript as any).valueToCode(block, 'MinorUnitVisibility', (JavaScript as any).ORDER_ATOMIC),
            gridRatio: (JavaScript as any).valueToCode(block, 'GridRatio', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            backFaceCulling: (JavaScript as any).valueToCode(block, 'BackFaceCulling', (JavaScript as any).ORDER_ATOMIC),
            mainColor: (JavaScript as any).valueToCode(block, 'MainColor', (JavaScript as any).ORDER_ATOMIC),
            secondaryColor: (JavaScript as any).valueToCode(block, 'LineColor', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_babylon_input_width,
            resources.block_babylon_input_height,
            resources.block_babylon_input_subdivisions,
            resources.block_babylon_input_major_unit_frequency,
            resources.block_babylon_input_minor_unit_visibility,
            resources.block_babylon_input_grid_ratio,
            resources.block_opacity,
            resources.block_babylon_input_back_face_culling,
            resources.block_babylon_input_main_colour,
            resources.block_babylon_input_secondary_colour,
            ])
        );

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `${(JavaScript as any).variableDB_.getName(block.getFieldValue('Grid'), VARIABLE_CATEGORY_NAME)} = bitbybit.scene.drawGridMesh(inputs);`
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
            ...getRequiredAndMin(resources, resources.block_babylon_input_width, 0)
        ]
    },
    {
        entity: keys[1],
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_height, 0)
        ]
    },
    {
        entity: keys[2],
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_subdivisions, 0)
        ]
    },
    {
        entity: keys[3],
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_major_unit_frequency, 0)
        ]
    },
    {
        entity: keys[4],
        validations: [
            ...getRequiredAndRange(resources, resources.block_babylon_input_minor_unit_visibility, 0, 1)
        ]
    },
    {
        entity: keys[5],
        validations: [
            ...getRequiredAndRange(resources, resources.block_babylon_input_grid_ratio, 0, 1)
        ]
    },
    {
        entity: keys[6],
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: keys[8],
        validations: [
            getRequired(resources, resources.block_babylon_input_main_colour)
        ]
    },
    {
        entity: keys[9],
        validations: [
            getRequired(resources, resources.block_babylon_input_secondary_colour)
        ]
    }];
}
