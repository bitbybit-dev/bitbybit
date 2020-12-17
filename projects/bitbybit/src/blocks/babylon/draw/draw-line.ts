
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

export function createDrawLineBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_line';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_line)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_line_variable), 'DrawnLineMesh')
                .appendField(resources.block_babylon_input_draw_line_2);
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
            this.setTooltip(resources.block_babylon_draw_line_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            line: (JavaScript as any).valueToCode(block, 'Line', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line, resources.block_colour, resources.block_opacity, resources.block_width, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.lineMeshVariable = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnLineMesh'), VARIABLE_CATEGORY_NAME)};

        const line = inputs.line;

        const points = [
            new BitByBit.BABYLON.Vector3(line.start[0], line.start[1], line.start[2]),
            new BitByBit.BABYLON.Vector3(line.end[0], line.end[1], line.end[2])
        ];

        if(inputs.lineMeshVariable && inputs.updatable){
            inputs.lineMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines(null, {points, instance: inputs.lineMeshVariable, useVertexAlpha: true, updatable: inputs.updatable}, null);
        } else {
            inputs.lineMeshVariable = BitByBit.BABYLON.MeshBuilder.CreateLines('lines${Math.random()}', {points, updatable: inputs.updatable, useVertexAlpha: true}, BitByBit.scene);
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnLineMesh'), VARIABLE_CATEGORY_NAME)} = inputs.lineMeshVariable;
        }

        inputs.lineMeshVariable.enableEdgesRendering();
        inputs.lineMeshVariable.edgesWidth = inputs.width;
        const edgeColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
        inputs.lineMeshVariable.edgesColor = new BitByBit.BABYLON.Color4(edgeColor.r, edgeColor.g, edgeColor.b, inputs.opacity);
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
            getRequired(resources, resources.block_line)
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

