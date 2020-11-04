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

export function createDrawPolylinesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_polylines';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Polylines')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_polylines)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_polylines_variable), 'DrawnPolylinesMesh')
                .appendField(resources.block_babylon_input_draw_polylines_2);
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
            this.setTooltip(resources.block_babylon_draw_polylines_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            polylines: (JavaScript as any).valueToCode(block, 'Polylines', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
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
        inputs.linesMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPolylinesMesh'), VARIABLE_CATEGORY_NAME)};
        const linesForRender = [];
        inputs.polylines.forEach(polyline => {
            linesForRender.push(polyline.points.map(pt => new BitByBit.BABYLON.Vector3(pt[0], pt[1], pt[2])));
        });

        if(inputs.linesMesh && inputs.updatable) {

            if(inputs.linesMesh.getTotalVertices() / 2 === linesForRender.length){
                inputs.linesMesh = BitByBit.BABYLON.MeshBuilder.CreateLineSystem(null, {lines: linesForRender, instance: inputs.linesMesh, useVertexAlpha: true, updatable: inputs.updatable}, null);
            } else {
                inputs.linesMesh.dispose();
                inputs.linesMesh = BitByBit.BABYLON.MeshBuilder.CreateLineSystem('lines${Math.random()}', {lines: linesForRender, useVertexAlpha: true, updatable: inputs.updatable}, BitByBit.scene);
                ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPolylinesMesh'), VARIABLE_CATEGORY_NAME)} = inputs.linesMesh;
            }

        } else {
            inputs.linesMesh = BitByBit.BABYLON.MeshBuilder.CreateLineSystem('lines${Math.random()}', {lines: linesForRender, useVertexAlpha: true, updatable: inputs.updatable}, BitByBit.scene);
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPolylinesMesh'), VARIABLE_CATEGORY_NAME)} = inputs.linesMesh;
        }

        inputs.linesMesh.enableEdgesRendering();
        inputs.linesMesh.edgesWidth = inputs.width;
        const col = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        inputs.linesMesh.edgesColor = new BitByBit.BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        inputs.linesMesh.opacity = inputs.opacity;
`);
    };
}


function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_polyline)
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

