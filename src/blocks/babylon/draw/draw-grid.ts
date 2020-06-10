import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawGridBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_grid';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_grid);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_height);
            this.appendValueInput('Subdivisions')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_subdivisions);
            this.appendValueInput('MajorUnitFrequency')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_major_unit_frequency);
            this.appendValueInput('MinorUnitVisibility')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_minor_unit_visibility);
            this.appendValueInput('GridRatio')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_grid_ratio);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity);
            this.appendValueInput('BackFaceCulling')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_back_face_culling);
            this.appendValueInput('MainColor')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_main_colour);
            this.appendValueInput('LineColor')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_secondary_colour);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_draw_grid_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            height: JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC),
            subdivisions: JavaScript.valueToCode(block, 'Subdivisions', JavaScript.ORDER_ATOMIC),
            majorUnitFrequency: JavaScript.valueToCode(block, 'MajorUnitFrequency', JavaScript.ORDER_ATOMIC),
            minorUnitVisibility: JavaScript.valueToCode(block, 'MinorUnitVisibility', JavaScript.ORDER_ATOMIC),
            gridRatio: JavaScript.valueToCode(block, 'GridRatio', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            backFaceCulling: JavaScript.valueToCode(block, 'BackFaceCulling', JavaScript.ORDER_ATOMIC),
            mainColor: JavaScript.valueToCode(block, 'MainColor', JavaScript.ORDER_ATOMIC),
            secondaryColor: JavaScript.valueToCode(block, 'LineColor', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
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
            `
        const groundMaterial = new BABYLON.GridMaterial('groundMaterial${Math.random()}', scene);
        groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
        groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
        groundMaterial.gridRatio = inputs.gridRatio;
        groundMaterial.backFaceCulling = inputs.backFaceCulling;
        groundMaterial.mainColor = BABYLON.Color3.FromHexString(inputs.mainColor);
        groundMaterial.lineColor = BABYLON.Color3.FromHexString(inputs.secondaryColor);
        groundMaterial.opacity = inputs.opacity;

        const ground = BABYLON.Mesh.CreateGround('ground${Math.random()}', inputs.width, inputs.height, inputs.subdivisions, scene, false);
        ground.material = groundMaterial;
`
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
