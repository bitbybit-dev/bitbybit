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


/**
 * Contains various functions for Solid meshes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
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

    /**
     * Converts the Jscad mesh to polygon points representing triangles of the mesh.
     * @param inputs Jscad mesh
     * @returns polygon points
     * @group conversions
     * @shortname to polygon points
     * @drawable false
     */
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

        for (let i = 0; i < indices.length; i += 3) {
            const index1 = indices[i]!;
            const index2 = indices[i + 1]!;
            const index3 = indices[i + 2]!;

            if (index1 >= numVertices || index2 >= numVertices || index3 >= numVertices ||
                index1 < 0 || index2 < 0 || index3 < 0) {
                console.error(`Invalid vertex index found in 'indices' array at triangle starting at index ${i}. Max vertex index is ${numVertices - 1}. Indices: ${index1}, ${index2}, ${index3}. Skipping triangle.`);
                continue;
            }

            const offset1 = index1 * 3;
            const offset2 = index2 * 3;
            const offset3 = index3 * 3;

            const point1: Base.Point3 = [positions[offset1]!, positions[offset1 + 1]!, positions[offset1 + 2]!];
            const point2: Base.Point3 = [positions[offset2]!, positions[offset2 + 1]!, positions[offset2 + 2]!];
            const point3: Base.Point3 = [positions[offset3]!, positions[offset3 + 1]!, positions[offset3 + 2]!];

            const transformedPoints = this.point.transformPoints({
                points: [point1, point2, point3],
                transformation: [inputs.mesh.transforms],
            });

            const triangle: Base.Triangle3 = transformedPoints as Base.Triangle3;

            polygons.push(triangle);
        }

        return polygons;
    }

    shapesToMeshes(inputs: Inputs.JSCAD.MeshesDto): Inputs.JSCAD.JSCADMeshData[] {
        return inputs.meshes.map(mesh => {
            return this.shapeToMesh({ ...inputs, mesh });
        });
    }

    shapeToMesh(inputs: Inputs.JSCAD.MeshDto): Inputs.JSCAD.JSCADMeshData {
        let polygons: Inputs.JSCAD.JSCADPoly3[] = [];

        if (this.legacyPolygons(inputs.mesh)) {
            polygons = this.legacyPolygons(inputs.mesh)!();
        } else if ("polygons" in inputs.mesh) {
            polygons = inputs.mesh.polygons;
        } else {
            const extrusion = this.extrusions.extrudeLinear({ height: 0.001, twistAngle: 0, twistSteps: 1, geometry: inputs.mesh });
            const legacy = this.legacyPolygons(extrusion);
            if (legacy) {
                polygons = legacy();
            } else if ("polygons" in extrusion) {
                polygons = extrusion.polygons;
            }
        }

        const positions: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        let countIndices = 0;

        for (const polygon of polygons) {
            if (polygon.vertices.length === 3) {
                polygon.vertices.forEach((vert: Base.Point3) => {
                    positions.push(vert[0], vert[1], vert[2]);
                    indices.push(countIndices);
                    countIndices++;
                });
            } else {
                const triangles: Base.Triangle3[] = [];
                const reversedVertices = polygon.vertices;
                const firstVertex = reversedVertices[0]!;
                for (let i = reversedVertices.length - 3; i >= 0; i--) {
                    triangles.push(
                        [
                            firstVertex,
                            reversedVertices[i + 1]!,
                            reversedVertices[i + 2]!,
                        ]);
                }
                triangles.forEach((triangle, _index) => {
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

    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     * @group transforms
     * @shortname transform solids
     * @drawable true
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): Inputs.JSCAD.JSCADEntity[] {
        const solidsToTransform = inputs.meshes;
        return solidsToTransform.map(mesh => {
            return this.transformSolid({ mesh, transformation: inputs.transformation });
        });
    }

    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     * @group transforms
     * @shortname transform solid
     * @drawable true
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): Inputs.JSCAD.JSCADEntity {
        const transformation = inputs.transformation;
        let transformedMesh = this.asSolid(inputs.mesh, "transformSolid");
        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach((transform: Base.TransformMatrix) => {
                transformedMesh = this.jscad.transforms.transform(transform, transformedMesh);
            });
        }
        else if (this.getArrayDepth(transformation) === 3) {
            (transformation as unknown as Base.TransformMatrixes[]).forEach((transforms) => {
                transforms.forEach((mat: Base.TransformMatrix) => {
                    transformedMesh = this.jscad.transforms.transform(mat, transformedMesh);
                });
            });
        }
        else {
            transformedMesh = this.jscad.transforms.transform(transformation as any, transformedMesh);
        }
        return transformedMesh;
    }

    /**
     * Downloads the binary STL file from a 3D solid
     * @param inputs 3D Solid
     * @group io
     * @shortname solid to stl
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            inputs.mesh
        );
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    /**
     * Downloads the binary STL file from a 3D solids
     * @param inputs 3D Solid
     * @group io
     * @shortname solids to stl
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            ...inputs.meshes);
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    /**
     * Downloads the dxf file from jscad geometry. Supports paths and meshes in array.
     * @param inputs 3D geometry
     * @group io
     * @shortname geometry to dxf
     */
    downloadGeometryDxf(inputs: Inputs.JSCAD.DownloadGeometryDto): { blob: Blob } {
        const options = inputs.options ? inputs.options : {};
        const rawData = (this.jscad as any).DXFSERIALIZER.serialize(options,
            inputs.geometry
        );
        const madeBlob = new Blob(rawData);
        return { blob: madeBlob };
    }

    /**
     * Downloads the 3MF file from jscad geometry.
     * @param inputs 3D geometry
     * @group io
     * @shortname geometry to 3mf
     */
    downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): { blob: Blob } {
        const options = inputs.options ? inputs.options : {};
        const rawData = (this.jscad as any).THREEMFSERIALIZER.serialize(options,
            inputs.geometry
        );
        const madeBlob = new Blob(rawData);
        return { blob: madeBlob };
    }

    /**
     * JSCAD v1 handed back objects that carried their own `toPolygons()`; a v2 geometry is plain
     * data and the equivalent is a free function. Anything still arriving in the old shape is read
     * the old way, which is why this asks the value rather than trusting the type.
     */
    private legacyPolygons(entity: Inputs.JSCAD.JSCADEntity): (() => Inputs.JSCAD.JSCADPoly3[]) | undefined {
        const candidate = (entity as { toPolygons?: unknown }).toPolygons;
        return typeof candidate === "function" ? (candidate as () => Inputs.JSCAD.JSCADPoly3[]).bind(entity) : undefined;
    }

    /**
     * Narrows an entity to the solid an operation needs, and says which operation wanted one. The
     * kernel's own failure for a 2D shape here is a property access on undefined, several frames
     * deep, which tells a script author nothing.
     */
    private asSolid(entity: Inputs.JSCAD.JSCADEntity, operation: string): Inputs.JSCAD.JSCADGeom3 {
        if (!("polygons" in entity)) {
            throw new Error(`${operation} needs a 3D solid, but was given a 2D geometry or a path.`);
        }
        return entity;
    }

    private getArrayDepth = (value: unknown): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    };
}
