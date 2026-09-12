import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Measuring Manifold solids and reading their bookkeeping: surface area and volume, vertex,
 * triangle and edge counts, the bounding box, the tolerance, the genus, the gap to another solid,
 * and the id and status the kernel tracks for every solid. Nothing here changes the solid.
 */
export class ManifoldEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Measures the total surface area of a solid, in square model units.
     * @param inputs - The solid
     * @returns The surface area
     * @group basic
     * @shortname surface area
     * @drawable false
     * @example
     * ```typescript
     * const area = await bitbybit.manifold.manifold.evaluate.surfaceArea({ manifold: cube });
     * ```
     */
    surfaceArea(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.surfaceArea();
    }

    /**
     * Measures the volume of a solid, in cubic model units.
     * @param inputs - The solid
     * @returns The volume
     * @group basic
     * @shortname volume
     * @drawable false
     * @example
     * ```typescript
     * const volume = await bitbybit.manifold.manifold.evaluate.volume({ manifold: cube });
     * ```
     */
    volume(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.volume();
    }

    /**
     * Tells whether a solid has no triangles at all, as the result of an intersection of shapes
     * that do not overlap would.
     * @param inputs - The solid
     * @returns True when the solid is empty
     * @group basic
     * @shortname is empty
     * @drawable false
     * @example
     * ```typescript
     * const empty = await bitbybit.manifold.manifold.evaluate.isEmpty({ manifold: shape });
     * ```
     */
    isEmpty(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): boolean {
        return inputs.manifold.isEmpty();
    }

    /**
     * Counts the vertices of a solid's mesh, the corners its triangles share.
     * @param inputs - The solid
     * @returns The number of vertices
     * @group basic
     * @shortname num vert
     * @drawable false
     * @example
     * ```typescript
     * const vertices = await bitbybit.manifold.manifold.evaluate.numVert({ manifold: shape });
     * ```
     */
    numVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numVert();
    }

    /**
     * Counts the triangles of a solid's mesh, which is its whole surface.
     * @param inputs - The solid
     * @returns The number of triangles
     * @group basic
     * @shortname num triangles
     * @drawable false
     * @example
     * ```typescript
     * const triangles = await bitbybit.manifold.manifold.evaluate.numTri({ manifold: shape });
     * ```
     */
    numTri(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numTri();
    }

    /**
     * Counts the edges of a solid's mesh, each shared by two triangles.
     * @param inputs - The solid
     * @returns The number of edges
     * @group basic
     * @shortname num edges
     * @drawable false
     * @example
     * ```typescript
     * const edges = await bitbybit.manifold.manifold.evaluate.numEdge({ manifold: shape });
     * ```
     */
    numEdge(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numEdge();
    }

    /**
     * Counts the property channels each vertex of a solid carries; the position alone takes three.
     * @param inputs - The solid
     * @returns The number of properties per vertex
     * @group basic
     * @shortname num prop
     * @drawable false
     * @example
     * ```typescript
     * const channels = await bitbybit.manifold.manifold.evaluate.numProp({ manifold: shape });
     * ```
     */
    numProp(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numProp();
    }

    /**
     * Counts the property vertices of a solid, which is at least `numVert`: a vertex whose
     * neighboring triangles carry different properties, such as a sharp edge with two normals, is
     * stored more than once.
     * @param inputs - The solid
     * @returns The number of property vertices
     * @group basic
     * @shortname num prop vert
     * @drawable false
     * @example
     * ```typescript
     * const propVertices = await bitbybit.manifold.manifold.evaluate.numPropVert({ manifold: shape });
     * ```
     */
    numPropVert(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.numPropVert();
    }

    /**
     * Finds the axis-aligned box around every vertex of a solid.
     * @param inputs - The solid
     * @returns The minimum corner and the maximum corner
     * @group basic
     * @shortname bounding box
     * @drawable false
     * @example
     * ```typescript
     * const [min, max] = await bitbybit.manifold.manifold.evaluate.boundingBox({ manifold: shape });
     * ```
     */
    boundingBox(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): Inputs.Base.Vector3[] {
        const bounds = inputs.manifold.boundingBox();
        return [bounds.min, bounds.max];
    }

    /**
     * Reads the tolerance of a solid, the rounding error that has built up over the transforms and
     * operations that made it.
     *
     * Triangles thinner than this are treated as degenerate and removed.
     * @param inputs - The solid
     * @returns The tolerance in model units
     * @group basic
     * @shortname tolerance
     * @drawable false
     * @example
     * ```typescript
     * const tolerance = await bitbybit.manifold.manifold.evaluate.tolerance({ manifold: shape });
     * ```
     */
    tolerance(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.tolerance();
    }

    /**
     * Counts the holes through a solid, the way a ring has one and a sphere none.
     *
     * It only makes sense for a single connected piece, so run `operations.decompose` first on a
     * solid made of several.
     * @param inputs - The solid
     * @returns The number of holes through the solid
     * @group basic
     * @shortname genus
     * @drawable false
     * @example
     * ```typescript
     * const holes = await bitbybit.manifold.manifold.evaluate.genus({ manifold: shape });
     * ```
     */
    genus(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.genus();
    }

    /**
     * Measures the smallest distance between two solids, searching no farther than `searchLength`.
     *
     * The result is between 0 and the search length.
     * @param inputs - The two solids and how far to search, in model units
     * @returns The smallest gap between them
     * @group basic
     * @shortname min gap
     * @drawable false
     * @example
     * ```typescript
     * const gap = await bitbybit.manifold.manifold.evaluate.minGap({ manifold1: cube, manifold2: sphere, searchLength: 100 });
     * ```
     */
    minGap(inputs: Inputs.Manifold.ManifoldsMinGapDto<Manifold3D.Manifold>): number {
        return inputs.manifold1.minGap(inputs.manifold2, inputs.searchLength);
    }

    /**
     * Reads the id of a solid that is an original, as `operations.asOriginal` or a freshly built
     * solid makes it; a solid produced from others by an operation reports -1.
     * @param inputs - The solid
     * @returns The original id, or -1
     * @group basic
     * @shortname original id
     * @drawable false
     * @example
     * ```typescript
     * const id = await bitbybit.manifold.manifold.evaluate.originalID({ manifold: shape });
     * ```
     */
    originalID(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): number {
        return inputs.manifold.originalID();
    }

    /**
     * Tells why a solid came out empty: `NoError`, or a reason such as `NotManifold` or
     * `InvalidConstruction` when the mesh it was built from was not a closed surface.
     *
     * The status is carried through later operations, so a broken input does not get lost; an empty
     * solid can still report `NoError`, as intersecting shapes that do not overlap does.
     * @param inputs - The solid
     * @returns The status name
     * @group basic
     * @shortname status
     * @drawable false
     * @example
     * ```typescript
     * const status = await bitbybit.manifold.manifold.evaluate.status({ manifold: shape });
     * ```
     */
    status(inputs: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>): string {
        return inputs.manifold.status();
    }

}
