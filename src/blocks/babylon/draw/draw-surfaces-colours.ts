import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
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
                .appendField(resources.block_babylon_draw_surfaces_colours_input_surfaces);
            this.appendValueInput('Colours')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_colours.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_surfaces_colours_input_opacity.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surfaces_colours_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surfaces: JavaScript.valueToCode(block, 'Surfaces', JavaScript.ORDER_ATOMIC),
            colours: JavaScript.valueToCode(block, 'Colours', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surfaces, resources.block_colour, resources.block_opacity
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
`
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

    const customMeshForSurface = new BABYLON.Mesh('custom${Math.random()}', scene);

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = meshDataConverted.positions;
    vertexData.indices = meshDataConverted.indices;
    vertexData.normals = meshDataConverted.normals;

    vertexData.applyToMesh(customMeshForSurface);
    customMeshForSurface.material = new BABYLON.StandardMaterial();
    customMeshForSurface.material.alpha = inputs.opacity;
    customMeshForSurface.material.diffuseColor = BABYLON.Color3.FromHexString(inputs.colours[index]);
    customMeshForSurface.material.backFaceCulling = false;
    customMeshForSurface.isPickable = false;
});
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
