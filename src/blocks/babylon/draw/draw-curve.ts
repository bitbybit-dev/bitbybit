import { Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { BlockValidationService } from '../../../blocks/validations/validation.service';
import { Validators } from '@angular/forms';
import { BlockValidations } from 'src/blocks/validations/block-validations';

export function createDrawCurveBlock() {

    const blockSelector = 'babylon_draw_curve';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw curve');
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('in colour');
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('opacity');
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('and width');
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Draws a coloured curve in space of selected width');
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: any) => {
        const valueCurve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(block, makeValidationModel(valueCurve, valueColour, valueOpacity, valueWidth));

        const code = `
(() => {
    const points = ${valueCurve}.tessellate();

    const colors = [];
    const pointsToRender = [];
    points.forEach(pt => {
        colors.push(new BABYLON.Color4(1, 1, 1, 0));
        pointsToRender.push(new BABYLON.Vector3(pt[0], pt[1], pt[2]));
    });

    const curves = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points: pointsToRender, colors, useVertexAlpha: true}, scene);

    curves.enableEdgesRendering();
    curves.edgesWidth = ${valueWidth ? valueWidth : 3};
    const col = BABYLON.Color3.FromHexString(${valueColour});
    curves.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
    curves.opacity = ${valueOpacity ? valueOpacity : 1};
})();
        `;
        return code;
    };
}

function makeValidationModel(valueCurve: any, valueColour: any, valueOpacity: any, valueWidth: any): { entity: any; validations: import("/Users/matasubarevicius/Documents/My Projects/bitbybit/src/blocks/validations/validation.model").ValidationModel[]; }[] {
    return [{
        entity: valueCurve,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: 'Curve was not provided',
            }
        ]
    },
    {
        entity: valueColour,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: 'Color was not provided',
            }
        ]
    },
    {
        entity: valueOpacity,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: 'Opacity was not provided',
            }, {
                validationFunc: BlockValidations.min,
                errorText: 'Opacity must be higher or equal to 0',
                validationData: {
                    length: 0
                }
            }, {
                validationFunc: BlockValidations.max,
                errorText: 'Opacity must be lower or equal to 1',
                validationData: {
                    length: 1
                }
            }
        ]
    },
    {
        entity: valueWidth,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: 'Width was not provided',
            }, {
                validationFunc: BlockValidations.min,
                errorText: 'Width must be higher or equal to 0',
                validationData: {
                    length: 0
                }
            }
        ]
    }];
}

