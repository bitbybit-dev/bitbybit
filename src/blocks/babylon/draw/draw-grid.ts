import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawGridBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
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
                .appendField(resources.block_babylon_input_main_color);
            this.appendValueInput('LineColor')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_secondary_color);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_draw_grid_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);
        const valueHeight = JavaScript.valueToCode(block, 'Height', JavaScript.ORDER_ATOMIC);
        const valueSubdivisions = JavaScript.valueToCode(block, 'Subdivisions', JavaScript.ORDER_ATOMIC);
        const valueMajorUnitFrequency = JavaScript.valueToCode(block, 'MajorUnitFrequency', JavaScript.ORDER_ATOMIC);
        const valueMinorUnitVisibility = JavaScript.valueToCode(block, 'MinorUnitVisibility', JavaScript.ORDER_ATOMIC);
        const valueGridRatio = JavaScript.valueToCode(block, 'GridRatio', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueBackFaceCulling = JavaScript.valueToCode(block, 'BackFaceCulling', JavaScript.ORDER_ATOMIC);
        const valueMainColor = JavaScript.valueToCode(block, 'MainColor', JavaScript.ORDER_ATOMIC);
        const valueSecondaryColor = JavaScript.valueToCode(block, 'LineColor', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, {
                valueWidth,
                valueHeight,
                valueSubdivisions,
                valueMajorUnitFrequency,
                valueMinorUnitVisibility,
                valueGridRatio,
                valueOpacity,
                valueBackFaceCulling,
                valueMainColor,
                valueSecondaryColor
            })
        );

        return createStandardContextIIFE(block, blockSelector,
`
        const groundMaterial = new BABYLON.GridMaterial('groundMaterial${Math.random()}', scene);
        groundMaterial.majorUnitFrequency = ${valueMajorUnitFrequency};
        groundMaterial.minorUnitVisibility = ${valueMinorUnitVisibility};
        groundMaterial.gridRatio = ${valueGridRatio};
        groundMaterial.backFaceCulling = ${valueBackFaceCulling};
        groundMaterial.mainColor = BABYLON.Color3.FromHexString(${valueMainColor});
        groundMaterial.lineColor = BABYLON.Color3.FromHexString(${valueSecondaryColor});
        groundMaterial.opacity = ${valueOpacity};

        const ground = BABYLON.Mesh.CreateGround('ground${Math.random()}', ${valueWidth}, ${valueHeight}, ${valueSubdivisions}, scene, false);
        ground.material = groundMaterial;
`
        );
    };
}

function makeValidationModel(
    resources: ResourcesInterface,
    values: {
        valueWidth: number,
        valueHeight: number,
        valueSubdivisions: number,
        valueMajorUnitFrequency: number,
        valueMinorUnitVisibility: number,
        valueGridRatio: number,
        valueOpacity: number,
        valueBackFaceCulling: boolean,
        valueMainColor: any,
        valueSecondaryColor: any
    }
): ValidationEntityInterface[] {

    return [{
        entity: values.valueWidth,
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_width, 0)
        ]
    },
    {
        entity: values.valueHeight,
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_height, 0)
        ]
    },
    {
        entity: values.valueSubdivisions,
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_subdivisions, 0)
        ]
    },
    {
        entity: values.valueMajorUnitFrequency,
        validations: [
            ...getRequiredAndMin(resources, resources.block_babylon_input_major_unit_frequency, 0)
        ]
    },
    {
        entity: values.valueMinorUnitVisibility,
        validations: [
            ...getRequiredAndRange(resources, resources.block_babylon_input_minor_unit_visibility, 0, 1)
        ]
    },
    {
        entity: values.valueGridRatio,
        validations: [
            ...getRequiredAndRange(resources, resources.block_babylon_input_grid_ratio, 0, 1)
        ]
    },
    {
        entity: values.valueOpacity,
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: values.valueBackFaceCulling,
        validations: [
            getRequired(resources, resources.block_babylon_input_back_face_culling)
        ]
    },
    {
        entity: values.valueMainColor,
        validations: [
            getRequired(resources, resources.block_babylon_input_main_color)
        ]
    },
    {
        entity: values.valueSecondaryColor,
        validations: [
            getRequired(resources, resources.block_babylon_input_secondary_color)
        ]
    }];
}
