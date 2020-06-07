import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getOfLength,
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawPointBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_point';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_point);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_color);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity);
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_size);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_point_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valuePoint = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueSize = JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, {
                valuePoint,
                valueColour,
                valueOpacity,
                valueSize,
            })
        );

        return createStandardContextIIFE(block, blockSelector,
`
        const vectorPoint = ${valuePoint};
        const colour = BABYLON.Color3.FromHexString(${valueColour});
        const size = ${valueSize};

        const customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

        const colors = [];
        const pointsCount = 1;
        const positions = vectorPoint;

        colors.push(colour.r, colour.g, colour.b, 1);

        const vertexData = new BABYLON.VertexData();

        vertexData.positions = positions;
        vertexData.colors = colors;

        vertexData.applyToMesh(customMesh);

        const mat = new BABYLON.StandardMaterial("mat${Math.random()}", scene);
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        mat.disableLighting = true;
        mat.pointsCloud = true;
        mat.pointSize = ${valueSize};
        mat.alpha = ${valueOpacity};
        customMesh.material = mat;
`
        );
    };
}

function makeValidationModel(
    resources: ResourcesInterface,
    values: {
        valuePoint: any,
        valueColour: any,
        valueOpacity: any,
        valueSize: any,
    }
): ValidationEntityInterface[] {

    return [{
        entity: values.valuePoint,
        validations: [
            getRequired(resources, resources.block_point),
            getOfLength(resources, resources.block_point, 3)
        ]
    },
    {
        entity: values.valueColour,
        validations: [
            getRequired(resources, resources.block_color)
        ]
    },
    {
        entity: values.valueOpacity,
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: values.valueSize,
        validations: [
            ...getRequiredAndMin(resources, resources.block_size, 0)
        ]
    }];
}
