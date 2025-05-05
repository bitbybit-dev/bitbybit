import { GeometryHelper, Lists, Point, Transforms, Vector } from "@bitbybit-dev/base";
import { MathBitByBit } from "@bitbybit-dev/base";
import { JSCADExpansions } from "./services/jscad-expansions";
import { JSCADBooleans } from "./services/jscad-booleans";
import { JSCADExtrusions } from "./services/jscad-extrusions";
import { JSCADPath } from "./services/jscad-path";
import { JSCADPolygon } from "./services/jscad-polygon";
import { JSCADShapes } from "./services/jscad-shapes";
import { JSCADText } from "./services/jscad-text";
import * as Inputs from "./inputs/jscad-inputs";
import { Base } from "./inputs/base-inputs";
import { JSCADHulls } from "./services/jscad-hulls";
import { JSCADColors } from "./services/jscad-colors";
import * as JSCAD from "@jscad/modeling";


// Worker make an instance of this class itself
export class Jscad {

    private jscad: typeof JSCAD;

    public booleans: JSCADBooleans;
    public expansions: JSCADExpansions;
    public extrusions: JSCADExtrusions;
    public hulls: JSCADHulls;
    public path: JSCADPath;
    public polygon: JSCADPolygon;
    public shapes: JSCADShapes;
    public text: JSCADText;
    public colors: JSCADColors;
    private point: Point;

    constructor(jscad: typeof JSCAD) {
        const geometryHelper = new GeometryHelper();
        const math = new MathBitByBit();
        const vector = new Vector(math, geometryHelper);
        const transforms = new Transforms(vector, math);
        const lists = new Lists();
        this.point = new Point(geometryHelper, transforms, vector, lists);
        this.booleans = new JSCADBooleans(jscad);
        this.expansions = new JSCADExpansions(jscad);
        this.extrusions = new JSCADExtrusions(jscad, geometryHelper, math);
        this.hulls = new JSCADHulls(jscad);
        this.path = new JSCADPath(jscad, geometryHelper, math);
        this.polygon = new JSCADPolygon(jscad, geometryHelper, math);
        this.shapes = new JSCADShapes(jscad, math);
        this.text = new JSCADText(jscad);
        this.colors = new JSCADColors(jscad);
        this.jscad = jscad;
    }

    toPolygonPoints(inputs: Inputs.JSCAD.MeshDto): Base.Mesh3 {

        const meshData = this.shapeToMesh({ mesh: inputs.mesh });

        if (!meshData || !meshData.positions || !meshData.indices) {
            throw new Error("Invalid input: 'data', 'data.positions', and 'data.indices' must be provided.");
        }

        const { positions, indices } = meshData;

        if (positions.length % 3 !== 0) {
            throw new Error(`Invalid input: 'positions' array length (${positions.length}) must be a multiple of 3.`);
        }

        if (indices.length % 3 !== 0) {
            throw new Error(`Invalid input: 'indices' array length (${indices.length}) must be a multiple of 3.`);
        }

        if (positions.length === 0) {
            return [];
        }
        if (indices.length === 0) {
            return [];
        }


        const polygons: Base.Mesh3 = [];
        const numVertices = positions.length / 3;

        // --- Triangle Reconstruction ---
        for (let i = 0; i < indices.length; i += 3) {
            const index1 = indices[i];
            const index2 = indices[i + 1];
            const index3 = indices[i + 2];

            if (index1 >= numVertices || index2 >= numVertices || index3 >= numVertices ||
                index1 < 0 || index2 < 0 || index3 < 0) {
                console.error(`Invalid vertex index found in 'indices' array at triangle starting at index ${i}. Max vertex index is ${numVertices - 1}. Indices: ${index1}, ${index2}, ${index3}. Skipping triangle.`);
                continue;
            }

            const offset1 = index1 * 3;
            const offset2 = index2 * 3;
            const offset3 = index3 * 3;

            const point1: Base.Point3 = [positions[offset1], positions[offset1 + 1], positions[offset1 + 2]];
            const point2: Base.Point3 = [positions[offset2], positions[offset2 + 1], positions[offset2 + 2]];
            const point3: Base.Point3 = [positions[offset3], positions[offset3 + 1], positions[offset3 + 2]];

            // We must bake the transformations as JSCAD uses those extensively
            const transformation = inputs.mesh.transforms;
            let transformedPoints = [point1, point2, point3];
            if (this.getArrayDepth(transformation) === 2) {
                transformation.forEach(transform => {
                    transformedPoints = this.point.transformPoints({ points: transformedPoints, transformation: [transform] });
                });
            }
            else if (this.getArrayDepth(transformation) === 3) {
                transformation.forEach(transforms => {
                    transforms.forEach(mat => {
                        transformedPoints = this.point.transformPoints({ points: transformedPoints, transformation: [mat] });
                    });
                });
            }
            else {
                transformedPoints = this.point.transformPoints({ points: transformedPoints, transformation: [transformation] });
            }

            const triangle: Base.Triangle3 = transformedPoints as Base.Triangle3;

            polygons.push(triangle);
        }

        return polygons;
    }

    shapesToMeshes(inputs: Inputs.JSCAD.MeshesDto): { positions: number[], normals: number[], indices: number[], transforms: [] }[] {
        return inputs.meshes.map(mesh => {
            return this.shapeToMesh({ ...inputs, mesh });
        });
    }

    shapeToMesh(inputs: Inputs.JSCAD.MeshDto): { positions: number[], normals: number[], indices: number[], transforms: [] } {
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
        };
    }

    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any {
        const solidsToTransform = inputs.meshes;
        return solidsToTransform.map(mesh => {
            return this.transformSolid({ mesh, transformation: inputs.transformation });
        });
    }

    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any {
        const transformation = inputs.transformation;
        let transformedMesh = this.jscad.geometries.geom3.clone(inputs.mesh);
        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach(transform => {
                transformedMesh = this.jscad.transforms.transform(transform, transformedMesh);
            });
        }
        else if (this.getArrayDepth(transformation) === 3) {
            transformation.forEach(transforms => {
                transforms.forEach(mat => {
                    transformedMesh = this.jscad.transforms.transform(mat as any, transformedMesh);
                });
            });
        }
        else {
            transformedMesh = this.jscad.transforms.transform(transformation as any, transformedMesh);
        }
        return transformedMesh;
    }

    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            inputs.mesh
        );
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    downloadGeometryDxf(inputs: Inputs.JSCAD.DownloadGeometryDto): { blob: Blob } {
        const options = inputs.options ? inputs.options : {};
        const rawData = (this.jscad as any).DXFSERIALIZER.serialize(options,
            inputs.geometry
        );
        const madeBlob = new Blob(rawData);
        return { blob: madeBlob };
    }

    downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): { blob: Blob } {
        const options = inputs.options ? inputs.options : {};
        const rawData = (this.jscad as any).THREEMFSERIALIZER.serialize(options,
            inputs.geometry
        );
        const madeBlob = new Blob(rawData);
        return { blob: madeBlob };
    }

    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            ...inputs.meshes);
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    private getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    };
}
