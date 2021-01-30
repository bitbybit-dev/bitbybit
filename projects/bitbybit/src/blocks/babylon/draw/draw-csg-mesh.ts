import { ALIGN_RIGHT, Block, Blocks, VARIABLE_CATEGORY_NAME, FieldVariable } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface
} from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { solidConstants } from '../../csg/solid-constants';

export function createDrawCsgMeshBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_csg_mesh';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_csg_mesh_input_csg_mesh)
                .appendField(new FieldVariable(resources.block_babylon_draw_csg_mesh_input_csg_mesh_variable), 'DrawnCsgMesh')
                .appendField(resources.block_babylon_draw_csg_mesh_input_csg_mesh_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_csg_mesh_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidHelpUrl + '#' + 'drawsolidorpolygonmesh');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            mesh: (JavaScript as any).valueToCode(block, 'CsgMesh', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            jscadMesh: undefined,
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_mesh, resources.block_colour, resources.block_opacity
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.jscadMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMesh'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.jscad.drawSolidOrPolygonMesh(inputs);`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_mesh)
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
    }];
}
