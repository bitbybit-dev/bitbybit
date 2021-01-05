import { Injectable } from '@angular/core';
import { Color3, Mesh, StandardMaterial, VertexData } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for nurbs surfaces.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class Surface {

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
    drawSurface(inputs: Inputs.Surface.DrawSurfaceDto): Mesh {
        const meshData = inputs.surface.tessellate();

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices) => {
            faceIndices.forEach((x) => {
                const vn = meshData.normals[x];
                meshDataConverted.normals.push(vn[0], vn[1], vn[2]);
                const pt = meshData.points[x];
                meshDataConverted.positions.push(pt[0], pt[1], pt[2]);
                meshDataConverted.indices.push(countIndices);
                countIndices++;
            });
        });

        const createMesh = () => {
            const vertexData = new VertexData();
            vertexData.positions = meshDataConverted.positions;
            vertexData.indices = meshDataConverted.indices;
            vertexData.normals = meshDataConverted.normals;
            vertexData.applyToMesh(inputs.surfaceMesh, inputs.updatable);
        };

        if (inputs.surfaceMesh && inputs.updatable) {
            createMesh();
        } else {
            inputs.surfaceMesh = new Mesh(`surface${Math.random()}`, this.context.scene);
            createMesh();
            inputs.surfaceMesh.material = new StandardMaterial(`surfaceMaterial${Math.random()}`, this.context.scene);
        }

        const material = inputs.surfaceMesh.material as StandardMaterial;
        material.alpha = inputs.opacity;
        material.diffuseColor = Color3.FromHexString(inputs.colour);
        material.specularColor = new Color3(1, 1, 1);
        material.ambientColor = new Color3(1, 1, 1);
        material.backFaceCulling = false;
        inputs.surfaceMesh.isPickable = false;
        return inputs.surfaceMesh;
    }

}
