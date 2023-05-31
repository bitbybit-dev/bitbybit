import { VectorHelperService } from 'bitbybit-occt';
import { JSCADExpansions } from './services/jscad-expansions';
import { JSCADBooleans } from './services/jscad-booleans';
import { JSCADExtrusions } from './services/jscad-extrusions';
import { JSCADPath } from './services/jscad-path';
import { JSCADPolygon } from './services/jscad-polygon';
import { JSCADShapes } from './services/jscad-shapes';
import { JSCADText } from './services/jscad-text';
import * as Inputs from '../../api/inputs/jscad-inputs';
import { JSCADHulls } from './services/jscad-hulls';

// Worker make an instance of this class itself
export class Jscad {

    private jscad: any;

    public booleans: JSCADBooleans;
    public expansions: JSCADExpansions;
    public extrusions: JSCADExtrusions;
    public hulls: JSCADHulls;
    public path: JSCADPath;
    public polygon: JSCADPolygon;
    public shapes: JSCADShapes;
    public text: JSCADText;

    constructor(jscad: any) {
        const vecHelper = new VectorHelperService();
        this.booleans = new JSCADBooleans(jscad);
        this.expansions = new JSCADExpansions(jscad);
        this.extrusions = new JSCADExtrusions(jscad, vecHelper);
        this.hulls = new JSCADHulls(jscad);
        this.path = new JSCADPath(jscad, vecHelper);
        this.polygon = new JSCADPolygon(jscad, vecHelper);
        this.shapes = new JSCADShapes(jscad);
        this.text = new JSCADText(jscad);
        this.jscad = jscad;
    }

    shapesToMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto): { positions: number[], normals: number[], indices: number[], transforms: [] }[] {
        return inputs.meshes.map(mesh => {
            return this.shapeToMesh({...inputs, mesh});
        });
    }

    shapeToMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): { positions: number[], normals: number[], indices: number[], transforms: [] } {
        let polygons = [];

        if (inputs.mesh.toPolygons) {
            polygons = inputs.mesh.toPolygons();
        } else if (inputs.mesh.polygons) {
            polygons = inputs.mesh.polygons;
        } else if (inputs.mesh.sides || inputs.mesh.vertices) {
            const extrusion = this.extrusions.extrudeLinear({ height: 0.001, twistAngle: 0, twistSteps: 1, geometry: inputs.mesh });
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

        return {
            positions, normals, indices, transforms: inputs.mesh.transforms,
        }
    }

    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any {
        const solidsToTransform = inputs.meshes;
        return solidsToTransform.map(mesh => {
            return this.transformSolid({ mesh, matrix: inputs.matrix });
        });
    }

    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any {
        const transformation = inputs.matrix;
        let transformedMesh = this.jscad.geometries.geom3.clone(inputs.mesh);
        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach(transform => {
                transformedMesh = this.jscad.transforms.transform(transform, transformedMesh);
            });
        }
        else if (this.getArrayDepth(transformation) === 3) {
            transformation.forEach(transforms => {
                transforms.forEach(mat => {
                    transformedMesh = this.jscad.transforms.transform(mat, transformedMesh);
                });
            });
        }
        else {
            transformedMesh = this.jscad.transforms.transform(transformation, transformedMesh);
        }
        return transformedMesh;
    }

    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): { blob: Blob } {
        const rawData = this.jscad.STLSERIALIZER.serialize({ binary: true },
            this.jscad.transforms.mirror({ normal: [1, 0, 0] }, inputs.mesh)
        );
        const madeBlob = new Blob(rawData, { type: 'application/sla' });
        return { blob: madeBlob };
    }

    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): { blob: Blob } {
        const rawData = this.jscad.STLSERIALIZER.serialize({ binary: true },
            ...inputs.meshes.map(solid => {
                return this.jscad.transforms.mirror({ normal: [1, 0, 0] }, solid);
            }));
        const madeBlob = new Blob(rawData, { type: 'application/sla' });
        return { blob: madeBlob };
    }

    private degrees_to_radians(degrees) {
        var pi = Math.PI;
        return degrees * (pi / 180);
    }

    private getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    }
}
