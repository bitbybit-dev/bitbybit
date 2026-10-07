import type * as Manifold3D from "manifold-3d";
import { creasedMesh } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-normals";
import type * as Inputs from "./inputs";
import { Manifold } from "./services/manifold/manifold";
import { CrossSection } from "./services/cross-section/cross-section";
import { Mesh } from "./services/mesh/mesh";
import { ManifoldRecipes } from "./services/recipes/recipes";
import { BaseBitByBit } from "../base";

const POSITION_SIZE = 3;
const WITH_NORMALS = 6;

function positionsOf(mesh: Manifold3D.Mesh): Float32Array {
    if (mesh.numProp === POSITION_SIZE) {
        return mesh.vertProperties;
    }
    const count = mesh.vertProperties.length / mesh.numProp;
    const positions = new Float32Array(count * POSITION_SIZE);
    for (let vertex = 0; vertex < count; vertex++) {
        positions.set(mesh.vertProperties.subarray(vertex * mesh.numProp, vertex * mesh.numProp + POSITION_SIZE), vertex * POSITION_SIZE);
    }
    return positions;
}

/**
 * The entry point to the Manifold kernel, a fast mesh-based solid modeler: `manifold` builds and
 * changes solids, `crossSection` handles the flat outlines they are extruded and revolved from,
 * `mesh` reads the triangle data, and `recipes` builds solids described as data. Manifold works on
 * triangle meshes rather than exact curves, so booleans are quick and always watertight, and it
 * keeps its own Z axis as up: extrusions grow along Z and slices are parallel to the XY plane. The
 * methods on the service itself turn solids and cross-sections into plain mesh data for drawing.
 */

export class ManifoldService {
    plugins: any;
    public manifold: Manifold;

