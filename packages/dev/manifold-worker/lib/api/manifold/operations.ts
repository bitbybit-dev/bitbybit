import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Computes convex hull of the manifold shape provided
     * @param inputs two shapes
     * @returns hulled manifold shape
     * @group hulls
     * @shortname convex hull
     * @drawable true
     */
    async hull(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.hull", inputs);
    }

    /**
     * Hull points or manifolds
     * @param inputs manifold
     * @returns manifold
     * @group hulls
     * @shortname hull points
     * @drawable true
     */
    hullPoints(inputs: Inputs.Manifold.HullPointsDto<(Inputs.Base.Point3 | Inputs.Manifold.ManifoldPointer)[]>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.hullPoints", inputs);
    }

    /**
     * Returns the cross section of this object parallel to the X-Y plane at the
     * specified height. Using a height equal to the bottom
     * of the bounding box will return the bottom faces, while using a height
     * equal to the top of the bounding box will return empty.
     * @param inputs manifold and height
     * @returns sliced cross section
     * @group cross sections
     * @shortname slice
     * @drawable true
     */
    async slice(inputs: Inputs.Manifold.SliceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.slice", inputs);
    }

    /**
     * Creates a projection on xy plane from the shape outline
     * @param inputs manifold
     * @returns projected cross section
     * @group cross sections
     * @shortname project
     * @drawable true
     */
    async project(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.project", inputs);
    }

    /**
     * Return a copy of the manifold with the set tolerance value.
     * This performs mesh simplification when the tolerance value is increased.
     * @param inputs manifold and tolerance
     * @returns manifold with new tolerance
     * @group basic
     * @shortname set tolerance
     * @drawable false
     */
    async setTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.setTolerance", inputs);
    }

    /**
     * Returns the first of n sequential new unique mesh IDs for marking sets of triangles that can be looked up after further operations. Assign to Mesh.runOriginalID vector.
     * @param inputs count
     * @returns void
     * @group basic
     * @shortname reserve id
     * @drawable false
     */
    async reserveIds(inputs: Inputs.Manifold.CountDto): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.reserveIds", inputs);
    }

    /**
     * If you copy a manifold, but you want this new copy to have new properties
     * (e.g. a different UV mapping), you can reset its IDs to a new original,
     * meaning it will now be referenced by its descendants instead of the meshes
     * it was built from, allowing you to differentiate the copies when applying
     * your properties to the final result.
     *
     * This function also condenses all coplanar faces in the relation, and
     * collapses those edges. If you want to have inconsistent properties across
     * these faces, meaning you want to preserve some of these edges, you should
     * instead call GetMesh(), calculate your properties and use these to
     * construct a new manifold.
     * @param inputs manifold
     * @returns original manifold
     * @group basic
     * @shortname as original
     * @drawable true
     */
    async asOriginal(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.asOriginal", inputs);
    }

    /**
     * Constructs a new manifold from a list of other manifolds. This is a purely
     * topological operation, so care should be taken to avoid creating
     * overlapping results. It is the inverse operation of Decompose().
     * @param inputs manifold shapes
     * @returns composed manifold
     * @group composition
     * @shortname compose
     * @drawable true
     */
    async compose(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.compose", inputs);
    }

    /**
     * This operation returns a vector of Manifolds that are topologically
     * disconnected. If everything is connected, the vector is length one,
     * containing a copy of the original. It is the inverse operation of
     * Compose().
     * @param inputs manifold
     * @returns decomposed manifold shapes
     * @group composition
     * @shortname decompose
     * @drawable true
     */
    async decompose(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.decompose", inputs);
    }

    /**
     * Fills in vertex properties for normal vectors, calculated from the mesh
     * geometry. Flat faces composed of three or more triangles will remain flat.
     * @param inputs manifold and normal index with minimum sharp angle
     * @returns manifold with calculated normals
     * @group adjustments
     * @shortname calculate normals
     * @drawable true
     */
    async calculateNormals(inputs: Inputs.Manifold.CalculateNormalsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.calculateNormals", inputs);
    }

    /**
     * Curvature is the inverse of the radius of curvature, and signed such that
     * positive is convex and negative is concave. There are two orthogonal
     * principal curvatures at any point on a manifold, with one maximum and the
     * other minimum. Gaussian curvature is their product, while mean
     * curvature is their sum. This approximates them for every vertex and assigns
     * them as vertex properties on the given channels.
     * @param inputs manifold and gaussian and mean index
     * @returns manifold with calculated curvature
     * @group adjustments
     * @shortname calculate curvature
     * @drawable true
     */
    async calculateCurvature(inputs: Inputs.Manifold.CalculateCurvatureDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.calculateCurvature", inputs);
    }

    /**
     * Increase the density of the mesh by splitting each edge into pieces such
     * that any point on the resulting triangles is roughly within tolerance of
     * the smoothly curved surface defined by the tangent vectors. This means
     * tightly curving regions will be divided more finely than smoother regions.
     * If halfedgeTangents are not present, the result will simply be a copy of
     * the original. Quads will ignore their interior triangle bisector.
     * @param inputs manifold and tolerance
     * @returns refined manifold
     * @group adjustments
     * @shortname refine to tolerance
     * @drawable true
     */

    async refineToTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.refineToTolerance", inputs);
    }

    /**
     * Increase the density of the mesh by splitting each edge into pieces of
     * roughly the input length. Interior verts are added to keep the rest of the
     * triangulation edges also of roughly the same length. If halfedgeTangents
     * are present (e.g. from the Smooth() constructor), the new vertices will be
     * moved to the interpolated surface according to their barycentric
     * coordinates.
     * @param inputs manifold and length
     * @returns refined manifold
     * @group adjustments
     * @shortname refine to length
     * @drawable true
     */
    async refineToLength(inputs: Inputs.Manifold.ManifoldRefineLengthDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.refineToLength", inputs);
    }

    /**
     * Increase the density of the mesh by splitting every edge into n pieces. For
     * instance, with n = 2, each triangle will be split into 4 triangles. These
     * will all be coplanar (and will not be immediately collapsed) unless the
     * Mesh/Manifold has halfedgeTangents specified (e.g. from the Smooth()
     * constructor), in which case the new vertices will be moved to the
     * interpolated surface according to their barycentric coordinates.
     * @param inputs manifold and count
     * @returns refined manifold
     * @group adjustments
     * @shortname refine
     * @drawable true
     */
    async refine(inputs: Inputs.Manifold.ManifoldRefineDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.refine", inputs);
    }

    /**
     * Smooths out the Manifold by filling in the halfedgeTangent vectors. The
     * geometry will remain unchanged until Refine or RefineToLength is called to
     * interpolate the surface. This version uses the geometry of the triangles
     * and pseudo-normals to define the tangent vectors.
     * @param inputs manifold and minimum sharp angle and minimum smoothness
     * @returns smoothed manifold
     * @group adjustments
     * @shortname smooth out
     * @drawable true
     */
    async smoothOut(inputs: Inputs.Manifold.ManifoldSmoothOutDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.smoothOut", inputs);
    }

    /**
     * Smooths out the Manifold by filling in the halfedgeTangent vectors. The
     * geometry will remain unchanged until Refine or RefineToLength is called to
     * interpolate the surface. This version uses the supplied vertex normal
     * properties to define the tangent vectors.
     * @param inputs manifold and normal index
     * @returns smoothed manifold
     * @group adjustments
     * @shortname smooth by normals
     * @drawable true
     */
    async smoothByNormals(inputs: Inputs.Manifold.ManifoldSmoothByNormalsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.smoothByNormals", inputs);
    }

}
