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

export function createDrawCurvesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_curves';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_curves)
                .appendField(new FieldVariable(resources.block_babylon_input_curves_variable), 'DrawnCurvesMesh')
                .appendField(resources.block_babylon_input_curves_2);
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
            this.setTooltip(resources.block_babylon_draw_curves_description);
        }
    };

    JavaScript.babylon_draw_curves = (block: Block) => {

        const inputs = {
            curves: JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC),
            updatable: JavaScript.valueToCode(block, 'Updatable', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_colour, resources.block_opacity, resources.block_width, resources.block_updatable])
        );

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.curvesMesh = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnCurvesMesh'), VARIABLE_CATEGORY_NAME)};

        const curvesForRender = [];
        const col = BABYLON.Color3.FromHexString(inputs.colour);
        const colors = [];
        const totalPoints = [];

        inputs.curves.forEach(curve => {
            const points = curve.tessellate();
            totalPoints.push(points.length);
            curvesForRender.push(points.map(pt => new BABYLON.Vector3(pt[0], pt[1], pt[2])));
            colors.push(points.map(pt => new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity)));
        });

        const validateCurvePointNumber = (old, newPoints) => {
            if(old.length !== newPoints.length){
                return false;
            } else {
                for(let i = 0; i < old.length; i++){
                    if(old[i] !== newPoints[i]) {
                        return false;
                        break;
                    }
                }
                return true;
            }
        }

        if(inputs.curvesMesh && inputs.updatable) {
            if(validateCurvePointNumber(inputs.curvesMesh.totalPoints, totalPoints)){
                inputs.curvesMesh = BABYLON.MeshBuilder.CreateLineSystem(null, {lines: curvesForRender, instance: inputs.curvesMesh, colors, useVertexAlpha: true, updatable: inputs.updatable}, null);
            } else {
                inputs.curvesMesh.dispose();
                inputs.curvesMesh = BABYLON.MeshBuilder.CreateLineSystem('lines${Math.random()}', {lines: curvesForRender, colors, useVertexAlpha: true, updatable: inputs.updatable}, scene);
                ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnCurvesMesh'), VARIABLE_CATEGORY_NAME)} = inputs.curvesMesh;
            }
        } else {
            inputs.curvesMesh = BABYLON.MeshBuilder.CreateLineSystem('lines${Math.random()}', {lines: curvesForRender, colors, useVertexAlpha: true, updatable: inputs.updatable}, scene);
            ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnCurvesMesh'), VARIABLE_CATEGORY_NAME)} = inputs.curvesMesh;
        }

        inputs.curvesMesh.totalPoints = totalPoints;
        inputs.curvesMesh.enableEdgesRendering();
        inputs.curvesMesh.edgesWidth = inputs.width;
        inputs.curvesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        inputs.curvesMesh.opacity = inputs.opacity;
`
        );
    };
}


function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_curves)
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
