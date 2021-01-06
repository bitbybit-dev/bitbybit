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
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfaceMesh,
            inputs.updatable,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Draws multiple surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurfaces.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Surface.DrawSurfacesDto): Mesh {
        const tessellatedSurfaces = [];
        inputs.surfaces.forEach(srf => {
            tessellatedSurfaces.push(srf.tessellate());
        });

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        }

        let countIndices = 0;
        tessellatedSurfaces.forEach(meshData => {
            meshData.faces.forEach((faceIndices) => {
                countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
            });
        });

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfacesMesh,
            inputs.updatable,
            inputs.opacity,
            inputs.colour
        );
    }

    private createOrUpdateSurfaceMesh(
        meshDataConverted: { positions: any[]; indices: any[]; normals: any[]; },
        mesh: Mesh, updatable: boolean, opacity: number, colour: string
    ): Mesh {
        const createMesh = () => {
            const vertexData = new VertexData();
            vertexData.positions = meshDataConverted.positions;
            vertexData.indices = meshDataConverted.indices;
            vertexData.normals = meshDataConverted.normals;
            vertexData.applyToMesh(mesh, updatable);
        };

        if (mesh && updatable) {
            mesh.dispose();
            createMesh();
        } else {
            mesh = new Mesh(`surface${Math.random()}`, this.context.scene);
            createMesh();
            mesh.material = new StandardMaterial(`surfaceMaterial${Math.random()}`, this.context.scene);
        }

        const material = mesh.material as StandardMaterial;
        material.alpha = opacity;
        material.diffuseColor = Color3.FromHexString(colour);
        material.specularColor = new Color3(1, 1, 1);
        material.ambientColor = new Color3(1, 1, 1);
        material.backFaceCulling = false;
        mesh.isPickable = false;
        return mesh;
    }

    private parseFaces(
        faceIndices: any,
        meshData: any,
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; },
        countIndices: number): number {
        faceIndices.forEach((x) => {
            const vn = meshData.normals[x];
            meshDataConverted.normals.push(vn[0], vn[1], vn[2]);
            const pt = meshData.points[x];
            meshDataConverted.positions.push(pt[0], pt[1], pt[2]);
            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
        return countIndices;
    }
}
