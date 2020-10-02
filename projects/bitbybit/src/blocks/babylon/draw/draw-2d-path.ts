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

export function createDraw2dPathBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_2d_path';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Path')
                .setCheck('Path')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_2d_path)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_2d_path_variable), 'DrawnPathMesh')
                .appendField(resources.block_babylon_input_draw_2d_path_2);
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
            path: JavaScript.valueToCode(block, 'Path', JavaScript.ORDER_ATOMIC),
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
        inputs.pathMeshVariable = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPathMesh'), VARIABLE_CATEGORY_NAME)};

        const points = [];
        const colors = [];
        inputs.path.points.forEach(pt => {
            points.push(new BitByBit.BABYLON.Vector3(pt[0], 0, pt[1]));
            colors.push( new BitByBit.BABYLON.Color4(1, 1, 1, 0));
        });

        if(inputs.path.isClosed){
            const pt = inputs.path.points[0];
            points.push(new BitByBit.BABYLON.Vector3(pt[0], 0, pt[1]));
            colors.push( new BitByBit.BABYLON.Color4(1, 1, 1, 0));
        }

        if(inputs.pathMeshVariable && inputs.updatable){

            if(inputs.pathMeshVariable.getTotalVertices() === points.length){
                inputs.pathMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines(null, {points, colors, instance: inputs.pathMeshVariable, useVertexAlpha: true, updatable: inputs.updatable}, null);
            } else {
                inputs.pathMeshVariable.dispose();
                inputs.pathMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines('pathMesh${Math.random()}', {points, colors, updatable: inputs.updatable, useVertexAlpha: true}, BitByBit.scene);
                ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPathMesh'), VARIABLE_CATEGORY_NAME)} = inputs.pathMeshVariable;
            }

        } else {
            inputs.pathMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines('pathMesh${Math.random()}', {points, colors, updatable: inputs.updatable, useVertexAlpha: true}, BitByBit.scene);
            ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnPathMesh'), VARIABLE_CATEGORY_NAME)} = inputs.pathMeshVariable;
        }

        inputs.pathMeshVariable.enableEdgesRendering();
        inputs.pathMeshVariable.edgesWidth = inputs.width;
        const col = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        inputs.pathMeshVariable.edgesColor = new BitByBit.BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        inputs.pathMeshVariable.opacity =  inputs.opacity;
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
