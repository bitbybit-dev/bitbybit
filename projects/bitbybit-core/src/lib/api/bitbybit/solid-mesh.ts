import { Injectable } from '@angular/core';
import { Color3, Matrix, Mesh, MeshBuilder, StandardMaterial, VertexData } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidMesh {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) { }

    /**
     * Draws a single surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurface.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.SolidMesh.DrawSolidMeshDto): Mesh {
        let polygons = [];

        if (inputs.mesh.toPolygons) {
            polygons = inputs.mesh.toPolygons();
        } else if (inputs.mesh.polygons) {
            polygons = inputs.mesh.polygons;
        } else if (inputs.mesh.sides || inputs.mesh.vertices) {
            const extrusion = this.context.jscad.extrusions.extrudeLinear({ height: 0.001, twistAngle: 0, twistSteps: 1 }, inputs.mesh);
            if (extrusion.toPolygons) {
                polygons = extrusion.toPolygons();
            } else if (extrusion.polygons) {
                polygons = extrusion.polygons;
            }
        }

        const positions = [];
        const normals = [];
        const indices = [];
        let countIndices = 0;

        for (const polygon of polygons) {
            if (polygon.vertices.length === 3) {
                polygon.vertices.reverse().forEach(vert => {
                    positions.push(vert[0], vert[1], vert[2]);
                    indices.push(countIndices);
                    countIndices++;
                });
            } else {
                const triangles = [];
                const reversedVertices = polygon.vertices.reverse();
                const firstVertex = reversedVertices[0];
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


        if (inputs.jscadMesh && inputs.updatable) {
            this.createMesh(positions, indices, normals, inputs.jscadMesh, inputs.mesh.transforms, inputs.updatable);
        } else {
            inputs.jscadMesh = new Mesh(`jscadMesh${Math.random()}`, this.context.scene);
            this.createMesh(positions, indices, normals, inputs.jscadMesh, inputs.mesh.transforms, inputs.updatable);
            inputs.jscadMesh.material = new StandardMaterial(`jscadMaterial${Math.random()}`, this.context.scene);
        }

        const material = inputs.jscadMesh.material as StandardMaterial;
        material.alpha = inputs.opacity;
        material.diffuseColor = Color3.FromHexString(inputs.colour);
        inputs.jscadMesh.isPickable = false;
        return inputs.jscadMesh;
    }


    /**
     * Draws a single surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurface.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.SolidMesh.DrawSolidsMeshDto): Mesh {

        let amountOfMeshesEqual = true;
        let children = [];
        if (inputs.jscadMesh) {
            children = inputs.jscadMesh.getChildMeshes(true);
            if (children.length !== inputs.meshes.length) {
                amountOfMeshesEqual = false;
                children.forEach(child => child.dispose());
            }
        }

        let localOrigin;
        if (inputs.jscadMesh && inputs.updatable && amountOfMeshesEqual) {
            localOrigin = inputs.jscadMesh;
        }
        else {
            localOrigin = MeshBuilder.CreateBox('local_origin' + Math.random(), { size: 1 }, this.context.scene);
        }

        localOrigin.isVisible = false;

        inputs.meshes.forEach((mesh, index) => {
            let newMesh;
            if (inputs.jscadMesh && inputs.updatable && amountOfMeshesEqual) {
                newMesh = children[index];
            }
            else {
                newMesh = new Mesh(`jscadMesh${Math.random()}`, this.context.scene);
            }

            newMesh = this.drawSolidOrPolygonMesh({
                mesh, jscadMesh: newMesh, colour: inputs.colour, updatable: inputs.updatable, opacity: inputs.opacity
            });
            newMesh.parent = localOrigin;

            // let polygons = [];

            // if (mesh.toPolygons) {
            //     polygons = mesh.toPolygons();
            // } else if (mesh.polygons) {
            //     polygons = mesh.polygons;
            // }

            // const positions = [];
            // const normals = [];
            // const indices = [];
            // let countIndices = 0;

            // for (const polygon of polygons) {
            //     if (polygon.vertices.length === 3) {
            //         polygon.vertices.forEach(vert => {
            //             positions.push(vert[0], vert[1], vert[2]);
            //             indices.push(countIndices);
            //             countIndices++;
            //         });
            //     } else {
            //         const triangles = [];
            //         const reversedVertices = polygon.vertices;
            //         const firstVertex = reversedVertices[0];
            //         for (let i = reversedVertices.length - 3; i >= 0; i--) {
            //             triangles.push(
            //                 [
            //                     firstVertex,
            //                     reversedVertices[i + 1],
            //                     reversedVertices[i + 2],
            //                 ]);
            //         }
            //         triangles.forEach((triangle) => {
            //             triangle.forEach(vert => {
            //                 positions.push(vert[0], vert[1], vert[2]);
            //                 indices.push(countIndices);
            //                 countIndices++;
            //             });
            //         });
            //     }
            // }



            // this.createMesh(positions, indices, normals, inputs.jscadMesh, mesh.transforms, inputs.updatable);

            // newMesh.material = new StandardMaterial(`jscadMaterial${Math.random()}`, this.context.scene);

            // newMesh.material.alpha = inputs.opacity;
            // newMesh.material.diffuseColor = Color3.FromHexString(inputs.colour);
            // newMesh.isPickable = false;
            // newMesh.material.backFaceCulling = false;
            // newMesh.parent = localOrigin;
        });

        return localOrigin;
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: Mesh, transforms: number[], updatable: boolean
    ): void {
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        VertexData.ComputeNormals(positions, indices, normals, { useRightHandedSystem: true });
        vertexData.normals = normals;

        vertexData.applyToMesh(jscadMesh, updatable);
        jscadMesh.setPreTransformMatrix(Matrix.FromArray(transforms));
    }
}
