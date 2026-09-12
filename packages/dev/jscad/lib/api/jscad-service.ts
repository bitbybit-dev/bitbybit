import { GeometryHelper, Lists, Point, Transforms, Vector } from "@bitbybit-dev/base";
import { MathBitByBit } from "@bitbybit-dev/base";
import { computeVertexNormals } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-normals";
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
 * The entry point to the JSCAD kernel, a mesh-based solid modeler with three kinds of geometry: a
 * solid, held as a closed set of polygons; a flat 2D shape, held as a region in the XY plane; and a
 * 2D path, an open or closed polyline in that plane. `shapes` and `polygon` build them, `booleans`,
 * `extrusions`, `expansions` and `hulls` combine and grow them, `text` writes with them and
 * `colors` tints them. Flat shapes live in the XY plane and extrude along Z. The methods on the
 * service itself convert solids to mesh data, move them with matrices and write STL, DXF and 3MF
 * files. Credit to the JSCAD community for the kernel.
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
     * Turns a solid into a list of triangles, each given as three points, with the solid's own
     * transform already applied.
     *
     * A flat 2D shape is given a tiny thickness first so it has faces at all. An entity with no
     * polygons gives an empty list.
     * @param inputs - The solid or 2D shape
     * @returns The triangles as lists of three points
     * @group conversions
     * @shortname to polygon points
     * @drawable false
     * @example
     * ```typescript
     * const cube = await bitbybit.jscad.shapes.cube({ center: [0, 0, 0], size: 10 });
     * const triangles = await bitbybit.jscad.toPolygonPoints({ mesh: cube });
     * ```
     */
    toPolygonPoints(inputs: Inputs.JSCAD.MeshDto): Base.Mesh3 {

        const meshData = this.shapeToMesh({ mesh: inputs.mesh });

        const { positions, indices } = meshData;

        if (positions.length === 0) {
            return [];
        }
        if (indices.length === 0) {
            return [];
        }


        const polygons: Base.Mesh3 = [];

        for (let i = 0; i < indices.length; i += 3) {
            const index1 = indices[i]!;
            const index2 = indices[i + 1]!;
            const index3 = indices[i + 2]!;

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

    /**
     * Turns several solids into mesh data, one entry per solid in the same order, as `shapeToMesh`
     * does for one.
     * @param inputs - The solids or 2D shapes
     * @returns One mesh data entry per input, in the same order
     */
    shapesToMeshes(inputs: Inputs.JSCAD.MeshesDto): Inputs.JSCAD.JSCADMeshData[] {
        return inputs.meshes.map(mesh => {
            return this.shapeToMesh({ ...inputs, mesh });
        });
    }

    /**
     * Turns a solid into plain mesh data: flat position, normal and index lists plus the solid's
     * own transform matrix, the form a renderer draws from.
     *
     * Polygons with more than three points are split into triangles as a fan; a flat 2D shape is
     * given a tiny thickness first so it has faces at all.
     * @param inputs - The solid or 2D shape
     * @returns The positions, normals, indices and transform of the mesh
     */
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
            positions,
            normals: computeVertexNormals(positions, indices),
            indices,
            transforms: inputs.mesh.transforms,
        };
    }

    /**
     * Moves, rotates or scales several solids with the same transformation, giving new solids in
     * the same order.
     *
     * `transformation` is one 4x4 matrix, a list of matrices applied in order, or a list of such
     * lists; a flat 2D shape or a path throws an error.
     * @param inputs - The solids and the transformation
     * @returns The transformed solids, in the same order
     * @group transforms
     * @shortname transform solids
     * @drawable true
     * @example
     * ```typescript
     * const translation = bitbybit.transforms.translationXYZ({ translation: [10, 0, 0] });
     * const moved = await bitbybit.jscad.transformSolids({ meshes: [cube, sphere], transformation: translation });
     * ```
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): Inputs.JSCAD.JSCADEntity[] {
        const solidsToTransform = inputs.meshes;
        return solidsToTransform.map(mesh => {
            return this.transformSolid({ mesh, transformation: inputs.transformation });
        });
    }

    /**
     * Moves, rotates or scales a solid with a transformation, giving a new solid.
     *
     * `transformation` is one 4x4 matrix, a list of matrices applied in order, or a list of such
     * lists; a flat 2D shape or a path throws an error.
     * @param inputs - The solid and the transformation
     * @returns The transformed solid
     * @group transforms
     * @shortname transform solid
     * @drawable true
     * @example
     * ```typescript
     * const rotation = bitbybit.transforms.rotationCenterAxis({ angle: 45, axis: [0, 1, 0], center: [0, 0, 0] });
     * const turned = await bitbybit.jscad.transformSolid({ mesh: cube, transformation: rotation });
     * ```
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
     * Writes a solid as a binary STL file, the common format for 3D printing, and downloads it in
     * the browser as `fileName` plus `.stl`.
     * @param inputs - The solid and the file name
     * @returns The STL file as a blob; the asynchronous API starts the download instead and returns nothing
     * @group io
     * @shortname solid to stl
     * @example
     * ```typescript
     * await bitbybit.jscad.downloadSolidSTL({ mesh: cube, fileName: "cube" });
     * ```
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            inputs.mesh
        );
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    /**
     * Writes several solids into one binary STL file and downloads it in the browser as `fileName`
     * plus `.stl`.
     * @param inputs - The solids and the file name
     * @returns The STL file as a blob; the asynchronous API starts the download instead and returns nothing
     * @group io
     * @shortname solids to stl
     * @example
     * ```typescript
     * await bitbybit.jscad.downloadSolidsSTL({ meshes: [cube, sphere], fileName: "parts" });
     * ```
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): { blob: Blob } {
        const rawData = (this.jscad as any).STLSERIALIZER.serialize({ binary: true },
            ...inputs.meshes);
        const madeBlob = new Blob(rawData, { type: "application/sla" });
        return { blob: madeBlob };
    }

    /**
     * Writes a solid, a 2D shape, a path or a list of them as a DXF drawing file and downloads it
     * in the browser as `fileName` plus `.dxf`.
     *
     * `options` is passed to the DXF writer as it is and can stay out.
     * @param inputs - The geometry, the file name and the optional writer options
     * @returns The DXF file as a blob; the asynchronous API starts the download instead and returns nothing
     * @group io
     * @shortname geometry to dxf
     * @example
     * ```typescript
     * const circle = await bitbybit.jscad.polygon.circle({ center: [0, 0], radius: 5, segments: 32 });
     * await bitbybit.jscad.downloadGeometryDxf({ geometry: circle, fileName: "circle", options: {} });
     * ```
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
     * Writes a solid, a 2D shape, a path or a list of them as a 3MF file, a modern 3D printing
     * format, and downloads it in the browser as `fileName` plus `.3mf`.
     *
     * `options` is passed to the 3MF writer as it is and can stay out.
     * @param inputs - The geometry, the file name and the optional writer options
     * @returns The 3MF file as a blob; the asynchronous API starts the download instead and returns nothing
     * @group io
     * @shortname geometry to 3mf
     * @example
     * ```typescript
     * await bitbybit.jscad.downloadGeometry3MF({ geometry: [cube, sphere], fileName: "parts", options: {} });
     * ```
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