    public crossSection: CrossSection;
    private base: BaseBitByBit;
    mesh: Mesh;
    /**
     * Experimental: builds solids described as data, whose format may still change.
     * @beta
     */
    recipes: ManifoldRecipes;
    private readonly wasm: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.wasm = wasm;
        this.base = new BaseBitByBit();
        this.manifold = new Manifold(wasm);
        this.crossSection = new CrossSection(wasm, this.base);
        this.mesh = new Mesh(wasm);
        this.recipes = new ManifoldRecipes(wasm);
    }

    /**
     * Turns a solid into plain mesh data, or a cross-section into its polygons, ready for drawing
     * or export.
     *
     * `normalIdx` names the channel holding normals the solid carries. With `minSharpAngle`, normals
     * follow each position, smooth across flatter edges and split across sharper ones.
     * @param inputs - The solid or cross-section and the optional normal channel
     * @returns The mesh data of a solid, or the polygons of a cross-section
     * @group decompose
     * @shortname decompose m or cs
     * @drawable false
     * @example
     * ```typescript
     * const mesh = await bitbybit.manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube });
     * ```
     */
    decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Manifold3D.Manifold | Manifold3D.CrossSection>): Manifold3D.Mesh | Manifold3D.SimplePolygon[] {
        if ((inputs.manifoldOrCrossSection as Manifold3D.Manifold).getMesh) {
            const solid = inputs.manifoldOrCrossSection as Manifold3D.Manifold;
            if (inputs.minSharpAngle === undefined) {
                return solid.getMesh(inputs.normalIdx);
            }
            if (!Number.isFinite(inputs.minSharpAngle) || inputs.minSharpAngle < 0) {
                throw new RangeError(`minSharpAngle must be a finite angle of at least 0 degrees, got ${inputs.minSharpAngle}`);
            }
            const plain = solid.getMesh();
            const creased = creasedMesh(positionsOf(plain), plain.triVerts, inputs.minSharpAngle);
            const vertProperties = new Float32Array(creased.positions.length / POSITION_SIZE * WITH_NORMALS);
            for (let vertex = 0; vertex * POSITION_SIZE < creased.positions.length; vertex++) {
                vertProperties.set(creased.positions.subarray(vertex * POSITION_SIZE, (vertex + 1) * POSITION_SIZE), vertex * WITH_NORMALS);
                vertProperties.set(creased.normals.subarray(vertex * POSITION_SIZE, (vertex + 1) * POSITION_SIZE), vertex * WITH_NORMALS + POSITION_SIZE);
            }
            return new this.wasm.Mesh({ numProp: WITH_NORMALS, vertProperties, triVerts: creased.indices });
        } else {
            return (inputs.manifoldOrCrossSection as Manifold3D.CrossSection).toPolygons();
        }
    }

    /**
     * Turns a solid into a list of triangles, each three points, the same form
     * `shapes.fromPolygonPoints` reads back.
     *
     * An empty solid gives an empty list.
     * @param inputs - The solid
     * @returns One list of three points per triangle
     * @group decompose
     * @shortname to polygon points
     * @drawable false
     * @example
     * ```typescript
     * const triangles = await bitbybit.manifold.toPolygonPoints({ manifold: cube });
     * ```
     */
    toPolygonPoints(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Inputs.Base.Mesh3 {
        if (typeof inputs.manifold.getMesh === "function") {

            const mesh = inputs.manifold.getMesh();

            if (!mesh || !mesh.vertProperties || !mesh.triVerts || mesh.vertProperties.length === 0 || mesh.triVerts.length === 0) {
                console.warn("Manifold does not contain valid mesh data or is empty.");
                return [];
            }

            const vertProperties = mesh.vertProperties;
            const triVerts = mesh.triVerts;
            const numProp = mesh.numProp;

            if (numProp < 3) {
                throw new Error(`Cannot convert to PolygonPoints: Expected numProp >= 3 (for x, y, z), but found ${numProp}.`);
            }

            if (triVerts.length % 3 !== 0) {
                throw new Error(`Mesh data corruption: triVerts length (${triVerts.length}) is not a multiple of 3.`);
            }

            const polygons: Inputs.Base.Mesh3 = [];
            const numVertices = vertProperties.length / numProp;

            for (let i = 0; i < triVerts.length; i += 3) {
                const index1 = triVerts[i]!;
                const index2 = triVerts[i + 1]!;
                const index3 = triVerts[i + 2]!;

                if (index1 >= numVertices || index2 >= numVertices || index3 >= numVertices) {
                    console.error(`Invalid vertex index found in triVerts at offset ${i}. Max index should be ${numVertices - 1}. Indices: ${index1}, ${index2}, ${index3}`);
                    continue;
                }

                const vert1Offset = index1 * numProp;
                const vert2Offset = index2 * numProp;
                const vert3Offset = index3 * numProp;

                const point1: Inputs.Base.Point3 = [vertProperties[vert1Offset]!, vertProperties[vert1Offset + 1]!, vertProperties[vert1Offset + 2]!];
                const point2: Inputs.Base.Point3 = [vertProperties[vert2Offset]!, vertProperties[vert2Offset + 1]!, vertProperties[vert2Offset + 2]!];
                const point3: Inputs.Base.Point3 = [vertProperties[vert3Offset]!, vertProperties[vert3Offset + 1]!, vertProperties[vert3Offset + 2]!];

                const triangle: Inputs.Base.Triangle3 = [point1, point2, point3];
                polygons.push(triangle);
            }

            return polygons;
        } else {
            throw new Error("Manifold has no mesh to convert");
        }
    }

    /**
     * Turns several solids into mesh data, or cross-sections into polygons, as
     * `decomposeManifoldOrCrossSection` does for one.
     *
     * `normalIdx` gives one normal channel per shape.
     * @param inputs - The solids or cross-sections and the optional normal channels
     * @returns One mesh or polygon list per shape, in the same order
     * @group decompose
     * @shortname decompose m's or cs's
     * @drawable false
     * @example
     * ```typescript
     * const meshes = await bitbybit.manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube, sphere] });
     * ```
     */
    decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Manifold3D.Manifold | Manifold3D.CrossSection>): (Manifold3D.Mesh | Manifold3D.SimplePolygon[])[] {
        return inputs.manifoldsOrCrossSections.map((manifoldOrCrossSection, index) => {
            const normalIdx = inputs.normalIdx ? inputs.normalIdx[index] : undefined;
            return this.decomposeManifoldOrCrossSection({
                manifoldOrCrossSection,
                minSharpAngle: inputs.minSharpAngle,
                normalIdx
            });
        });
    }
}
