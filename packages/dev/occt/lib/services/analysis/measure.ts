import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type { FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { squareFrame } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { readKernelException } from "../../kernel-exception";
import { checkedFrame, checkedNumber, checkedShape, checkedWhole } from "../base/input-checks";
import { framesFromNumbers, numbersOfFrames } from "../base/frames";
import { DEGREES_PER_RADIAN, fractionsOnSupport, supportType } from "../base/surface-analysis";

/**
 * Measurements of shapes: a bounding box that follows the geometry exactly, a box in a frame, the
 * box turned to fit and the principal axes of inertia, every closest pair of points between two
 * shapes with the sub-shapes they lie on, angles between faces and edges, the dihedral angle along an
 * edge, and the tightest radius of curvature. Lengths are in model units and angles in degrees.
 */
export class OCCTAnalysisMeasure {

    constructor(
        private readonly occ: BitbybitOcctModule,
        _och: OccHelper,
    ) { }

    /**
     * Finds the box lined up with the axes that just holds a shape's exact geometry.
     *
     * Unlike `operations.boundingBoxOfShape`, which may add tolerances and the mesh, it leaves no gap:
     * a ball of radius 3 gets a box of 6. A face carrying only a mesh is boxed by its nodes; a shape
     * with nothing to bound is refused.
     * @param inputs - The shape
     * @returns The box as `min`, `max`, `center` and `size`
     * @group boxes
     * @shortname tight bbox
     * @drawable false
     * @example
     * ```typescript
     * const box = await bitbybit.occt.analysis.measure.tightBoundingBox({ shape: part });
     * console.log(box.size, box.center);
     * ```
     */
    tightBoundingBox(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingBoxPropsDto {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Shape>;
        const box = this.occ.TightBoundingBox(checkedShape(resolved.shape));
        if (!box.IsValid) {
            throw new InputError("`shape` has no geometry to bound, so it has no bounding box.", "shape");
        }
        const min: Inputs.Base.Point3 = [box.XMin, box.YMin, box.ZMin];
        const max: Inputs.Base.Point3 = [box.XMax, box.YMax, box.ZMax];
        return {
            min,
            max,
            center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
            size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
        };
    }

    /**
     * Finds the box that just holds a shape with its sides along a frame's axes instead of the
     * world's.
     *
     * The box's x runs along the frame's direction and its z along the normal. It comes back as a
     * frame at its center and half its size along each axis; `orientedBoundingBox` turns the box to
     * fit instead.
     * @param inputs - The shape and the frame whose axes the box follows
     * @returns The frame at the box's center and the half sizes along its direction, y axis and normal
     * @group boxes
     * @shortname bbox in frame
     * @drawable false
     * @example
     * ```typescript
     * const { frame, halfSizes } = await bitbybit.occt.analysis.measure.boundingBoxInFrame({
     *     shape: part,
     *     frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 1, 0] },
     * });
     * ```
     */
    boundingBoxInFrame(inputs: Inputs.OCCT.BoundingBoxInFrameDto<TopoDS_Shape>): Models.OCCT.OrientedBoundingBox {
        const resolved = resolveDto(Inputs.OCCT.BoundingBoxInFrameDto, inputs) as Resolved.OCCT.BoundingBoxInFrameDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const frame = checkedFrame(resolved.frame, "frame");
        const box = this.occ.BoundingBoxInFrame(shape, numbersOfFrames([frame]));
        if (!box.IsValid) {
            throw new InputError("`shape` has no geometry to bound, so it has no bounding box.", "shape");
        }
        const axes = squareFrame(frame.origin, frame.normal, frame.direction) as FrameAxes;
        const middle = [(box.XMin + box.XMax) / 2, (box.YMin + box.YMax) / 2, (box.ZMin + box.ZMax) / 2] as const;
        const along = (axis: 0 | 1 | 2): number => axes.origin[axis] + middle[0] * axes.x[axis] + middle[1] * axes.y[axis] + middle[2] * axes.z[axis];
        return {
            frame: { origin: [along(0), along(1), along(2)], normal: axes.z, direction: axes.x },
            halfSizes: [(box.XMax - box.XMin) / 2, (box.YMax - box.YMin) / 2, (box.ZMax - box.ZMin) / 2],
        };
    }

    /**
     * Finds the smallest box that fits around a shape, turned to follow it rather than the axes: a
     * frame at the box's centre, its direction along the longest side and its normal along the
     * shortest, with half the box's size along each.
     *
     * `boundingBoxInFrame` keeps the axes of a frame you give instead.
     * @param inputs - The shape
     * @returns The frame and the half sizes along its direction, y axis and normal
     * @group boxes
     * @shortname oriented bounding box
     * @drawable false
     * @example
     * ```typescript
     * const { frame, halfSizes } = await bitbybit.occt.analysis.measure.orientedBoundingBox({ shape: part });
     * ```
     */
    orientedBoundingBox(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.OrientedBoundingBox {
        const numbers = this.occ.OrientedBoundingBox(checkedShape(inputs.shape));
        return { frame: framesFromNumbers(numbers)[0]!, halfSizes: [numbers[9]!, numbers[10]!, numbers[11]!] };
    }

    /**
     * Finds a shape's principal axes of inertia as a frame at its centre of mass: the direction is
     * the axis it turns about most easily, the normal the one it resists most.
     *
     * Solids are measured by volume, even inside out, else faces by area, else edges by length, at
     * a density of 1. Each axis's largest coordinate is positive.
     * @param inputs - The shape
     * @returns The frame and the moments about its direction, y axis and normal
     * @group frames
     * @shortname principal frame
     * @drawable false
     * @example
     * ```typescript
     * const { frame, moments } = await bitbybit.occt.analysis.measure.principalFrame({ shape: part });
     * ```
     */
    principalFrame(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.PrincipalFrame {
        const numbers = this.occ.PrincipalFrame(checkedShape(inputs.shape));
        return { frame: framesFromNumbers(numbers)[0]!, moments: [numbers[9]!, numbers[10]!, numbers[11]!] };
    }

    /**
     * Finds every nearest pair of points between two shapes, with the vertex, edge or face each point
     * lies on and where on it.
     *
     * Touching, overlapping and nested shapes are 0 apart; a shape inside another gives one pair on
     * one of its vertices, with -1 as the containing side's index.
     * `operations.closestPointsBetweenTwoShapes` gives one pair alone.
     * @param inputs - The two shapes
     * @returns The nearest pairs
     * @group distances
     * @shortname extrema
     * @drawable false
     * @example
     * ```typescript
     * const [nearest] = await bitbybit.occt.analysis.measure.extrema({ shapeA: box, shapeB: ball });
     * console.log(nearest.distance, nearest.supportA, nearest.indexA);
     * ```
     */
    extrema(inputs: Inputs.OCCT.TwoShapesDto<TopoDS_Shape>): Models.OCCT.ShapeExtremum[] {
        const resolved = resolveDto(Inputs.OCCT.TwoShapesDto, inputs) as Resolved.OCCT.TwoShapesDto<TopoDS_Shape>;
        const shapeA = checkedShape(resolved.shapeA, "shapeA");
        const shapeB = checkedShape(resolved.shapeB, "shapeB");
        return this.occ.ExtremaBetween(shapeA, shapeB).map(pair => {
            const [uA, vA] = fractionsOnSupport(this.occ, shapeA, pair.supportA, pair.indexA, pair.uA, pair.vA);
            const [uB, vB] = fractionsOnSupport(this.occ, shapeB, pair.supportB, pair.indexB, pair.uB, pair.vB);
            return {
                pointA: pair.pointA,
                pointB: pair.pointB,
                distance: pair.distance,
                supportA: supportType(pair.supportA),
                supportB: supportType(pair.supportB),
                indexA: pair.indexA,
                indexB: pair.indexB,
                uA,
                vA,
                uB,
                vB,
            };
        });
    }

    /**
     * Measures the angle in degrees between two faces or edges where they come nearest each other.
     *
     * Faces compare their normals, 0 when they look the same way and 180 when opposite; edges compare
     * their tangents; a face and an edge compare the normal with the tangent, so the edge meets the
     * face's plane at 90 minus the angle.
     * @param inputs - The two faces or edges
     * @returns The angle in degrees, with the points and directions it was read at
     * @group angles
     * @shortname angle between
     * @drawable false
     * @example
     * ```typescript
     * const top = await bitbybit.occt.shapes.face.getFace({ shape: box, index: 5 });
     * const side = await bitbybit.occt.shapes.face.getFace({ shape: box, index: 0 });
     * const { angle } = await bitbybit.occt.analysis.measure.angleBetween({ shapeA: top, shapeB: side });
     * ```
     */
    angleBetween(inputs: Inputs.OCCT.TwoShapesDto<TopoDS_Shape>): Models.OCCT.AngleBetween {
        const resolved = resolveDto(Inputs.OCCT.TwoShapesDto, inputs) as Resolved.OCCT.TwoShapesDto<TopoDS_Shape>;
        const found = this.occ.AngleBetween(checkedShape(resolved.shapeA, "shapeA"), checkedShape(resolved.shapeB, "shapeB"));
        return { angle: found.angle * DEGREES_PER_RADIAN, pointA: found.pointA, pointB: found.pointB, directionA: found.directionA, directionB: found.directionB };
    }

    /**
     * Measures the angle through the material between the two faces that meet at an edge.
     *
     * A box's edges read 90 degrees, a smooth join 180 and an L's inner edge 270; up to 180 the edge
     * is convex. `param` is a share of the edge's parameter range, and of its length only on lines and
     * circles.
     * @param inputs - The shape, the edge as `shapes.edge.getEdges` counts it and the place along it
     * @returns The angle in degrees, with the point, the two faces and their normals
     * @group angles
     * @shortname dihedral angle
     * @drawable false
     * @example
     * ```typescript
     * const { angle, isConvex } = await bitbybit.occt.analysis.measure.dihedralAngle({ shape: part, index: 3, param: 0.5 });
     * ```
     */
    dihedralAngle(inputs: Inputs.OCCT.DihedralAngleDto<TopoDS_Shape>): Models.OCCT.DihedralAngle {
        const resolved = resolveDto(Inputs.OCCT.DihedralAngleDto, inputs) as Resolved.OCCT.DihedralAngleDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const index = checkedWhole(resolved.index, "index", 0);
        const param = checkedNumber(resolved.param, "param", 0, 1);
        const found = this.withEdgeInRange(shape, index, () => this.occ.DihedralAngle(shape, index, param));
        return {
            angle: found.angle * DEGREES_PER_RADIAN,
            isConvex: found.isConvex,
            point: found.point,
            normalA: found.normalA,
            normalB: found.normalB,
            faceIndexA: found.faceA,
            faceIndexB: found.faceB,
        };
    }

    /**
     * Finds the tightest bend of a shape, sampled over its faces and edges, and where it is.
     *
     * Each face is read on a grid of `samples` by `samples` places inside its trims and each edge at
     * `samples` places, so a tighter bend between them can be missed. A sharp edge between faces is no
     * bend; `dihedralAngle` measures it.
     * @param inputs - The shape, the sample count and whether only concave bends count
     * @returns The smallest radius found, where, and on which face or edge
     * @group curvature
     * @shortname min curvature radius
     * @drawable false
     * @example
     * ```typescript
     * const { radius, support, index } = await bitbybit.occt.analysis.measure.minCurvatureRadius({ shape: part, samples: 16, concaveOnly: true });
     * ```
     */
    minCurvatureRadius(inputs: Inputs.OCCT.MinCurvatureRadiusDto<TopoDS_Shape>): Models.OCCT.MinCurvatureRadius {
        const resolved = resolveDto(Inputs.OCCT.MinCurvatureRadiusDto, inputs) as Resolved.OCCT.MinCurvatureRadiusDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const samples = checkedWhole(resolved.samples, "samples", 1);
        const found = this.occ.MinCurvatureRadius(shape, samples, resolved.concaveOnly);
        return { radius: found.radius, point: found.point, support: supportType(found.support), index: found.index };
    }

    private withEdgeInRange<T>(shape: TopoDS_Shape, index: number, call: () => T): T {
        try {
            return call();
        } catch (thrown) {
            const read = readKernelException(this.occ, thrown);
            if (!(read instanceof Error && read.message.endsWith("the shape has no edge at that index"))) {
                throw read;
            }
            const edges = this.occ.EdgesOf(shape, true);
            const count = edges.length;
            edges.forEach(edge => edge.delete());
            const counted = count === 0 ? "the shape has no edges" : `its edges are numbered from 0 to ${count - 1}`;
            throw new InputError(`\`index\` is ${index}, past the shape's last edge: ${counted}.`, "index");
        }
    }
}
