import { Geom_Surface, BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import * as Models from "../../api/models";

/**
 * Faces in OpenCascade: bounded pieces of a surface, flat or curved, with an outer boundary wire
 * and optional inner wires that make holes. Build them from wires or surfaces, or as ready-made
 * flat shapes (circles, rectangles, stars, beam profiles) that lie on the ground plane unless
 * `direction` says otherwise; walk their surface through UV parameters to get points, normals and
 * grids of wires; cut hole patterns into them; and measure area and center of mass. U and V are the
 * two directions of a surface, given here as fractions from 0 to 1 of the face's own range. Faces
 * join edge to edge into shells, which `shapes.shell` handles.
 */
export class OCCTFace {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Rebuilds the surface of a face as a B-spline of the given U and V degrees.
     *
     * Lowering a degree smooths the surface into a simpler approximation within `tolerance`;
     * raising it is exact. `keepTrim` keeps the original boundary wires, which is reliable when
     * raising; otherwise the face covers the whole new surface. A rebuild that fails gives a null
     * face.
     * @param inputs - The face, the target U and V degrees, the tolerance and whether to keep the boundary
     * @returns The rebuilt face
     * @group rebuild
     * @shortname rebuild face degree
     * @drawable true
     * @example
     * ```typescript
     * const smoother = await bitbybit.occt.shapes.face.rebuildFaceDegree({ shape: face, uDegree: 2, vDegree: 2, tolerance: 0.01, keepTrim: true });
     * ```
     */
    rebuildFaceDegree(inputs: Inputs.OCCT.RebuildFaceDegreeDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.RebuildFaceDegree(inputs.shape, inputs.uDegree, inputs.vDegree, inputs.tolerance, inputs.keepTrim);
    }

    /**
     * Changes how the UV parameters run over a face: swap U and V, reverse U, reverse V, or any
     * combination.
     *
     * The geometry stays the same; only the parameter directions change, which matters for every
     * method here that works in UV, such as `subdivideToPoints` or `wireAlongParam`. The face is
     * rebuilt over the surface's natural bounds.
     * @param inputs - The face and which flips to apply
     * @returns The face with the changed parametrization
     * @group rebuild
     * @shortname flip face uv
     * @drawable true
     * @example
     * ```typescript
     * const flipped = await bitbybit.occt.shapes.face.flipFaceUV({ shape: face, swapUV: true, reverseU: false, reverseV: false });
     * ```
     */
    flipFaceUV(inputs: Inputs.OCCT.FlipFaceUVDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.FlipFaceUV(inputs.shape, inputs.swapUV, inputs.reverseU, inputs.reverseV);
    }

    /**
     * Reparametrizes a face so equal steps in U or V give roughly equal distances on the surface.
     *
     * Many surfaces bunch their parameters up in places, so a UV grid over them looks uneven; this
     * resamples the surface at `samples` points per direction and refits it, which evens out
     * `subdivideToPoints` and its siblings. The face is rebuilt over the new bounds.
     * @param inputs - The face, which directions to normalize, the sample count and the fit tolerance
     * @returns The reparametrized face
     * @group rebuild
     * @shortname normalize face uv
     * @drawable true
     * @example
     * ```typescript
     * const even = await bitbybit.occt.shapes.face.normalizeFaceParametrization({ shape: face, normalizeU: true, normalizeV: true, samples: 50, tolerance: 0.001 });
     * ```
     */
    normalizeFaceParametrization(inputs: Inputs.OCCT.NormalizeFaceParametrizationDto<TopoDS_Face>): TopoDS_Face {
        return this.occ.NormalizeFaceParametrization(inputs.shape, inputs.normalizeU, inputs.normalizeV, inputs.samples, inputs.tolerance);
    }

    /**
     * Collects diagnostic facts about a face: its surface type, U and V degrees, control point and
     * knot counts, whether U or V are closed, periodic or rational, the UV bounds, area, planarity,
     * orientation and the number of wires and edges.
     *
     * An empty or null face gives a report marked invalid.
     * @param inputs - The face to inspect
     * @returns The report
     * @group debug
     * @shortname face debug info
     * @drawable false
     * @example
     * ```typescript
     * const info = await bitbybit.occt.shapes.face.debugInfo({ shape: face });
     * console.log(info.type, info.isPlanar, info.area);
     * ```
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Models.OCCT.FaceDebugInfo {
        return JSON.parse(this.occ.FaceDebugInfoJson(inputs.shape)) as Models.OCCT.FaceDebugInfo;
    }

    /**
     * Creates a flat triangular face from three points.
     * @param inputs - The triangle as three points
     * @returns The face
     * @group from base
     * @shortname face from triangle
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.fromBaseTriangle({ triangle: [[0, 0, 0], [10, 0, 0], [0, 0, 10]] });
     * ```
     */
    fromBaseTriangle(inputs: Inputs.OCCT.TriangleBaseDto): TopoDS_Face {
        const wire = this.och.wiresService.createPolygonWire({ points: inputs.triangle });
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates one flat triangular face per triangle of a mesh.
     *
     * A triangle that cannot form a face, for instance one with repeated points, is skipped with a
     * warning in the console.
     * @param inputs - The mesh as a list of triangles
     * @returns One face per triangle that could be built
     * @group from base
     * @shortname faces from mesh
     * @drawable true
     * @example
     * ```typescript
     * const faces = await bitbybit.occt.shapes.face.fromBaseMesh({
     *     mesh: [[[0, 0, 0], [10, 0, 0], [0, 0, 10]], [[10, 0, 0], [10, 0, 10], [0, 0, 10]]],
     * });
     * ```
     */
    fromBaseMesh(inputs: Inputs.OCCT.MeshBaseDto): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        inputs.mesh.forEach((triangle) => {
            try {
                faces.push(this.fromBaseTriangle({ triangle }));
            } catch {
                console.warn("Failed to make face for triangle", triangle);
            }
        });
        return faces.flat();
    }

    /**
     * Creates one face per wire, each cut from the surface of a guiding face so it takes that
     * surface's curvature.
     *
     * The wires must lie on the surface. With `inside` true each wire is turned so its face is the
     * region it encloses; with false the wire's own direction decides, and a wire running the other
     * way gives the outside region.
     * @param inputs - The wires, the guiding face and which side to keep
     * @returns One face per wire, in the same order
     * @group from
     * @shortname faces from wires on face
     * @drawable true
     * @example
     * ```typescript
     * const patches = await bitbybit.occt.shapes.face.createFacesFromWiresOnFace({ wires: circlesOnSphere, face: sphereFace, inside: true });
     * ```
     */
    createFacesFromWiresOnFace(inputs: Inputs.OCCT.FacesFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWiresOnFace(inputs);
    }

    /**
     * Creates a face from a wire that lies on the surface of a guiding face, so the new face takes
     * the curvature of that surface.
     *
     * With `inside` true the wire is turned so the face is the region it encloses; with false the
     * wire's own direction decides, and a wire running the other way gives the region outside it.
     * @param inputs - The wire, the guiding face and which side to keep
     * @returns The new face
     * @group from
     * @shortname face from wire on face
     * @drawable true
     * @example
     * ```typescript
     * const patch = await bitbybit.occt.shapes.face.createFaceFromWireOnFace({ wire: circleOnCylinder, face: cylinderFace, inside: true });
     * ```
     */
    createFaceFromWireOnFace(inputs: Inputs.OCCT.FaceFromWireOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        return this.och.facesService.createFaceFromWireOnFace(inputs);
    }

    /**
     * Creates a face bounded by a closed wire.
     *
     * With `planar` true the wire must lie in one plane and the face is flat; with false a smooth
     * surface is fitted through the wire's edges, which fills a wire that is not flat. A shape that
     * is not a wire throws an error.
     * @param inputs - The wire and whether the face must be flat
     * @returns The new face
     * @group from
     * @shortname face from wire
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const disc = await bitbybit.occt.shapes.face.createFaceFromWire({ shape: wire, planar: true });
     * ```
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWire(inputs);
    }

    /**
     * Creates one face from several wires: the first wire is the outer boundary and every further
     * wire cuts a hole in it.
     *
     * With `planar` true the wires must lie in one plane. The hole wires must sit inside the outer
     * one without crossing it or each other.
     * @param inputs - The wires, outer boundary first, and whether the face must be flat
     * @returns The face with holes
     * @group from
     * @shortname face from wires
     * @drawable true
     * @example
     * ```typescript
     * const outer = await bitbybit.occt.shapes.wire.createRectangleWire({ width: 20, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * const hole = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 2, center: [0, 0, 0], direction: [0, 1, 0] });
     * const plate = await bitbybit.occt.shapes.face.createFaceFromWires({ shapes: [outer, hole], planar: true });
     * ```
     */
    createFaceFromWires(inputs: Inputs.OCCT.FaceFromWiresDto<TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.createFaceFromWires(inputs);
    }

    /**
     * Creates one face from several wires on the surface of a guiding face: the first wire is the
     * outer boundary and every further wire cuts a hole.
     *
     * The face takes the curvature of the guiding surface. `inside` applies to the first wire: true
     * turns it so the face is the region it encloses; false lets its own direction decide.
     * @param inputs - The wires, outer boundary first, the guiding face and which side to keep
     * @returns The face with holes
     * @group from
     * @shortname face from wires on face
     * @drawable true
     * @example
     * ```typescript
     * const perforated = await bitbybit.occt.shapes.face.createFaceFromWiresOnFace({ wires: [outerOnCylinder, holeOnCylinder], face: cylinderFace, inside: true });
     * ```
     */
    createFaceFromWiresOnFace(inputs: Inputs.OCCT.FaceFromWiresOnFaceDto<TopoDS_Wire, TopoDS_Face>): TopoDS_Face {
        return this.och.facesService.createFaceFromWiresOnFace(inputs);
    }

    /**
     * Creates one face per closed wire, each as `createFaceFromWire` would.
     *
     * With `planar` true every wire must lie in a plane; with false a smooth surface is fitted
     * through each.
     * @param inputs - The wires and whether the faces must be flat
     * @returns One face per wire, in the same order
     * @group from
     * @shortname faces from wires
     * @drawable true
     * @example
     * ```typescript
     * const faces = await bitbybit.occt.shapes.face.createFacesFromWires({ shapes: wires, planar: true });
     * ```
     */
    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        return this.och.facesService.createFacesFromWires(inputs);
    }

    /**
     * Joins circles with tangent belts: for each pair it draws the two outer tangent lines and the
     * outer arcs between them and fills that outline with a flat face.
     *
     * `combination` picks the pairs: `allWithAll` every circle with every other, `inOrder`
     * neighbors in the list, `inOrderClosed` also the last with the first. `unify` fuses the faces;
     * otherwise they form a compound.
     * @param inputs - The circle wires, how to pair them, whether to fuse the result and the tolerance
     * @returns The fused shape, or the compound of belt faces
     * @group from
     * @shortname face from circles tan
     * @drawable true
     * @example
     * ```typescript
     * const a = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 1, 0] });
     * const b = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 1, center: [10, 0, 0], direction: [0, 1, 0] });
     * const c = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 2, center: [5, 0, 8], direction: [0, 1, 0] });
     * const belt = await bitbybit.occt.shapes.face.createFaceFromMultipleCircleTanWires({
     *     circles: [a, b, c],
     *     combination: Bit.Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed,
     *     unify: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    createFaceFromMultipleCircleTanWires(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWiresDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWires(inputs);
    }

    /**
     * Joins circles from consecutive lists with tangent belts, the way
     * `createFaceFromMultipleCircleTanWires` joins single circles.
     *
     * `allWithAll` joins every circle of a list with every circle of the next; `inOrder` joins
     * circles at the same position in neighboring lists, which need equal lengths; `inOrderClosed`
     * also closes each list into a ring. `unify` fuses the faces; otherwise they form a compound.
     * @param inputs - The lists of circle wires, how to pair them, whether to fuse the result and the tolerance
     * @returns The fused shape, or the compound of belt faces
     * @group from
     * @shortname face from multiple circle tan collections
     * @drawable true
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.shapes.face.createFaceFromMultipleCircleTanWireCollections({
     *     listsOfCircles: [bottomRow, middleRow, topRow],
     *     combination: Bit.Inputs.OCCT.combinationCirclesForFaceEnum.inOrderClosed,
     *     unify: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    createFaceFromMultipleCircleTanWireCollections(inputs: Inputs.OCCT.FaceFromMultipleCircleTanWireCollectionsDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.facesService.createFaceFromMultipleCircleTanWireCollections(inputs);
    }


    /**
     * Creates a face that covers a whole surface, out to the surface's natural bounds.
     *
     * `tolerance` is used to detect degenerate edges, such as the pole of a sphere. Surfaces come
     * from `geom.surfaces`.
     * @param inputs - The surface and the tolerance for degenerate edges
     * @returns The face
     * @group from
     * @shortname surface
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.faceFromSurface({ shape: surface, tolerance: 1e-7 });
     * ```
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>): TopoDS_Face {
        return this.och.facesService.faceFromSurface(inputs);
    }

    /**
     * Creates a face by cutting a surface with a wire that lies on it.
     *
     * With `inside` true the wire is turned so the face is the region it encloses; with false the
     * wire's own direction decides, and a wire running the other way gives the region outside it.
     * Surfaces come from `geom.surfaces`.
     * @param inputs - The surface, the wire on it and which side to keep
     * @returns The face
     * @group from
     * @shortname surface and wire
     * @drawable true
     * @example
     * ```typescript
     * const patch = await bitbybit.occt.shapes.face.faceFromSurfaceAndWire({ surface, wire: wireOnSurface, inside: true });
     * ```
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface, TopoDS_Wire>): TopoDS_Face {
        return this.och.facesService.faceFromSurfaceAndWire(inputs);
    }

    /**
     * Creates a flat face from a list of corner points, closing the outline from the last point
     * back to the first.
     *
     * The points must lie in one plane.
     * @param inputs - The corner points in order
     * @returns The face
     * @group primitives
     * @shortname polygon
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createPolygonFace({ points: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]] });
     * ```
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): TopoDS_Face {
        return this.och.facesService.createPolygonFace(inputs);
    }

    /**
     * Creates a flat circular face, a disc.
     *
     * `direction` is the normal of its plane: the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The radius, the center and the plane normal
     * @returns The disc face
     * @group primitives
     * @shortname circle
     * @drawable true
     * @example
     * ```typescript
     * const disc = await bitbybit.occt.shapes.face.createCircleFace({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): TopoDS_Face {
        return this.och.entitiesService.createCircle(inputs.radius, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face);
    }

    /**
     * Fills a rectangle on the ground plane with a grid of flat hexagonal faces, centered on the
     * origin.
     *
     * The hexagons are scaled so `nrHexagonsInWidth` fit across `width` and `nrHexagonsInHeight`
     * across `height`. The scale, fillet and inclusion patterns are read hexagon by hexagon and
     * repeat; the extend flags stretch the outer rows past the edges to cover the rectangle.
     * @param inputs - The rectangle size, the hexagon counts, the extend flags and the optional patterns
     * @returns One face per hexagon, row by row
     * @group primitives
     * @shortname hexagons in grid
     * @drawable true
     * @example
     * ```typescript
     * const cells = await bitbybit.occt.shapes.face.hexagonsInGrid({
     *     width: 20,
     *     height: 10,
     *     nrHexagonsInWidth: 8,
     *     nrHexagonsInHeight: 4,
     *     flatTop: false,
     *     scalePatternWidth: [0.9],
     *     scalePatternHeight: [0.9],
     * });
     * ```
     */
    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): TopoDS_Face[] {
        const hexagonWires = this.och.wiresService.hexagonsInGrid(inputs);
        return this.och.facesService.createFacesFromWires({ shapes: hexagonWires, planar: true });
    }

    /**
     * Creates a flat elliptical face.
     *
     * `direction` is the normal of its plane: the default `[0, 1, 0]` lays it flat on the ground.
     * `radiusMajor` must be at least `radiusMinor`.
     * @param inputs - The two radii, the center and the plane normal
     * @returns The ellipse face
     * @group primitives
     * @shortname ellipse
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createEllipseFace({ radiusMinor: 3, radiusMajor: 6, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): TopoDS_Face {
        return this.och.entitiesService.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, Inputs.OCCT.typeSpecificityEnum.face);
    }

    /**
     * Creates a flat square face centered on `center`.
     *
     * `direction` is the normal of its plane: the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The side length, the center and the plane normal
     * @returns The square face
     * @group primitives
     * @shortname square
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.och.facesService.createSquareFace(inputs);
    }

    /**
     * Creates a flat rectangular face centered on `center`.
     *
     * On the ground plane `width` runs along X and `length` along Z; `direction` is the normal of
     * the plane, and the default `[0, 1, 0]` keeps the face flat on the ground.
     * @param inputs - The width, the length, the center and the plane normal
     * @returns The rectangle face
     * @group primitives
     * @shortname rectangle
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createRectangleFace({ width: 20, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.och.facesService.createRectangleFace(inputs);
    }

    /**
     * Creates a flat L-shaped face: two rectangular legs joined at a corner.
     *
     * The first leg has `widthFirst` and `lengthFirst`, the second `widthSecond` and
     * `lengthSecond`; `align` puts the corner on the outside, inside or middle of the legs, and
     * `rotation` turns the shape in its plane, in degrees. It lies flat on the ground unless
     * `direction` says otherwise.
     * @param inputs - The two leg sizes, the alignment, the rotation, the center and the plane normal
     * @returns The L-shaped face
     * @group primitives
     * @shortname L-polygon
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createLPolygonFace({
     *     widthFirst: 2,
     *     lengthFirst: 10,
     *     widthSecond: 2,
     *     lengthSecond: 6,
     *     align: Bit.Inputs.OCCT.directionEnum.outside,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createLPolygonFace(inputs: Inputs.OCCT.LPolygonDto): TopoDS_Face {
        const wire = this.och.wiresService.createLPolygonWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates a flat star-shaped face with `numRays` points.
     *
     * The points reach `outerRadius` and the notches between them `innerRadius`; `half` keeps only
     * the first half of the rays. `offsetOuterEdges` lifts the ray tips out of the plane and is
     * meant for the wire; a flat face needs it at 0. It lies flat on the ground unless `direction`
     * says otherwise.
     * @param inputs - The two radii, the number of rays, the center, the plane normal and the options
     * @returns The star face
     * @group primitives
     * @shortname star
     * @drawable true
     * @example
     * ```typescript
     * const star = await bitbybit.occt.shapes.face.createStarFace({ outerRadius: 5, innerRadius: 2, numRays: 5, center: [0, 0, 0], direction: [0, 1, 0], offsetOuterEdges: 0, half: false });
     * ```
     */
    createStarFace(inputs: Inputs.OCCT.StarDto): TopoDS_Face {
        const wire = this.och.wiresService.createStarWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates a flat face shaped like a stylized Christmas tree: `nrSkirts` layers of branches,
     * narrowing from `outerDist` to `innerDist` off the trunk line, on a trunk of `trunkHeight` and
     * `trunkWidth`.
     *
     * Unlike the other flat shapes here it stands upright in the XY plane, tip along Y; `direction`
     * is the trunk-to-tip direction, `rotation` spins it about that axis, in degrees.
     * @param inputs - The tree proportions, the trunk size, the options, the origin and the trunk-to-tip direction
     * @returns The tree face
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     * @example
     * ```typescript
     * const tree = await bitbybit.occt.shapes.face.createChristmasTreeFace({
     *     height: 10,
     *     innerDist: 1.5,
     *     outerDist: 4,
     *     nrSkirts: 4,
     *     trunkHeight: 1.5,
     *     trunkWidth: 1,
     *     half: false,
     *     rotation: 0,
     *     origin: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createChristmasTreeFace(inputs: Inputs.OCCT.ChristmasTreeDto): TopoDS_Face {
        const wire = this.och.wiresService.createChristmasTreeWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates a flat parallelogram face: a rectangle of `width` and `height` whose sides lean over
     * by `angle` degrees.
     *
     * With `aroundCenter` true the shape is centered on `center`; otherwise it starts there and
     * extends in the positive directions. `direction` is the normal of the plane; the default `[0,
     * 1, 0]` lays it flat on the ground.
     * @param inputs - The width, the height, the lean angle, whether to center it, the center and the plane normal
     * @returns The parallelogram face
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     * @example
     * ```typescript
     * const face = await bitbybit.occt.shapes.face.createParallelogramFace({ width: 10, height: 5, angle: 30, aroundCenter: true, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createParallelogramFace(inputs: Inputs.OCCT.ParallelogramDto): TopoDS_Face {
        const wire = this.och.wiresService.createParallelogramWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates a flat heart-shaped face that fits roughly into a square of `sizeApprox`.
     *
     * `rotation` turns it in its plane, in degrees. `direction` is the normal of the plane; the
     * default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The approximate size, the rotation, the center and the plane normal
     * @returns The heart face
     * @group primitives
     * @shortname heart
     * @drawable true
     * @example
     * ```typescript
     * const heart = await bitbybit.occt.shapes.face.createHeartFace({ sizeApprox: 10, rotation: 0, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createHeartFace(inputs: Inputs.OCCT.Heart2DDto): TopoDS_Face {
        const wire = this.och.wiresService.createHeartWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates a flat regular polygon face with `nrCorners` corners, all on a circle of `radius`.
     *
     * `direction` is the normal of the plane; the default `[0, 1, 0]` lays it flat on the ground.
     * @param inputs - The number of corners, the radius, the center and the plane normal
     * @returns The polygon face
     * @group primitives
     * @shortname n-gon
     * @drawable true
     * @example
     * ```typescript
     * const hexagon = await bitbybit.occt.shapes.face.createNGonFace({ nrCorners: 6, radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    createNGonFace(inputs: Inputs.OCCT.NGonWireDto): TopoDS_Face {
        const wire = this.och.wiresService.createNGonWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates the flat cross-section of an I-beam: two horizontal flanges joined by a vertical web.
     *
     * `width` is the flange width, `height` the total height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`,
     * `rotation` turns it in its plane, in degrees. It lies on the ground, ready to extrude along
     * Y.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The I-beam profile face
     * @group beam profiles
     * @shortname I-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.face.createIBeamProfileFace({
     *     width: 10,
     *     height: 20,
     *     webThickness: 2,
     *     flangeThickness: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * const beam = await bitbybit.occt.operations.extrude({ shape: profile, direction: [0, 100, 0] });
     * ```
     */
    createIBeamProfileFace(inputs: Inputs.OCCT.IBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createIBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Lists UV parameter pairs along one straight line across a face, the positions
     * `subdivideToPointsOnParam` turns into points.
     *
     * With `isU` true the line sits at `param` (a fraction from 0 to 1 of the U range) and
     * `nrPoints` positions spread over the whole V range; with false the roles swap. The pairs are
     * in the face's real UV values, not fractions.
     * @param inputs - The face, the direction, the fraction along it, the number of points and the options
     * @returns The UV pairs along the line, in order
     */
    subdivideToUVOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUVOnParam(inputs);
    }

    /**
     * Creates the flat cross-section of an H-beam: two vertical flanges joined by a horizontal web,
     * an I-beam on its side.
     *
     * `width` is the total width, `height` the flange height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`,
     * `rotation` turns it in its plane, in degrees. It lies on the ground.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The H-beam profile face
     * @group beam profiles
     * @shortname H-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.face.createHBeamProfileFace({
     *     width: 20,
     *     height: 10,
     *     webThickness: 2,
     *     flangeThickness: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createHBeamProfileFace(inputs: Inputs.OCCT.HBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createHBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Converts UV fractions into the face's real UV parameter values.
     *
     * `paramU` and `paramV` run from 0 to 1 over the face's U and V range; the result is the pair
     * in the surface's own units, as `getUMinBound` and its siblings report them.
     * @param inputs - The face and the U and V fractions
     * @returns The real U and V values
     */
    uvOnFace(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point2 {
        return this.och.facesService.uvOnFace(inputs);
    }

    /**
     * Creates the flat cross-section of a T-beam: a horizontal flange with a vertical web hanging
     * from its middle.
     *
     * `width` is the flange width, `height` the total height, `webThickness` and `flangeThickness`
     * the wall thicknesses; `alignment` says which point of the profile's box sits on `center`, and
     * `rotation` turns it in its plane, in degrees. It lies flat on the ground.
     * @param inputs - The profile size, the two thicknesses, the alignment, the rotation, the center and the plane normal
     * @returns The T-beam profile face
     * @group beam profiles
     * @shortname T-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.face.createTBeamProfileFace({
     *     width: 10,
     *     height: 12,
     *     webThickness: 2,
     *     flangeThickness: 2,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createTBeamProfileFace(inputs: Inputs.OCCT.TBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createTBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Creates the flat cross-section of a U-beam, a channel: a web with two flanges of
     * `flangeWidth` standing up from its ends.
     *
     * `width` and `height` are the total size, `webThickness` and `flangeThickness` the wall
     * thicknesses; `alignment` says which point of the profile's box sits on `center`, `rotation`
     * turns it in its plane, in degrees. It lies flat on the ground.
     * @param inputs - The profile size, the thicknesses, the flange width, the alignment, the rotation, the center and the plane normal
     * @returns The U-beam profile face
     * @group beam profiles
     * @shortname U-beam profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.face.createUBeamProfileFace({
     *     width: 10,
     *     height: 6,
     *     webThickness: 1,
     *     flangeThickness: 1,
     *     flangeWidth: 3,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     rotation: 0,
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     * });
     * ```
     */
    createUBeamProfileFace(inputs: Inputs.OCCT.UBeamProfileDto): TopoDS_Face {
        const wire = this.och.wiresService.createUBeamProfileWire(inputs);
        return this.createFaceFromWire({ shape: wire, planar: true });
    }

    /**
     * Picks one face out of a shape by its position, counting from 0, in the order the kernel walks
     * the shape.
     *
     * The shape must be a face or something built from faces; an index beyond the last face throws
     * an error.
     * @param inputs - The shape and the 0-based index
     * @returns The face at that index
     * @group get
     * @shortname face
     * @drawable true
     * @example
     * ```typescript
     * const first = await bitbybit.occt.shapes.face.getFace({ shape: box, index: 0 });
     * ```
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        return this.och.shapeGettersService.getFace(inputs);
    }

    /**
     * Lists every face of a shape in the order the kernel walks it.
     * @param inputs - The shape
     * @returns The faces found in the shape
     * @group get
     * @shortname faces
     * @drawable true
     * @example
     * ```typescript
     * const faces = await bitbybit.occt.shapes.face.getFaces({ shape: box });
     * ```
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.och.shapeGettersService.getFaces(inputs);
    }

    /**
     * Flips a face so its normal points the other way.
     *
     * The geometry stays the same; only the orientation changes, which decides the outside of a
     * shell and the direction `normalOnUV` reports.
     * @param inputs - The face
     * @returns The flipped face
     * @group get
     * @shortname reversed
     * @drawable true
     * @example
     * ```typescript
     * const flipped = await bitbybit.occt.shapes.face.reversedFace({ shape: face });
     * ```
     */
    reversedFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): TopoDS_Face {
        const face = inputs.shape;
        const reversed = face.Reversed();
        const result = this.och.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    /**
     * Lays a grid of points over a face by stepping evenly through its U and V ranges.
     *
     * `nrDivisionsU` by `nrDivisionsV` points cover the face edge to edge, listed row by row: all V
     * values for the first U, then the next U. The removal flags drop the first or last row; the
     * shift flags push every point half a step.
     * @param inputs - The face, the number of points in U and V, and the shift and removal options
     * @returns The points, row by row
     * @group extract
     * @shortname points
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.face.subdivideToPoints({
     *     shape: face,
     *     nrDivisionsU: 10,
     *     nrDivisionsV: 5,
     *     shiftHalfStepU: false,
     *     removeStartEdgeU: false,
     *     removeEndEdgeU: false,
     *     shiftHalfStepV: false,
     *     removeStartEdgeV: false,
     *     removeEndEdgeV: false,
     * });
     * ```
     */
    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPoints(inputs);
    }

    /**
     * Draws evenly spaced wires across a face along one parameter direction, like the lines of a
     * ruled sheet.
     *
     * `nrDivisions` steps give one more wire than that, the boundary lines included; `removeStart`
     * and `removeEnd` drop those, `shiftHalfStep` moves every wire half a step. With `isU` true
     * each wire sits at a fixed U and runs across V; false swaps the roles.
     * @param inputs - The face, the number of divisions, the direction and the options
     * @returns The wires, in order along the chosen direction
     * @group extract
     * @shortname wires
     * @drawable true
     * @example
     * ```typescript
     * const lines = await bitbybit.occt.shapes.face.subdivideToWires({ shape: face, nrDivisions: 10, isU: true, shiftHalfStep: false, removeStart: false, removeEnd: false });
     * ```
     */
    subdivideToWires(inputs: Inputs.OCCT.FaceSubdivisionToWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToWires(inputs);
    }

    /**
     * Lays rectangular wires over a face, one per cell of an `nrRectanglesU` by `nrRectanglesV`
     * division of its UV range, following the surface.
     *
     * The border offsets trim the range at each end. Each rectangle sits centered in its cell,
     * sized by the scale patterns as a fraction of it; the fillet pattern rounds corners, the
     * inclusion pattern skips cells.
     * @param inputs - The face, the cell counts, the border offsets and the optional patterns
     * @returns The rectangle wires, cell by cell
     * @group patterns
     * @shortname rectangle wires on face
     * @drawable true
     * @example
     * ```typescript
     * const cells = await bitbybit.occt.shapes.face.subdivideToRectangleWires({
     *     shape: face,
     *     nrRectanglesU: 6,
     *     nrRectanglesV: 4,
     *     scalePatternU: [0.8, 0.5],
     *     scalePatternV: [0.8],
     *     filletPattern: [0.3],
     *     inclusionPattern: [true, true, false],
     *     offsetFromBorderU: 0.05,
     *     offsetFromBorderV: 0.05,
     * });
     * ```
     */
    subdivideToRectangleWires(inputs: Inputs.OCCT.FaceSubdivideToRectangleWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToRectangleWires(inputs);
    }

    /**
     * Cuts a grid of rectangular holes into a face and returns the perforated face.
     *
     * The holes follow the same cells and patterns as `subdivideToRectangleWires`; when no scale
     * pattern is given each hole covers half its cell. With `holesToFaces` true the result also
     * carries one face per hole, after the perforated face, which is handy for lids or fillers.
     * @param inputs - The face, the cell counts, the border offsets, the optional patterns and whether to return the hole faces
     * @returns The perforated face, followed by the hole faces when asked for
     * @group patterns
     * @shortname rectangle holes on face
     * @drawable true
     * @example
     * ```typescript
     * const [perforated] = await bitbybit.occt.shapes.face.subdivideToRectangleHoles({
     *     shape: face,
     *     nrRectanglesU: 6,
     *     nrRectanglesV: 4,
     *     scalePatternU: [0.6],
     *     scalePatternV: [0.6],
     *     filletPattern: [0.5],
     *     inclusionPattern: [true],
     *     holesToFaces: false,
     *     offsetFromBorderU: 0.05,
     *     offsetFromBorderV: 0.05,
     * });
     * ```
     */
    subdivideToRectangleHoles(inputs: Inputs.OCCT.FaceSubdivideToRectangleHolesDto<TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.subdivideToRectangleHoles(inputs);
    }

    /**
     * Lays a honeycomb of hexagonal wires over a face, `nrHexagonsU` by `nrHexagonsV` of them
     * fitted into its UV range, each following the surface.
     *
     * The border offsets trim a fraction of the range at each end; `flatU` turns a flat side toward
     * U, the extend flags stretch the outer rows past the edges. Scale, fillet and inclusion
     * patterns repeat per hexagon.
     * @param inputs - The face, the hexagon counts, the orientation, the border offsets, the extend flags and the optional patterns
     * @returns The hexagon wires, row by row
     * @group patterns
     * @shortname hexagon wires on face
     * @drawable true
     * @example
     * ```typescript
     * const cells = await bitbybit.occt.shapes.face.subdivideToHexagonWires({
     *     shape: face,
     *     nrHexagonsU: 8,
     *     nrHexagonsV: 6,
     *     flatU: false,
     *     scalePatternU: [0.9],
     *     scalePatternV: [0.9],
     *     filletPattern: [0.2],
     *     inclusionPattern: [true],
     *     offsetFromBorderU: 0,
     *     offsetFromBorderV: 0,
     * });
     * ```
     */
    subdivideToHexagonWires(inputs: Inputs.OCCT.FaceSubdivideToHexagonWiresDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.subdivideToHexagonWires(inputs);
    }

    /**
     * Cuts a honeycomb of hexagonal holes into a face and returns the perforated face.
     *
     * The holes follow the same layout and patterns as `subdivideToHexagonWires`; when no scale
     * pattern is given each hole is half the size of its hexagon. With `holesToFaces` true the
     * result also carries one face per hole, after the perforated face.
     * @param inputs - The face, the hexagon counts, the orientation, the border offsets, the optional patterns and whether to return the hole faces
     * @returns The perforated face, followed by the hole faces when asked for
     * @group patterns
     * @shortname hexagon holes on face
     * @drawable true
     * @example
     * ```typescript
     * const [perforated] = await bitbybit.occt.shapes.face.subdivideToHexagonHoles({
     *     shape: face,
     *     nrHexagonsU: 8,
     *     nrHexagonsV: 6,
     *     flatU: false,
     *     holesToFaces: false,
     *     scalePatternU: [0.7],
     *     scalePatternV: [0.7],
     *     filletPattern: [0],
     *     inclusionPattern: [true],
     *     offsetFromBorderU: 0.05,
     *     offsetFromBorderV: 0.05,
     * });
     * ```
     */
    subdivideToHexagonHoles(inputs: Inputs.OCCT.FaceSubdivideToHexagonHolesDto<TopoDS_Face>): TopoDS_Face[] {
        return this.och.facesService.subdivideToHexagonHoles(inputs);
    }

    /**
     * Lays a grid of points over a face like `subdivideToPoints`, but shifts and removes points on
     * every nth row or column, for brick-like and staggered patterns.
     *
     * Each rule is a pair: `shiftHalfStepNthU` says every how-manyth V row moves half a step in U,
     * `shiftHalfStepUOffsetN` where counting starts; the removal rules drop every nth point of an
     * edge row.
     * @param inputs - The face, the number of points in U and V, and the nth-row shift and removal rules
     * @returns The points, row by row
     * @group extract
     * @shortname points nth
     * @drawable true
     * @example
     * ```typescript
     * const staggered = await bitbybit.occt.shapes.face.subdivideToPointsControlled({
     *     shape: face,
     *     nrDivisionsU: 10,
     *     nrDivisionsV: 10,
     *     shiftHalfStepNthU: 2,
     *     shiftHalfStepUOffsetN: 0,
     *     removeStartEdgeNthU: 0,
     *     removeStartEdgeUOffsetN: 0,
     *     removeEndEdgeNthU: 0,
     *     removeEndEdgeUOffsetN: 0,
     *     shiftHalfStepNthV: 0,
     *     shiftHalfStepVOffsetN: 0,
     *     removeStartEdgeNthV: 0,
     *     removeStartEdgeVOffsetN: 0,
     *     removeEndEdgeNthV: 0,
     *     removeEndEdgeVOffsetN: 0,
     * });
     * ```
     */
    subdivideToPointsControlled(inputs: Inputs.OCCT.FaceSubdivisionControlledDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsControlled(inputs);
    }

    /**
     * Computes the surface normal at every point of the grid `subdivideToPoints` would lay over a
     * face, with the same options and the same order.
     *
     * The normals are unit vectors and follow the face's orientation, so a reversed face gives them
     * flipped. Pair the list with `subdivideToPoints` to place things standing on the surface.
     * @param inputs - The face, the number of points in U and V, and the shift and removal options
     * @returns The unit normals, row by row
     * @group extract
     * @shortname normals
     * @drawable true
     * @example
     * ```typescript
     * const normals = await bitbybit.occt.shapes.face.subdivideToNormals({
     *     shape: face,
     *     nrDivisionsU: 10,
     *     nrDivisionsV: 5,
     *     shiftHalfStepU: false,
     *     removeStartEdgeU: false,
     *     removeEndEdgeU: false,
     *     shiftHalfStepV: false,
     *     removeStartEdgeV: false,
     *     removeEndEdgeV: false,
     * });
     * ```
     */
    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Vector3[] {
        return this.och.facesService.subdivideToNormals(inputs);
    }

    /**
     * Lists the UV parameter pairs of the grid `subdivideToPoints` would lay over a face, with the
     * same options and the same order.
     *
     * The pairs are in the face's real UV values, not fractions.
     * @param inputs - The face, the number of points in U and V, and the shift and removal options
     * @returns The UV pairs, row by row
     * @group extract
     * @shortname uvs
     * @drawable true
     * @example
     * ```typescript
     * const uvs = await bitbybit.occt.shapes.face.subdivideToUV({
     *     shape: face,
     *     nrDivisionsU: 10,
     *     nrDivisionsV: 5,
     *     shiftHalfStepU: false,
     *     removeStartEdgeU: false,
     *     removeEndEdgeU: false,
     *     shiftHalfStepV: false,
     *     removeStartEdgeV: false,
     *     removeEndEdgeV: false,
     * });
     * ```
     */
    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>): Base.Point2[] {
        return this.och.facesService.subdivideToUV(inputs);
    }

    /**
     * Finds the point on a face at the given UV fractions.
     *
     * `paramU` and `paramV` run from 0 to 1 over the face's U and V range, so `0.5, 0.5` is the
     * middle of the range, which on a trimmed face is not always inside the face.
     * @param inputs - The face and the U and V fractions
     * @returns The point on the surface
     * @group extract
     * @shortname point on uv
     * @drawable true
     * @example
     * ```typescript
     * const middle = await bitbybit.occt.shapes.face.pointOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
     * ```
     */
    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.pointOnUV(inputs);
    }

    /**
     * Finds the surface normal of a face at the given UV fractions.
     *
     * `paramU` and `paramV` run from 0 to 1 over the face's U and V range. The normal is a unit
     * vector and follows the face's orientation, so a reversed face gives it flipped.
     * @param inputs - The face and the U and V fractions
     * @returns The unit normal
     * @group extract
     * @shortname normal on uv
     * @drawable true
     * @example
     * ```typescript
     * const normal = await bitbybit.occt.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
     * ```
     */
    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>): Base.Vector3 {
        return this.och.facesService.faceNormalOnUV(inputs);
    }

    /**
     * Finds the points on a face at several UV fraction pairs at once.
     *
     * Each pair holds U then V, both from 0 to 1 over the face's range.
     * @param inputs - The face and the list of U and V fraction pairs
     * @returns One point per pair, in the same order
     * @group extract
     * @shortname points on uvs
     * @drawable true
     * @example
     * ```typescript
     * const points = await bitbybit.occt.shapes.face.pointsOnUVs({ shape: face, paramsUV: [[0, 0], [0.5, 0.5], [1, 1]] });
     * ```
     */
    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.pointsOnUVs(inputs);
    }

    /**
     * Finds the surface normals of a face at several UV fraction pairs at once.
     *
     * Each pair holds U then V, both from 0 to 1 over the face's range. The normals are unit
     * vectors of the underlying surface; unlike `normalOnUV`, they are not flipped for a reversed
     * face.
     * @param inputs - The face and the list of U and V fraction pairs
     * @returns One unit normal per pair, in the same order
     * @group extract
     * @shortname normals on uvs
     * @drawable true
     * @example
     * ```typescript
     * const normals = await bitbybit.occt.shapes.face.normalsOnUVs({ shape: face, paramsUV: [[0, 0], [0.5, 0.5], [1, 1]] });
     * ```
     */
    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): Base.Vector3[] {
        return this.och.facesService.normalsOnUVs(inputs);
    }

    /**
     * Places evenly spaced points along one straight line across a face's UV range.
     *
     * With `isU` true the line sits at `param` (a fraction from 0 to 1 of the U range) and
     * `nrPoints` points spread over the whole V range; with false the roles swap.
     * `removeStartPoint` and `removeEndPoint` drop the ends, and `shiftHalfStep` moves every point
     * half a step.
     * @param inputs - The face, the direction, the fraction along it, the number of points and the options
     * @returns The points along the line, in order
     * @group extract
     * @shortname points on param
     * @drawable true
     * @example
     * ```typescript
     * const midline = await bitbybit.occt.shapes.face.subdivideToPointsOnParam({ shape: face, isU: true, param: 0.5, nrPoints: 10, shiftHalfStep: false, removeStartPoint: false, removeEndPoint: false });
     * ```
     */
    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.subdivideToPointsOnParam(inputs);
    }

    /**
     * Draws one wire across a face along a parameter line, following the surface.
     *
     * With `isU` true the wire sits at `param` (a fraction from 0 to 1 of the U range) and runs
     * over the whole V range; with false the roles swap.
     * @param inputs - The face, the direction and the fraction along it
     * @returns The wire on the surface
     * @group extract
     * @shortname wire along param
     * @drawable true
     * @example
     * ```typescript
     * const middle = await bitbybit.occt.shapes.face.wireAlongParam({ shape: face, isU: true, param: 0.5 });
     * ```
     */
    wireAlongParam(inputs: Inputs.OCCT.WireAlongParamDto<TopoDS_Face>): TopoDS_Wire {
        return this.och.facesService.wireAlongParam(inputs);
    }

    /**
     * Draws several wires across a face, one per parameter value, following the surface.
     *
     * With `isU` true each wire sits at its fraction of the U range and runs over the whole V
     * range; with false the roles swap.
     * @param inputs - The face, the direction and the fractions along it
     * @returns One wire per fraction, in the same order
     * @group extract
     * @shortname wires along params
     * @drawable true
     * @example
     * ```typescript
     * const wires = await bitbybit.occt.shapes.face.wiresAlongParams({ shape: face, isU: false, params: [0.25, 0.5, 0.75] });
     * ```
     */
    wiresAlongParams(inputs: Inputs.OCCT.WiresAlongParamsDto<TopoDS_Face>): TopoDS_Wire[] {
        return this.och.facesService.wiresAlongParams(inputs);
    }

    /**
     * Reads the smallest U parameter value of a face, in the surface's own units.
     *
     * Together with `getUMaxBound`, `getVMinBound` and `getVMaxBound` it gives the range that the
     * UV fractions used elsewhere in this class map onto.
     * @param inputs - The face
     * @returns The lower U bound
     * @group get
     * @shortname u min
     * @drawable false
     * @example
     * ```typescript
     * const uMin = await bitbybit.occt.shapes.face.getUMinBound({ shape: face });
     * ```
     */
    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMinBound(inputs);
    }

    /**
     * Reads the largest U parameter value of a face, in the surface's own units.
     * @param inputs - The face
     * @returns The upper U bound
     * @group get
     * @shortname u max
     * @drawable false
     * @example
     * ```typescript
     * const uMax = await bitbybit.occt.shapes.face.getUMaxBound({ shape: face });
     * ```
     */
    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getUMaxBound(inputs);
    }

    /**
     * Reads the smallest V parameter value of a face, in the surface's own units.
     * @param inputs - The face
     * @returns The lower V bound
     * @group get
     * @shortname v min
     * @drawable false
     * @example
     * ```typescript
     * const vMin = await bitbybit.occt.shapes.face.getVMinBound({ shape: face });
     * ```
     */
    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMinBound(inputs);
    }

    /**
     * Reads the largest V parameter value of a face, in the surface's own units.
     * @param inputs - The face
     * @returns The upper V bound
     * @group get
     * @shortname v max
     * @drawable false
     * @example
     * ```typescript
     * const vMax = await bitbybit.occt.shapes.face.getVMaxBound({ shape: face });
     * ```
     */
    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getVMaxBound(inputs);
    }

    /**
     * Measures the surface area of a face, in square model units.
     * @param inputs - The face
     * @returns The area
     * @group get
     * @shortname face area
     * @drawable false
     * @example
     * ```typescript
     * const area = await bitbybit.occt.shapes.face.getFaceArea({ shape: face });
     * ```
     */
    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        return this.och.facesService.getFaceArea(inputs);
    }

    /**
     * Measures the surface area of each face in a list, in square model units.
     * @param inputs - The faces
     * @returns One area per face, in the same order
     * @group get
     * @shortname areas of faces
     * @drawable false
     * @example
     * ```typescript
     * const areas = await bitbybit.occt.shapes.face.getFacesAreas({ shapes: faces });
     * ```
     */
    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return this.och.facesService.getFacesAreas(inputs);
    }

    /**
     * Finds the center of mass of a face, the point its area balances on.
     *
     * On a curved or ring-shaped face this point can lie off the surface.
     * @param inputs - The face
     * @returns The center of mass
     * @group get
     * @shortname center of mass
     * @drawable true
     * @example
     * ```typescript
     * const center = await bitbybit.occt.shapes.face.getFaceCenterOfMass({ shape: face });
     * ```
     */
    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        return this.och.facesService.getFaceCenterOfMass(inputs);
    }

    /**
     * Finds the center of mass of each face in a list.
     * @param inputs - The faces
     * @returns One point per face, in the same order
     * @group get
     * @shortname centers of mass
     * @drawable true
     * @example
     * ```typescript
     * const centers = await bitbybit.occt.shapes.face.getFacesCentersOfMass({ shapes: faces });
     * ```
     */
    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.getFacesCentersOfMass(inputs);
    }

    /**
     * Keeps the points of a list that lie on a face, sorting each point as inside the face, on its
     * boundary or outside it.
     *
     * `keepIn`, `keepOn` and `keepOut` choose which groups come back; `tolerance` decides how close
     * to the boundary counts as on it. A point off the surface is judged by where it lands in UV
     * space.
     * @param inputs - The face, the points, the tolerance and which groups to keep
     * @returns The points that passed, in their original order
     * @group filter
     * @shortname filter face points
     * @drawable true
     * @example
     * ```typescript
     * const onFace = await bitbybit.occt.shapes.face.filterFacePoints({
     *     shape: face,
     *     points: grid,
     *     tolerance: 1e-4,
     *     useBndBox: false,
     *     gapTolerance: 0.1,
     *     keepIn: true,
     *     keepOn: true,
     *     keepOut: false,
     *     keepUnknown: false,
     * });
     * ```
     */
    filterFacePoints(inputs: Inputs.OCCT.FilterFacePointsDto<TopoDS_Face>): Base.Point3[] {
        return this.och.facesService.filterFacePoints(inputs);
    }

    /**
     * Runs `filterFacePoints` against several faces with the same points and options.
     *
     * By default the result holds one list per face; with `flatPointsArray` true the lists are
     * joined into one, so a point on two faces appears twice.
     * @param inputs - The faces, the points, the tolerance, which groups to keep and whether to flatten the result
     * @returns One list of points per face, or a single joined list
     * @group filter
     * @shortname filter points on faces
     * @drawable true
     * @example
     * ```typescript
     * const perFace = await bitbybit.occt.shapes.face.filterFacesPoints({
     *     shapes: faces,
     *     points: grid,
     *     tolerance: 1e-4,
     *     useBndBox: false,
     *     gapTolerance: 0.1,
     *     keepIn: true,
     *     keepOn: true,
     *     keepOut: false,
     *     keepUnknown: false,
     *     flatPointsArray: false,
     * });
     * ```
     */
    filterFacesPoints(inputs: Inputs.OCCT.FilterFacesPointsDto<TopoDS_Face>): Base.Point3[] | Base.Point3[][] {
        let res: Base.Point3[] | Base.Point3[][] = inputs.shapes.map(s => this.och.facesService.filterFacePoints({ ...inputs, shape: s }));
        if (inputs.flatPointsArray) {
            res = res.flat();
        }
        return res;
    }
}
