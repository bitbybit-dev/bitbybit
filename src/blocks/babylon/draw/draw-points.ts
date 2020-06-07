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

export function createDrawPointsBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_points);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('in colour');
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('opacity');
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('and size');
            this.setInputsInline(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            points: JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            size: JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points, resources.block_colour, resources.block_opacity, resources.block_size
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs,
`
        let vectorPoints = inputs.points;
        let colour = BABYLON.Color3.FromHexString(inputs.colour);

        let customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

        let positions = [];
        let colors = [];

        let pointsCount = vectorPoints.length;
        vectorPoints.forEach(p =>  {
            positions.push(...p);
            colors.push(colour.r, colour.g, colour.b, 1);
        });

        let vertexData = new BABYLON.VertexData();

        vertexData.positions = positions;
        vertexData.colors = colors;

        vertexData.applyToMesh(customMesh);

        let mat = new BABYLON.StandardMaterial("mat${Math.random()}", scene);
        mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        mat.disableLighting = true;
        mat.pointsCloud = true;
        mat.alpha = inputs.opacity;
        mat.pointSize = inputs.size;

        customMesh.material = mat;
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
