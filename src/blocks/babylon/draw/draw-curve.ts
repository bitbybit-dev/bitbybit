import { Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { BlockValidationService } from '../../../blocks/validations/validation.service';
import { BlockValidations } from '../../../blocks/validations/block-validations';
import { ResourcesService } from '../../../resources/resources.service';
import { ResourcesInterface } from '../../../resources/resources.interface';
import { ValidationEntityInterface } from '../../../blocks/validations/validation-entity.interface';

export function createDrawCurveBlock() {
    const resources = ResourcesService.getResourcesForSelectedLanguage();

    const blockSelector = 'babylon_draw_curve';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_curve_input_curve);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_curve_input_color);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_curve_input_opacity);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_curve_input_width);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_curve_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: any) => {
        const valueCurve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(block, makeValidationModel(resources, valueCurve, valueColour, valueOpacity, valueWidth));

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
    curves.edgesWidth = ${valueWidth};
    const col = BABYLON.Color3.FromHexString(${valueColour});
    curves.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
    curves.opacity = ${valueOpacity};
})();
        `;
        return code;
    };
}

function makeValidationModel(resources: ResourcesInterface,
                             valueCurve: any, valueColour: any, valueOpacity: any,
                             valueWidth: any): ValidationEntityInterface[] {
    return [{
        entity: valueCurve,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: `${resources.block_curve} ${resources.block_validation_required}`,
            }
        ]
    },
    {
        entity: valueColour,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: `${resources.block_color} ${resources.block_validation_required}`,
            }
        ]
    },
    {
        entity: valueOpacity,
        validations: [
            {
                validationFunc: BlockValidations.required,
                errorText: `${resources.block_opacity} ${resources.block_validation_required}`,
            }, {
                validationFunc: BlockValidations.min,
                errorText: `${resources.block_opacity} ${resources.block_validation_higher_or_equal} 0`,
                validationData: {
                    length: 0
                }
            }, {
                validationFunc: BlockValidations.max,
                errorText: `${resources.block_opacity} ${resources.block_validation_lower_or_equal} 1`,
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
                errorText: `${resources.block_width} ${resources.block_validation_required}`,
            }, {
                validationFunc: BlockValidations.min,
                errorText: `${resources.block_width} ${resources.block_validation_higher_or_equal} 0`,
                validationData: {
                    length: 0
                }
            }
        ]
    }];
}

