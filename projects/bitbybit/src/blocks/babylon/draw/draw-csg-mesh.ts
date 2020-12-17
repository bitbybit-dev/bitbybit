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
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            mesh: (JavaScript as any).valueToCode(block, 'CsgMesh', (JavaScript as any).ORDER_ATOMIC),
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
            let polygons = [];

            if(inputs.mesh.toPolygons){
                polygons = inputs.mesh.toPolygons();
            } else if(inputs.mesh.polygons){
                polygons = inputs.mesh.polygons
            } else if(inputs.mesh.sides || inputs.mesh.vertices){
                const extrusion = BitByBit.CSG.extrusions.extrudeLinear({height: 0.001, twistAngle: 0, twistSteps: 1}, inputs.mesh);
                if(extrusion.toPolygons){
                    polygons = extrusion.toPolygons();
                } else if(extrusion.polygons){
                    polygons = extrusion.polygons
                }
            }

            inputs.csgMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMesh'), VARIABLE_CATEGORY_NAME)};

            const positions = [];
            const normals = [];
            const indices = [];
            let countIndices = 0;

            for (let polygon of polygons) {
                if (polygon.vertices.length === 3) {
                    polygon.vertices.reverse().forEach(vert => {
                        positions.push(vert[0], vert[1], vert[2]);
                        indices.push(countIndices);
                        countIndices++;
                    });
                } else {
                    const triangles = [];
                    const reversedVertices = polygon.vertices.reverse();
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

            const createMesh = () => {
                const vertexData = new BitByBit.BABYLON.VertexData();
                vertexData.positions = positions;
                vertexData.indices = indices;
                BitByBit.BABYLON.VertexData.ComputeNormals(positions, indices, normals, {useRightHandedSystem: true});
                vertexData.normals = normals;

                vertexData.applyToMesh(inputs.csgMesh, inputs.updatable);
                inputs.csgMesh.setPreTransformMatrix(BitByBit.BABYLON.Matrix.FromArray(inputs.mesh.transforms));
                ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCsgMesh'), VARIABLE_CATEGORY_NAME)} = inputs.csgMesh;
            }

            if(inputs.csgMesh && inputs.updatable){
                createMesh();
            } else {
                inputs.csgMesh = new BitByBit.BABYLON.Mesh('csgMesh${Math.random()}', BitByBit.scene);
                createMesh();
                inputs.csgMesh.material = new BitByBit.BABYLON.StandardMaterial();
            }

            inputs.csgMesh.material.alpha = inputs.opacity;
            inputs.csgMesh.material.diffuseColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
            inputs.csgMesh.isPickable = false;
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
