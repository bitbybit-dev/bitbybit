import { ALIGN_RIGHT, Block, Blocks, VARIABLE_CATEGORY_NAME, FieldVariable } from 'blockly';
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

export function createDrawPolylineBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_polyline';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_polyline)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_polyline_variable), 'DrawnPolylineMesh')
                .appendField(resources.block_babylon_input_draw_polyline_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_width.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_polyline_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            updatable: JavaScript.valueToCode(block, 'Updatable', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline, resources.block_colour, resources.block_opacity, resources.block_width, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.polylineMeshVariable = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPolylineMesh'), VARIABLE_CATEGORY_NAME)};

        const points = [];
        const colors = [];
        inputs.polyline.points.forEach(pt => {
            points.push(new BitByBit.BABYLON.Vector3(pt[0], pt[1], pt[2]));
            colors.push( new BitByBit.BABYLON.Color4(1, 1, 1, 0));
        });

        if(inputs.polylineMeshVariable && inputs.updatable){

            if(inputs.polylineMeshVariable.getTotalVertices() === points.length){
                inputs.polylineMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines(null, {points, colors, instance: inputs.polylineMeshVariable, useVertexAlpha: true, updatable: inputs.updatable}, null);
            } else {
                inputs.polylineMeshVariable.dispose();
                inputs.polylineMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines('polylineMesh${Math.random()}', {points, colors, updatable: inputs.updatable, useVertexAlpha: true}, BitByBit.scene);
                ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPolylineMesh'), VARIABLE_CATEGORY_NAME)} = inputs.polylineMeshVariable;
            }

        } else {
            inputs.polylineMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines('polylineMesh${Math.random()}', {points, colors, updatable: inputs.updatable, useVertexAlpha: true}, BitByBit.scene);
            ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPolylineMesh'), VARIABLE_CATEGORY_NAME)} = inputs.polylineMeshVariable;
        }

        inputs.polylineMeshVariable.enableEdgesRendering();
        inputs.polylineMeshVariable.edgesWidth = inputs.width;
        const col = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        inputs.polylineMeshVariable.edgesColor = new BitByBit.BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        inputs.polylineMeshVariable.opacity =  inputs.opacity;
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
            getRequired(resources, resources.block_polyline),
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
            ...getRequiredAndMin(resources, resources.block_width, 0)
        ]
    }];
}
