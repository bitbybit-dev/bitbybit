import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Get surface area of manifold
     * @param inputs manifold
     * @returns surface area of manifold
     * @group basic
     * @shortname surface area
     * @drawable false
     */
    surfaceArea(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.surfaceArea();
    }

    /**
     * Get volume of manifold
     * @param inputs manifold
     * @returns volume of manifold
     * @group basic
     * @shortname volume
     * @drawable false
     */
    volume(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.volume();
    }

    /**
     * Check if manifold contains triangles
     * @param inputs manifold
     * @returns boolean indicating emptyness
     * @group basic
     * @shortname is empty
     * @drawable false
     */
    isEmpty(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): boolean {
        return inputs.manifold.isEmpty();
    }

    /**
     * Get number of vertices in manifold
     * @param inputs manifold
     * @returns number of vertices of manifold
     * @group basic
     * @shortname num vert
     * @drawable false
     */
    numVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numVert();
    }

    /**
     * Get number of triangles in manifold
     * @param inputs manifold
     * @returns number of triangles of manifold
     * @group basic
     * @shortname num triangles
     * @drawable false
     */
    numTri(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numTri();
    }

    /**
     * Get number of edges in manifold
     * @param inputs manifold
     * @returns number of edges of manifold
     * @group basic
     * @shortname num edges
     * @drawable false
     */
    numEdge(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numEdge();
    }

    /**
     * Get number of properties in manifold
     * @param inputs manifold
     * @returns number of properties of manifold
     * @group basic
     * @shortname num prop
     * @drawable false
     */
    numProp(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numProp();
    }

    /**
     * The number of property vertices in the Manifold. This will always be >=
     * numVert, as some physical vertices may be duplicated to account for
     * different properties on different neighboring triangles.
     * @param inputs manifold
     * @returns number of properties of manifold
     * @group basic
     * @shortname num prop vert
     * @drawable false
     */
    numPropVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numPropVert();
    }

    /**
     * Returns the axis-aligned bounding box of all the Manifold's vertices.
     * @param inputs manifold
     * @returns bounding box corner vectors of manifold
     * @group basic
     * @shortname bounding box
     * @drawable false
     */
    boundingBox(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Inputs.Base.Vector3[] {
        const bounds = inputs.manifold.boundingBox();
        return [bounds.min, bounds.max];
    }

    /**
     * Returns the tolerance of this Manifold's vertices, which tracks the
     * approximate rounding error over all the transforms and operations that have
     * led to this state. Any triangles that are colinear within this tolerance
     * are considered degenerate and removed. This is the value of &epsilon;
     * defining
     * [&epsilon;-valid](https://github.com/elalish/manifold/wiki/Manifold-Library#definition-of-%CE%B5-valid).
     * @param inputs manifold
     * @returns tolerance of manifold
     * @group basic
     * @shortname tolerance
     * @drawable false
     */
    tolerance(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.tolerance();
    }

    /**
     * The genus is a topological property of the manifold, representing the
     * number of handles. A sphere is 0, torus 1, etc. It is only meaningful for
     * a single mesh, so it is best to call Decompose() first.
     * @param inputs manifold
     * @returns genus of manifold
     * @group basic
     * @shortname genus
     * @drawable false
     */
    genus(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.genus();
    }

    /**
     * Returns the minimum gap between two manifolds. Returns a float between
     * 0 and searchLength.
     * @param inputs two manifolds and search length
     * @returns minimum
     * @group basic
     * @shortname min gap
     * @drawable false
     */
    minGap(inputs: Inputs.Manifold.ManifoldsMinGapDto<Manifold3D.Manifold>): number {
        return inputs.manifold1.minGap(inputs.manifold2, inputs.searchLength);
    }

    /**
     * If this mesh is an original, this returns its ID that can be referenced
     * by product manifolds. If this manifold is a product, this
     * returns -1.
     * @param inputs manifold
     * @returns original id of manifold
     * @group basic
     * @shortname original id
     * @drawable false
     */
    originalID(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.originalID();
    }

    /**
     * Returns the reason for an input Mesh producing an empty Manifold. This
     * Status will carry on through operations like NaN propogation, ensuring an
     * errored mesh doesn't get mysteriously lost. Empty meshes may still show
     * NoError, for instance the intersection of non-overlapping meshes.
     * @param inputs manifold
     * @returns error status string (NoError, NotManifold, InvalidConstruction, etc.)
     * @group basic
     * @shortname status
     * @drawable false
     */
    status(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): string {
        return inputs.manifold.status();
    }

}
