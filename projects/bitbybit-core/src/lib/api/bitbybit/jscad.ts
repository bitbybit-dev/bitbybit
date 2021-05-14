import { Injectable } from '@angular/core';
import { Color3, Color4, LinesMesh, Matrix, Mesh, MeshBuilder, PBRMetallicRoughnessMaterial, Vector3, VertexData } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { JSCADBooleans } from './jscad-booleans';
import { JSCADExpansions } from './jscad-expansions';
import { JSCADExtrusions } from './jscad-extrusions';
import { JSCADHulls } from './jscad-hulls';
import { JSCADPath } from './jscad-path';
import { JSCADPolygon } from './jscad-polygon';
import { JSCADShapes } from './jscad-shapes';
import { JSCADText } from './jscad-text';

/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class JSCAD {

    constructor(
        public readonly booleans: JSCADBooleans,
        public readonly expansions: JSCADExpansions,
        public readonly extrusions: JSCADExtrusions,
        public readonly hulls: JSCADHulls,
        public readonly path: JSCADPath,
        public readonly polygon: JSCADPolygon,
        public readonly shapes: JSCADShapes,
        public readonly text: JSCADText,
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) { }

    /**
     * Draws a single solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawSolidOrPolygonMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmesh
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Mesh {
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
                polygon.vertices.forEach(vert => {
                    positions.push(vert[0], vert[1], vert[2]);
                    indices.push(countIndices);
                    countIndices++;
                });
            } else {
                const triangles = [];
                const reversedVertices = polygon.vertices;
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
            inputs.jscadMesh.material = new PBRMetallicRoughnessMaterial(`jscadMaterial${Math.random()}`, this.context.scene);
        }

        const pbr = inputs.jscadMesh.material as PBRMetallicRoughnessMaterial;
        pbr.baseColor = Color3.FromHexString(inputs.colour);
        pbr.metallic = 1.0;
        pbr.roughness = 0.6;
        pbr.alpha = inputs.opacity;
        pbr.alphaMode = 1;
        pbr.backFaceCulling = false;
        pbr.zOffset = 2;
        inputs.jscadMesh.isPickable = false;
        return inputs.jscadMesh;
    }

    /**
     * Draws multiple solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawSolidOrPolygonMeshes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmeshes
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidsMeshDto): Mesh {
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
        });

        return localOrigin;
    }

    /**
     * Draws a 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/drawPath.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawpath
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawPath(inputs: Inputs.JSCAD.DrawPathDto): LinesMesh {

        const points = [];
        const colors = [];

        if (inputs.path.points) {
            inputs.path.points.forEach(pt => {
                points.push(new Vector3(pt[0], 0, pt[1]));
                colors.push(new Color4(1, 1, 1, 0));
            });

            if (inputs.path.isClosed) {
                const pt = inputs.path.points[0];
                points.push(new Vector3(pt[0], 0, pt[1]));
                colors.push(new Color4(1, 1, 1, 0));
            }
        }

        return this.geometryHelper.drawPolylineFromPointsAndColours(
            inputs.pathMesh,
            inputs.updatable,
            points,
            colors,
            inputs.width,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/transformSolids.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolids
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any {
        const solidsToTransform = inputs.solids;
        return solidsToTransform.map(solid => {
            return this.transformSolid({ solid, matrix: inputs.matrix });
        });
    }

    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/transformSolid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolid
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any {
        const transformation = inputs.matrix;
        let transformedMesh = this.context.jscad.geometries.geom3.clone(inputs.solid);
        if (this.geometryHelper.getArrayDepth(transformation) === 1) {
            transformation.forEach(transform => {
                transformedMesh = this.context.jscad.transforms.transform(transform, transformedMesh);
            });
        }
        else if (this.geometryHelper.getArrayDepth(transformation) === 2) {
            transformation.forEach(transforms => {
                transforms.forEach(mat => {
                    transformedMesh = this.context.jscad.transforms.transform(mat, transformedMesh);
                });
            });
        }
        else {
            transformedMesh = this.context.jscad.transforms.transform(transformation, transformedMesh);
        }
        return transformedMesh;
    }

    /**
     * Downloads the binary STL file from a 3D solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/downloadSolidSTL.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidstl
     * @param inputs 3D Solid
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): void {
        const rawData = this.context.jscad.STLSERIALIZER.serialize({ binary: true },
            this.context.jscad.transforms.mirror({ normal: [1, 0, 0] }, inputs.solid)
        );
        this.downloadSTL(rawData, inputs.fileName);
    }

    /**
     * Downloads the binary STL file from a 3D solids
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/downloadSolidsSTL.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidsstl
     * @param inputs 3D Solid
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): void {
        const rawData = this.context.jscad.STLSERIALIZER.serialize({ binary: true },
            ...inputs.solids.map(solid => {
                return this.context.jscad.transforms.mirror({ normal: [1, 0, 0] }, solid);
            }));
        this.downloadSTL(rawData, inputs.fileName);
    }

    private downloadSTL(rawData: any, fileName: string): void {
        const madeBlob = new Blob(rawData, { type: 'application/sla' });
        const blobUrl = URL.createObjectURL(madeBlob);

        const fileLink = document.createElement('a');
        fileLink.href = blobUrl;
        fileLink.target = '_self';
        fileLink.download = fileName + '.stl';
        fileLink.click();
        fileLink.remove();
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
