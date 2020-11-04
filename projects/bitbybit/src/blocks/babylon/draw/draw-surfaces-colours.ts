import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';

// This component can probably be better implemented with SubMeshes and MultiMaterials of BabylonJS
export function createDrawSurfacesColoursBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_surfaces_colours';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Surfaces')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_surfaces)
                .appendField(new FieldVariable(resources.block_babylon_draw_surfaces_colours_input_surfaces_variable), 'DrawnSurfaceMeshes')
                .appendField(resources.block_babylon_draw_surfaces_colours_input_surfaces_2);
            this.appendValueInput('Colours')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_colours.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_opacity.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surfaces_colours_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surfaces: (JavaScript as any).valueToCode(block, 'Surfaces', (JavaScript as any).ORDER_ATOMIC),
            colours: (JavaScript as any).valueToCode(block, 'Colours', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surfaces, resources.block_colour, resources.block_opacity, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
inputs.surfaceMeshes = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMeshes'), VARIABLE_CATEGORY_NAME)};

if(inputs.surfaceMeshes && inputs.updatable){
    inputs.surfaceMeshes.forEach(srf => srf.dispose());
}

inputs.surfaceMeshes = [];
inputs.surfaces.forEach((srf, index) => {
    const meshData = srf.tessellate();

    const meshDataConverted = {
        positions: [],
        indices: [],
        normals: [],
    }

    let countIndices = 0;

    meshData.faces.forEach((faceIndices) => {
        faceIndices.forEach((x) => {
            const vn = meshData.normals[x];
            meshDataConverted.normals.push( vn[0], vn[1], vn[2] );

            const pt = meshData.points[x];
            meshDataConverted.positions.push( pt[0], pt[1], pt[2] );

            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
    });

    const customMeshForSurface = new BitByBit.BABYLON.Mesh('custom${Math.random()}', BitByBit.scene);

    const vertexData = new BitByBit.BABYLON.VertexData();

    vertexData.positions = meshDataConverted.positions;
    vertexData.indices = meshDataConverted.indices;
    vertexData.normals = meshDataConverted.normals;

    vertexData.applyToMesh(customMeshForSurface);
    customMeshForSurface.material = new BitByBit.BABYLON.StandardMaterial();
    customMeshForSurface.material.alpha = inputs.opacity;
    customMeshForSurface.material.diffuseColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colours[index]);
    customMeshForSurface.material.backFaceCulling = false;
    customMeshForSurface.isPickable = false;

    inputs.surfaceMeshes.push(customMeshForSurface);
});
${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnSurfaceMeshes'), VARIABLE_CATEGORY_NAME)} = inputs.surfaceMeshes;
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
            getRequired(resources, resources.block_surfaces),
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
