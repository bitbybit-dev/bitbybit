import * as Manifold3D from "manifold-3d";
import * as Inputs from "./inputs";
import { Manifold } from "./services/manifold/manifold";
import { CrossSection } from "./services/cross-section/cross-section";
import { Mesh } from "./services/mesh/mesh";

// Worker make an instance of this class itself
export class ManifoldService {
    plugins: any;

    public crossSection: CrossSection;
    public manifold: Manifold;
    mesh: Mesh;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.crossSection = new CrossSection(wasm);
        this.manifold = new Manifold(wasm);
        this.mesh = new Mesh(wasm);
    }

    toPolygonPoints(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Inputs.Base.Mesh3 {
        // Ensure the manifold is decomposed to access the mesh data.
        // The getMesh() method provides the necessary structure.
        if ((inputs.manifold as Manifold3D.Manifold).getMesh) {

            const mesh = inputs.manifold.getMesh();

            if (!mesh || !mesh.vertProperties || !mesh.triVerts || mesh.vertProperties.length === 0 || mesh.triVerts.length === 0) {
                console.warn("Manifold does not contain valid mesh data or is empty.");
                return [];
            }

            const vertProperties = mesh.vertProperties; // Float32Array [x1, y1, z1, [prop4...], x2, y2, z2, [prop4...]...]
            const triVerts = mesh.triVerts;           // Uint32Array [idx1, idx2, idx3, idx4, idx5, idx6, ...]
            const numProp = mesh.numProp;             // Number of properties per vertex

            // We need at least x, y, z data.
            if (numProp < 3) {
                throw new Error(`Cannot convert to PolygonPoints: Expected numProp >= 3 (for x, y, z), but found ${numProp}.`);
            }

            if (triVerts.length % 3 !== 0) {
                throw new Error(`Mesh data corruption: triVerts length (${triVerts.length}) is not a multiple of 3.`);
            }

            const polygons: Inputs.Base.Mesh3 = [];
            const numVertices = vertProperties.length / numProp;

            for (let i = 0; i < triVerts.length; i += 3) {
                const index1 = triVerts[i];
                const index2 = triVerts[i + 1];
                const index3 = triVerts[i + 2];

                if (index1 >= numVertices || index2 >= numVertices || index3 >= numVertices) {
                    console.error(`Invalid vertex index found in triVerts at offset ${i}. Max index should be ${numVertices - 1}. Indices: ${index1}, ${index2}, ${index3}`);
                    continue; // Skip this triangle
                }

                // Calculate the starting position of each vertex's data in vertProperties.
                // This calculation works regardless of numProp.
                const vert1Offset = index1 * numProp;
                const vert2Offset = index2 * numProp;
                const vert3Offset = index3 * numProp;

                // Extract only the first 3 properties (x, y, z) starting from the offset for each vertex.
                const point1: Inputs.Base.Point3 = [vertProperties[vert1Offset], vertProperties[vert1Offset + 1], vertProperties[vert1Offset + 2]];
                const point2: Inputs.Base.Point3 = [vertProperties[vert2Offset], vertProperties[vert2Offset + 1], vertProperties[vert2Offset + 2]];
                const point3: Inputs.Base.Point3 = [vertProperties[vert3Offset], vertProperties[vert3Offset + 1], vertProperties[vert3Offset + 2]];

                const triangle: Inputs.Base.Triangle3 = [point1, point2, point3];
                polygons.push(triangle);
            }

            return polygons;
        } else {
            return undefined;
        }
    }

    decomposeManifoldOrCrossSection(inputs: Inputs.Manifold.DecomposeManifoldOrCrossSectionDto<Manifold3D.Manifold | Manifold3D.CrossSection>): Manifold3D.Mesh | Manifold3D.SimplePolygon[] {
        if ((inputs.manifoldOrCrossSection as Manifold3D.Manifold).getMesh) {
            return (inputs.manifoldOrCrossSection as Manifold3D.Manifold).getMesh(inputs.normalIdx);
        } else {
            return (inputs.manifoldOrCrossSection as Manifold3D.CrossSection).toPolygons();
        }
    }

    decomposeManifoldsOrCrossSections(inputs: Inputs.Manifold.DecomposeManifoldsOrCrossSectionsDto<Manifold3D.Manifold | Manifold3D.CrossSection>): (Manifold3D.Mesh | Manifold3D.SimplePolygon[])[] {
        return inputs.manifoldsOrCrossSections.map((manifoldOrCrossSection, index) => {
            const normalIdx = inputs.normalIdx ? inputs.normalIdx[index] : undefined;
            return this.decomposeManifoldOrCrossSection({
                manifoldOrCrossSection,
                normalIdx
            });
        });
    }
}
