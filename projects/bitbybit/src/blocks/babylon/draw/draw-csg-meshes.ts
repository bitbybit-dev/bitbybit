import { ALIGN_RIGHT, Block, Blocks, VARIABLE_CATEGORY_NAME, FieldVariable } from 'blockly';
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

export function createDrawCsgMeshesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_csg_meshes';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('CsgMeshes')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_csg_meshes_input_csg_meshes)
                .appendField(new FieldVariable(resources.block_babylon_draw_csg_meshes_input_csg_meshes_variable), 'DrawnCsgMeshes')
                .appendField(resources.block_babylon_draw_csg_meshes_input_csg_meshes_2);
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
            this.setTooltip(resources.block_babylon_draw_csg_meshes_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            meshes: (JavaScript as any).valueToCode(block, 'CsgMeshes', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_mesh, resources.block_colour, resources.block_opacity
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.csgMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMeshes'), VARIABLE_CATEGORY_NAME)};

            let amountOfMeshesEqual = true;
            let children = [];
            if(inputs.csgMesh){
                children = inputs.csgMesh.getChildMeshes(true);
                if(children.length !== inputs.meshes.length){
                    amountOfMeshesEqual = false;
                    children.forEach(child => child.dispose());
                }
            }

            let localOrigin;
            if(inputs.csgMesh && inputs.updatable && amountOfMeshesEqual){
                localOrigin = inputs.csgMesh;
            }
            else {
                localOrigin = BitByBit.BABYLON.MeshBuilder.CreateBox('local_origin' + Math.random(), { size: 1 }, BitByBit.scene);
            }

            localOrigin.isVisible = false;

            inputs.meshes.forEach((mesh, index) => {
                let polygons = [];

                if(mesh.toPolygons){
                    polygons = mesh.toPolygons();
                } else if(mesh.polygons){
                    polygons = mesh.polygons;
                }

                const positions = [];
                const normals = [];
                const indices = [];
                let countIndices = 0;

                for (let polygon of polygons) {
                    if (polygon.vertices.length === 3) {
                        polygon.vertices.forEach(vert => {
                            positions.push(vert[0], vert[1], vert[2]);
                            indices.push(countIndices);
                            countIndices++;
                        });
                    } else {
                        const triangles = [];
                        const reversedVertices = polygon.vertices;
                        let firstVertex = reversedVertices[0]
                        for (let i = reversedVertices.length - 3; i >= 0; i--) {
                            triangles.push(
                                [
                                    firstVertex,
                                    reversedVertices[i + 1],
                                    reversedVertices[i + 2],
                                ]);
                        }
                        triangles.forEach((triangle, index) => {
                            triangle.forEach(vert => {
                                positions.push(vert[0], vert[1], vert[2]);
                                indices.push(countIndices);
                                countIndices++;
                            });
                        });
                    }
                }

                let newMesh;
                if(inputs.csgMesh && inputs.updatable && amountOfMeshesEqual){
                    newMesh = children[index];
                }
                else {
                    newMesh = new BitByBit.BABYLON.Mesh('csgMesh${Math.random()}', BitByBit.scene);
                }

                const vertexData = new BitByBit.BABYLON.VertexData();
                vertexData.positions = positions;
                vertexData.indices = indices;
                BitByBit.BABYLON.VertexData.ComputeNormals(positions, indices, normals, {useRightHandedSystem: false});
                vertexData.normals = normals;

                vertexData.applyToMesh(newMesh, inputs.updatable);
                newMesh.setPreTransformMatrix(BitByBit.BABYLON.Matrix.FromArray(mesh.transforms));

                newMesh.material = new BitByBit.BABYLON.StandardMaterial();

                newMesh.material.alpha = inputs.opacity;
                newMesh.material.diffuseColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
                newMesh.isPickable = false;
                newMesh.material.backFaceCulling = false;
                newMesh.parent = localOrigin;
            });

            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMeshes'), VARIABLE_CATEGORY_NAME)} = localOrigin;
`);
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
