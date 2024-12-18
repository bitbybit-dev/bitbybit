import { GeometryHelper } from "@bitbybit-dev/base";
import { MathBitByBit } from "@bitbybit-dev/base";
import { JSCADExpansions } from "./services/jscad-expansions";
import { JSCADBooleans } from "./services/jscad-booleans";
import { JSCADExtrusions } from "./services/jscad-extrusions";
import { JSCADPath } from "./services/jscad-path";
import { JSCADPolygon } from "./services/jscad-polygon";
import { JSCADShapes } from "./services/jscad-shapes";
import { JSCADText } from "./services/jscad-text";
import * as Inputs from "./inputs/jscad-inputs";
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

    constructor(jscad: typeof JSCAD) {
        const geometryHelper = new GeometryHelper();
        const math = new MathBitByBit();
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

    shapesToMeshes<T>(inputs: Inputs.JSCAD.DrawSolidMeshesDto<T>): { positions: number[], normals: number[], indices: number[], transforms: [] }[] {
        return inputs.meshes.map(mesh => {
            return this.shapeToMesh({ ...inputs, mesh });
        });
    }

    shapeToMesh<T>(inputs: Inputs.JSCAD.DrawSolidMeshDto<T>): { positions: number[], normals: number[], indices: number[], transforms: [] } {
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
