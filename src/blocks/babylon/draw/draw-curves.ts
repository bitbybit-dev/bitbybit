import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BlockValidationService,
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
                .appendField(resources.block_babylon_input_curves);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_width);
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
            width: JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_colour, resources.block_opacity, resources.block_width])
        );

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
`
        const curvesForRender = [];
        const col = BABYLON.Color3.FromHexString(inputs.colour);
        const colors = [];
        inputs.curves.forEach(curve => {
            const points = curve.tessellate();
            curvesForRender.push(points.map(pt => new BABYLON.Vector3(pt[0], pt[1], pt[2])));
            colors.push(points.map(pt => new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity)));
        });

        const curvesMesh = BABYLON.MeshBuilder.CreateLineSystem('lines${Math.random()}', {lines: curvesForRender, colors, useVertexAlpha: true}, scene);

        curvesMesh.enableEdgesRendering();
        curvesMesh.edgesWidth = inputs.width;
        curvesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity);
        curvesMesh.opacity = inputs.opacity;
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
