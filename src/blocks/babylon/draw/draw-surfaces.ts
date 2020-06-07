import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawSurfacesBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_surfaces';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Surfaces')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_surfaces);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surfaces_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            surfaces: JavaScript.valueToCode(block, 'Surfaces', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_surfaces, resources.block_colour, resources.block_opacity
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs,
`
        const allMeshDatas = [];
        inputs.surfaces.forEach(srf => {
            allMeshDatas.push(srf.tessellate());
        });

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        }

        let countIndices = 0;

        allMeshDatas.forEach(meshData => {
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
        });

        const customMeshForSurface = new BABYLON.Mesh('custom${Math.random()}', scene);

        const vertexData = new BABYLON.VertexData();

        vertexData.positions = meshDataConverted.positions;
        vertexData.indices = meshDataConverted.indices;
        vertexData.normals = meshDataConverted.normals;

        vertexData.applyToMesh(customMeshForSurface);
        customMeshForSurface.material = new BABYLON.StandardMaterial();
        customMeshForSurface.material.alpha = inputs.opacity;
        customMeshForSurface.material.diffuseColor = BABYLON.Color3.FromHexString(inputs.colour);
        customMeshForSurface.material.backFaceCulling = false;
        customMeshForSurface.isPickable = false;
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
