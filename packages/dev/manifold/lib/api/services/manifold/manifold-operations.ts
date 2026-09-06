import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Computes convex hull of the manifold shape provided
     * @param inputs two shapes
     * @returns hulled manifold shape
     * @group hulls
     * @shortname convex hull
     * @drawable true
     */
    hull(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.hull();
    }

    /**
     * Hull points or manifolds
     * @param inputs manifold
     * @returns manifold
     * @group hulls
     * @shortname hull points
     * @drawable true
     */
    hullPoints(inputs: Inputs.Manifold.HullPointsDto<(Inputs.Base.Point3 | Manifold3D.Manifold)[]>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { hull } = Manifold;
        return hull(inputs.points);
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
    slice(inputs: Inputs.Manifold.SliceDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.slice(inputs.height);
    }

    /**
     * Creates a projection on xy plane from the shape outline
     * @param inputs manifold
     * @returns projected cross section
     * @group cross sections
     * @shortname project
     * @drawable true
     */
    project(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.CrossSection {
        return inputs.manifold.project();
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
    setTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.setTolerance(inputs.tolerance);
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
    asOriginal(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.asOriginal();
    }

    /**
     * Returns the first of n sequential new unique mesh IDs for marking sets of triangles that can be looked up after further operations. Assign to Mesh.runOriginalID vector.
     * @param inputs count
     * @returns void
     * @group basic
     * @shortname reserve id
     * @drawable false
     */
    reserveIds(inputs: Inputs.Manifold.CountDto): number {
        const { Manifold } = this.manifold;
        const { reserveIDs } = Manifold;
        return reserveIDs(inputs.count);
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
    compose(inputs: Inputs.Manifold.ManifoldsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { compose } = Manifold;
        return compose(inputs.manifolds);
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
    decompose(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Manifold3D.Manifold[] {
        return inputs.manifold.decompose();
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
    calculateNormals(inputs: Inputs.Manifold.CalculateNormalsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.calculateNormals(inputs.normalIdx, inputs.minSharpAngle);
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
    calculateCurvature(inputs: Inputs.Manifold.CalculateCurvatureDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.calculateCurvature(inputs.gaussianIdx, inputs.meanIdx);
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
    refineToTolerance(inputs: Inputs.Manifold.ManifoldRefineToleranceDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refineToTolerance(inputs.tolerance);
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
    refineToLength(inputs: Inputs.Manifold.ManifoldRefineLengthDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refineToLength(inputs.length);
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
    refine(inputs: Inputs.Manifold.ManifoldRefineDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.refine(inputs.number);
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
    smoothOut(inputs: Inputs.Manifold.ManifoldSmoothOutDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.smoothOut(inputs.minSharpAngle, inputs.minSmoothness);
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
    smoothByNormals(inputs: Inputs.Manifold.ManifoldSmoothByNormalsDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.smoothByNormals(inputs.normalIdx);
    }

    /**
     * Return a copy of the manifold simplified to the given tolerance, but with
     * its actual tolerance value unchanged. The result will contain a subset of
     * the original verts and all surfaces will have moved by less than tolerance.
     * @param inputs manifold and tolerance
     * @returns simplified manifold
     * @group adjustments
     * @shortname simplify
     * @drawable true
     */
    simplify(inputs: Inputs.Manifold.ManifoldSimplifyDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.simplify(inputs.tolerance);
    }

    /**
     * Create a new copy of this manifold with updated vertex properties by
     * supplying a function that takes the existing position and properties as
     * input. You may specify any number of output properties, allowing creation
     * and removal of channels. Note: undefined behavior will result if you read
     * past the number of input properties or write past the number of output
     * properties.
     * @param inputs manifold, numProp and property function
     * @returns manifold with updated properties
     * @group adjustments
     * @shortname set properties
     * @drawable true
     */
    setProperties(inputs: Inputs.Manifold.ManifoldSetPropertiesDto<Manifold3D.Manifold>): Manifold3D.Manifold {
        return inputs.manifold.setProperties(inputs.numProp, inputs.propFunc);
    }
}
