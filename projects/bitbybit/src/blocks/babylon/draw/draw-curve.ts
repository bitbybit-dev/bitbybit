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

export function createDrawCurveBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_curve';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Curve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_curve)
                .appendField(new FieldVariable(resources.block_babylon_input_curve_variable), 'DrawnCurveMesh')
                .appendField(resources.block_babylon_input_curve_2);
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
            this.setTooltip(resources.block_babylon_draw_curve_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            curve: (JavaScript as any).valueToCode(block, 'Curve', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_colour, resources.block_opacity, resources.block_width
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.curveMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCurveMesh'), VARIABLE_CATEGORY_NAME)};

        const points = inputs.curve.tessellate();

        const colors = [];
        const pointsToRender = [];
        points.forEach(pt => {
            colors.push(new BitByBit.BABYLON.Color4(1, 1, 1, 0));
            pointsToRender.push(new BitByBit.BABYLON.Vector3(pt[0], pt[1], pt[2]));
        });

        if(inputs.curveMesh && inputs.updatable){
            if(inputs.curveMesh.getTotalVertices() === points.length){
                inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines(null, {points: pointsToRender, colors, instance: inputs.curveMesh, useVertexAlpha: true, updatable: inputs.updatable}, null);
            } else {
                inputs.curveMesh.dispose();
                inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines('curves${Math.random()}', {points: pointsToRender, colors, useVertexAlpha: true, updatable: inputs.updatable}, BitByBit.scene);
                ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCurveMesh'), VARIABLE_CATEGORY_NAME)} = inputs.curveMesh;
            }
        } else {
            inputs.curveMesh = BitByBit.BABYLON.MeshBuilder.CreateLines('curves${Math.random()}', {points: pointsToRender, colors, useVertexAlpha: true, updatable: inputs.updatable}, BitByBit.scene);
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCurveMesh'), VARIABLE_CATEGORY_NAME)} = inputs.curveMesh;
        }

        inputs.curveMesh.enableEdgesRendering();
        inputs.curveMesh.edgesWidth = inputs.width;
        const col = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        inputs.curveMesh.edgesColor = new BitByBit.BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        inputs.curveMesh.opacity = inputs.opacity;
`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_curve)
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
