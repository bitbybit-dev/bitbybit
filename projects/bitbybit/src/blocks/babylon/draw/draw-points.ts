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

export function createDrawPointsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_points)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_points_variable), 'DrawnPointsMesh')
                .appendField(resources.block_babylon_input_draw_points_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_size.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setInputsInline(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_points_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            points: JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            size: JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC),
            updatable: JavaScript.valueToCode(block, 'Updatable', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points, resources.block_colour, resources.block_opacity, resources.block_size, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.pointsMeshVariable = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPointsMesh'), VARIABLE_CATEGORY_NAME)};
        const vectorPoints = inputs.points;
        const colour = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        const positions = [];
        const colors = [];

        const pointsCount = vectorPoints.length;
        vectorPoints.forEach(p =>  {
            positions.push(...p);
            colors.push(colour.r, colour.g, colour.b, 1);
        });

        const createNewMesh = () => {

            const vertexData = new BitByBit.BABYLON.VertexData();

            vertexData.positions = positions;
            vertexData.colors = colors;

            inputs.pointsMeshVariable = new BitByBit.BABYLON.Mesh('inputs.pointsMeshVariable${Math.random()}', BitByBit.scene);
            vertexData.applyToMesh(inputs.pointsMeshVariable, inputs.updatable);

            const mat = new BitByBit.BABYLON.StandardMaterial('mat${Math.random()}', BitByBit.scene);
            inputs.pointsMeshVariable.material = mat;

            inputs.pointsMeshVariable.material.emissiveColor = new BitByBit.BABYLON.Color3(1, 1, 1);
            inputs.pointsMeshVariable.material.disableLighting = true;
            inputs.pointsMeshVariable.material.pointsCloud = true;
            inputs.pointsMeshVariable.material.alpha = inputs.opacity;
            inputs.pointsMeshVariable.material.pointSize = inputs.size;

            ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPointsMesh'), VARIABLE_CATEGORY_NAME)} = inputs.pointsMeshVariable;

        }

        if(inputs.pointsMeshVariable && inputs.updatable) {

            if(inputs.pointsMeshVariable.getTotalVertices() === vectorPoints.length){

                inputs.pointsMeshVariable.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
                inputs.pointsMeshVariable.updateVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
                inputs.pointsMeshVariable.material.alpha = inputs.opacity;
                inputs.pointsMeshVariable.material.pointSize = inputs.size;

            } else {

                inputs.pointsMeshVariable.dispose();
                createNewMesh();
            }

        } else {
            createNewMesh();
        }
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
            getRequired(resources, resources.block_points),
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
    },
    {
        entity: keys[3],
        validations: [
            ...getRequiredAndMin(resources, resources.block_size, 0)
        ]
    }];
}
