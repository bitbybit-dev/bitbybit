import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { Base } from "../api/inputs";

/**
 * Moving, turning, scaling and mirroring OpenCascade shapes, and building the 4x4 matrices that
 * describe such moves. Every method returns a new shape and leaves the input as it was. Angles are
 * in degrees, distances in model units, and a rotation axis passes through the origin unless a
 * method takes a center. Matrices are 16 numbers in column-major order (the translation sits at
 * indices 12 to 14); a list of matrices is applied first to last as one combined move, which is how
 * `transformByMatrix` and the `...ToMatrix` builders fit together.
 */
export class OCCTTransforms {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Scales, rotates and moves a shape in one go: first the scale about the origin, then the
     * rotation about an axis through the origin, then the translation.
     *
     * Because the scale and the rotation happen about the origin, a shape that is not there also
     * swings around it; move it first, or use `rotateAroundCenter` and `scale3d` for a chosen
     * center.
     * @param inputs - The shape, the translation, the rotation axis and angle in degrees, and the scale factor
     * @returns The transformed shape
     * @group on single shape
     * @shortname transform
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.occt.transforms.transform({
     *     shape: box,
     *     translation: [10, 0, 0],
     *     rotationAxis: [0, 1, 0],
     *     rotationAngle: 45,
     *     scaleFactor: 2,
     * });
     * ```
     */
    transform(inputs: Inputs.OCCT.TransformDto<TopoDS_Shape>): TopoDS_Shape {
        const scaledShape = this.scale({ shape: inputs.shape, factor: inputs.scaleFactor });
        const rotatedShape = this.rotate({ shape: scaledShape, axis: inputs.rotationAxis, angle: inputs.rotationAngle });
        const translatedShape = this.translate({ shape: rotatedShape, translation: inputs.translation });
        scaledShape.delete();
        rotatedShape.delete();
        return translatedShape;
    }

    /**
     * Rotates a shape about an axis that passes through the origin, by an angle in degrees.
     *
     * The rotation follows the right-hand rule: with the thumb along `axis`, the fingers show the
     * positive direction. A shape away from the origin swings around it; `rotateAroundCenter`
     * rotates about a chosen point instead.
     * @param inputs - The shape, the axis direction and the angle in degrees
     * @returns The rotated shape
     * @group on single shape
     * @shortname rotate
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.occt.transforms.rotate({ shape: box, axis: [0, 1, 0], angle: 90 });
     * ```
     */
    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotate(inputs);
    }

    /**
     * Rotates a shape about an axis that passes through a chosen point, by an angle in degrees.
     *
     * The shape is moved so the point sits at the origin, rotated there with the right-hand rule
     * about `axis`, and moved back.
     * @param inputs - The shape, the angle in degrees, the point the axis passes through and the axis direction
     * @returns The rotated shape
     * @group on single shape
     * @shortname rotate around center
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.occt.transforms.rotateAroundCenter({ shape: box, angle: 90, center: [5, 0, 5], axis: [0, 1, 0] });
     * ```
     */
    rotateAroundCenter(inputs: Inputs.OCCT.RotateAroundCenterDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeTranslated = this.translate({ shape: inputs.shape, translation: inputs.center.map(c => -c) as Base.Vector3 });
        const angle = inputs.angle;
        const rotatedShape = this.rotate({ shape: shapeTranslated, axis: inputs.axis, angle });
        const result = this.translate({ shape: rotatedShape, translation: inputs.center });
        rotatedShape.delete();
        shapeTranslated.delete();
        return result;
    }

    /**
     * Moves a shape so that one point and direction on it land on another point and direction: the
     * frame `fromOrigin` with `fromDirection` is carried onto `toOrigin` with `toDirection`.
     *
     * This is the way to stand a shape on a surface or point it along a line: the shape is both
     * moved and turned, never scaled.
     * @param inputs - The shape, the point and direction to take from, and the point and direction to land on
     * @returns The aligned shape
     * @group on single shape
     * @shortname align
     * @drawable true
     * @example
     * ```typescript
     * const standing = await bitbybit.occt.transforms.align({
     *     shape: cylinder,
     *     fromOrigin: [0, 0, 0],
     *     fromDirection: [0, 1, 0],
     *     toOrigin: [10, 5, 0],
     *     toDirection: [1, 0, 0],
     * });
     * ```
     */
    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.align(inputs);
    }

    /**
     * Moves a shape so that a full frame on it lands on another frame: a point, its normal and one
     * axis in the plane of that normal are carried onto their targets.
     *
     * Where `align` fixes one direction and leaves the spin around it free, this also fixes the
     * spin, which matters for shapes that are not round about their axis.
     * @param inputs - The shape, the point, normal and axis to take from, and the point, normal and axis to land on
     * @returns The aligned shape
     * @group on single shape
     * @shortname align normal and axis
     * @drawable true
     * @example
     * ```typescript
     * const placed = await bitbybit.occt.transforms.alignNormAndAxis({
     *     shape: bracket,
     *     fromOrigin: [0, 0, 0],
     *     fromNorm: [0, 1, 0],
     *     fromAx: [1, 0, 0],
     *     toOrigin: [10, 0, 0],
     *     toNorm: [0, 0, 1],
     *     toAx: [0, 1, 0],
     * });
     * ```
     */
    alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignNormAndAxis(inputs);
    }

    /**
     * Turns a shape so that its Y axis points along `direction`, then moves it to `center`.
     *
     * The flat shapes and primitives of this package are built on the ground with Y up, so this is
     * the one call that places any of them: the direction becomes their new up, and the center
     * where they sit.
     * @param inputs - The shape, the direction its Y axis should point along and the point to move it to
     * @returns The placed shape
     * @group on single shape
     * @shortname align and translate
     * @drawable true
     * @example
     * ```typescript
     * const placed = await bitbybit.occt.transforms.alignAndTranslate({ shape: profile, direction: [1, 0, 0], center: [10, 0, 0] });
     * ```
     */
    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignAndTranslate(inputs);
    }

    /**
     * Moves a shape by a vector, in model units.
     * @param inputs - The shape and the vector to move it by
     * @returns The moved shape
     * @group on single shape
     * @shortname translate
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.occt.transforms.translate({ shape: box, translation: [10, 0, 0] });
     * ```
     */
    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.translate(inputs);
    }

    /**
     * Scales a shape uniformly about the origin by a factor.
     *
     * A shape away from the origin also moves away from or toward it; `scaleFromCenter` scales
     * about a chosen point and `scale3d` scales each axis by its own factor.
     * @param inputs - The shape and the factor
     * @returns The scaled shape
     * @group on single shape
     * @shortname scale
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.occt.transforms.scale({ shape: box, factor: 2 });
     * ```
     */
    scale(inputs: Inputs.OCCT.ScaleDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const gpPnt = this.och.entitiesService.gpPnt([0.0, 0.0, 0.0]);
        transformation.SetScale(gpPnt, inputs.factor);
        const transf = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
        const s = transf.Shape();
        const result = this.och.converterService.getActualTypeOfShape(s);
        gpPnt.delete();
        transformation.delete();
        transf.delete();
        s.delete();
        return result;
    }

    /**
     * Scales a shape by a separate factor along X, Y and Z, about a chosen center point.
     *
     * Unequal factors stretch the shape, which turns circles into ellipses and can make later
     * operations, such as fillets, slower or fail; keep the factors equal when the shape only needs
     * to grow.
     * @param inputs - The shape, the three factors and the point to scale about
     * @returns The scaled shape
     * @group on single shape
     * @shortname scale 3d
     * @drawable true
     * @example
     * ```typescript
     * const stretched = await bitbybit.occt.transforms.scale3d({ shape: box, scale: [1, 2, 1], center: [0, 0, 0] });
     * ```
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scale3d(inputs); 
    }


    /**
     * Mirrors a shape across a line: the axis through `origin` along `direction`.
     *
     * Every point lands as far behind the line as it was in front, which in 3D is the same as a
     * half turn about that axis.
     * @param inputs - The shape, a point on the axis and the axis direction
     * @returns The mirrored shape
     * @group on single shape
     * @shortname mirror
     * @drawable true
     * @example
     * ```typescript
     * const flipped = await bitbybit.occt.transforms.mirror({ shape: box, origin: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirror(inputs);
    }

    /**
     * Mirrors a shape across a plane given by a point on it and its normal.
     *
     * This is the usual mirror image, the kind a symmetric part needs; the result is turned inside
     * out in the sense that a left-hand shape becomes a right-hand one.
     * @param inputs - The shape, a point on the mirror plane and the plane's normal
     * @returns The mirrored shape
     * @group on single shape
     * @shortname mirror normal
     * @drawable true
     * @example
     * ```typescript
     * const other = await bitbybit.occt.transforms.mirrorAlongNormal({ shape: leftHalf, origin: [0, 0, 0], normal: [1, 0, 0] });
     * ```
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAlongNormal(inputs);
    }

    /**
     * Applies `transform` to several shapes, each with its own translation, rotation axis, angle
     * and scale factor.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one translation, rotation axis, angle in degrees and scale factor per shape
     * @returns The transformed shapes, in the same order
     * @group on shapes
     * @shortname transforms
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.occt.transforms.transformShapes({
     *     shapes: [box, sphere],
     *     translations: [[10, 0, 0], [-10, 0, 0]],
     *     rotationAxes: [[0, 1, 0], [0, 1, 0]],
     *     rotationAngles: [45, 0],
     *     scaleFactors: [1, 2],
     * });
     * ```
     */
    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.translations, inputs.rotationAxes, inputs.rotationAngles, inputs.scaleFactors]);
        return inputs.shapes.map((s, index) => this.transform({
            shape: s,
            translation: inputs.translations[index]!,
            rotationAxis: inputs.rotationAxes[index]!,
            rotationAngle: inputs.rotationAngles[index]!,
            scaleFactor: inputs.scaleFactors[index]!,
        }));
    }

    /**
     * Applies `rotate` to several shapes, each about its own axis through the origin and by its own
     * angle in degrees.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one axis and angle per shape
     * @returns The rotated shapes, in the same order
     * @group on shapes
     * @shortname rotations
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.occt.transforms.rotateShapes({ shapes: [box, sphere], axes: [[0, 1, 0], [1, 0, 0]], angles: [90, 45] });
     * ```
     */
    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.axes, inputs.angles]);
        return inputs.shapes.map((s, index) => this.rotate({
            shape: s,
            axis: inputs.axes[index]!,
            angle: inputs.angles[index]!,
        }));
    }

    /**
     * Applies `rotateAroundCenter` to several shapes, each with its own angle in degrees, center
     * and axis.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one angle, center and axis per shape
     * @returns The rotated shapes, in the same order
     * @group on shapes
     * @shortname rotations around center
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.occt.transforms.rotateAroundCenterShapes({
     *     shapes: [box, sphere],
     *     angles: [90, 45],
     *     centers: [[5, 0, 5], [0, 0, 0]],
     *     axes: [[0, 1, 0], [0, 1, 0]],
     * });
     * ```
     */
    rotateAroundCenterShapes(inputs: Inputs.OCCT.RotateAroundCenterShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.axes, inputs.angles]);
        return inputs.shapes.map((s, index) => this.rotateAroundCenter({
            shape: s,
            axis: inputs.axes[index]!,
            angle: inputs.angles[index]!,
            center: inputs.centers[index]!,
        }));
    }

    /**
     * Applies `align` to several shapes, each with its own from and to frames.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one from origin, from direction, to origin and to direction per shape
     * @returns The aligned shapes, in the same order
     * @group on shapes
     * @shortname alignments
     * @drawable true
     * @example
     * ```typescript
     * const placed = await bitbybit.occt.transforms.alignShapes({
     *     shapes: [cylinder, cylinder2],
     *     fromOrigins: [[0, 0, 0], [0, 0, 0]],
     *     fromDirections: [[0, 1, 0], [0, 1, 0]],
     *     toOrigins: [[10, 0, 0], [20, 0, 0]],
     *     toDirections: [[1, 0, 0], [0, 0, 1]],
     * });
     * ```
     */
    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Point3 | Base.Vector3>([inputs.shapes, inputs.fromOrigins, inputs.fromDirections, inputs.toOrigins, inputs.toDirections]);
        return inputs.shapes.map((s, index) => this.align({
            shape: s,
            fromOrigin: inputs.fromOrigins[index]!,
            fromDirection: inputs.fromDirections[index]!,
            toOrigin: inputs.toOrigins[index]!,
            toDirection: inputs.toDirections[index]!
        }));
    }

    /**
     * Applies `alignAndTranslate` to several shapes, each with its own direction and center.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one direction and center per shape
     * @returns The placed shapes, in the same order
     * @group on shapes
     * @shortname align and translate
     * @drawable true
     * @example
     * ```typescript
     * const placed = await bitbybit.occt.transforms.alignAndTranslateShapes({
     *     shapes: [profile, profile2],
     *     directions: [[1, 0, 0], [0, 0, 1]],
     *     centers: [[10, 0, 0], [0, 0, 10]],
     * });
     * ```
     */
    alignAndTranslateShapes(inputs: Inputs.OCCT.AlignAndTranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3>([inputs.shapes, inputs.centers, inputs.directions]);
        return inputs.shapes.map((s, index) => this.alignAndTranslate({
            shape: s,
            center: inputs.centers[index]!,
            direction: inputs.directions[index]!,
        }));
    }

    /**
     * Applies `translate` to several shapes, each by its own vector.
     *
     * The two lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one translation vector per shape
     * @returns The moved shapes, in the same order
     * @group on shapes
     * @shortname translations
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.occt.transforms.translateShapes({ shapes: [box, sphere], translations: [[10, 0, 0], [-10, 0, 0]] });
     * ```
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3>([inputs.shapes, inputs.translations]);
        return inputs.shapes.map((s, index) => this.translate({
            shape: s,
            translation: inputs.translations[index]!,
        }));
    }

    /**
     * Applies `scale` to several shapes, each uniformly about the origin by its own factor.
     *
     * The two lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one factor per shape
     * @returns The scaled shapes, in the same order
     * @group on shapes
     * @shortname scales
     * @drawable true
     * @example
     * ```typescript
     * const scaled = await bitbybit.occt.transforms.scaleShapes({ shapes: [box, sphere], factors: [2, 0.5] });
     * ```
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | number>([inputs.shapes, inputs.factors]);
        return inputs.shapes.map((s, index) => this.scale({
            shape: s,
            factor: inputs.factors[index]!,
        }));
    }

    /**
     * Applies `scale3d` to several shapes, each with its own three factors and center.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one scale vector and center per shape
     * @returns The scaled shapes, in the same order
     * @group on shapes
     * @shortname scales 3d
     * @drawable true
     * @example
     * ```typescript
     * const scaled = await bitbybit.occt.transforms.scale3dShapes({
     *     shapes: [box, sphere],
     *     scales: [[1, 2, 1], [2, 2, 2]],
     *     centers: [[0, 0, 0], [10, 0, 0]],
     * });
     * ```
     */
    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.scales, inputs.centers]);
        return inputs.shapes.map((s, index) => this.scale3d({
            shape: s,
            scale: inputs.scales[index]!,
            center: inputs.centers[index]!,
        }));
    }


    /**
     * Applies `mirror` to several shapes, each across its own axis.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one axis origin and direction per shape
     * @returns The mirrored shapes, in the same order
     * @group on shapes
     * @shortname mirrors
     * @drawable true
     * @example
     * ```typescript
     * const flipped = await bitbybit.occt.transforms.mirrorShapes({
     *     shapes: [box, sphere],
     *     origins: [[0, 0, 0], [0, 0, 0]],
     *     directions: [[0, 1, 0], [1, 0, 0]],
     * });
     * ```
     */
    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.directions, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirror({
            shape: s,
            origin: inputs.origins[index]!,
            direction: inputs.directions[index]!,
        }));
    }

    /**
     * Applies `mirrorAlongNormal` to several shapes, each across its own plane.
     *
     * All the lists must have the same length, or an error is thrown.
     * @param inputs - The shapes and one plane origin and normal per shape
     * @returns The mirrored shapes, in the same order
     * @group on shapes
     * @shortname mirrors normal
     * @drawable true
     * @example
     * ```typescript
     * const others = await bitbybit.occt.transforms.mirrorAlongNormalShapes({
     *     shapes: [leftArm, leftLeg],
     *     origins: [[0, 0, 0], [0, 0, 0]],
     *     normals: [[1, 0, 0], [1, 0, 0]],
     * });
     * ```
     */
    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.normals, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirrorAlongNormal({
            shape: s,
            normal: inputs.normals[index]!,
            origin: inputs.origins[index]!,
        }));
    }

    /**
     * Scales a shape uniformly about a chosen point by a factor.
     *
     * The point stays where it is and everything else moves away from it or toward it.
     * @param inputs - The shape, the factor and the point to scale about
     * @returns The scaled shape
     * @group on single shape
     * @shortname scale from center
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.occt.transforms.scaleFromCenter({ shape: box, factor: 2, center: [5, 0, 5] });
     * ```
     */
    scaleFromCenter(inputs: Inputs.OCCT.ScaleFromCenterDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scaleFromCenter(inputs);
    }

    /**
     * Mirrors a shape through a point: every point of the shape lands as far beyond the point as it
     * was before it, on the opposite side.
     *
     * The result is turned inside out, the way a plane mirror turns a left hand into a right hand.
     * @param inputs - The shape and the point to mirror through
     * @returns The mirrored shape
     * @group on single shape
     * @shortname mirror about point
     * @drawable true
     * @example
     * ```typescript
     * const inverted = await bitbybit.occt.transforms.mirrorAboutPoint({ shape: box, point: [0, 0, 0] });
     * ```
     */
    mirrorAboutPoint(inputs: Inputs.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAboutPoint(inputs);
    }

    /**
     * Rotates a shape about the origin by a quaternion given as `[x, y, z, w]`.
     *
     * The quaternion is normalized first, so its length does not matter. Quaternions are what
     * animation and physics libraries hand out, so this saves converting them to an axis and an
     * angle.
     * @param inputs - The shape and the quaternion
     * @returns The rotated shape
     * @group on single shape
     * @shortname rotate by quaternion
     * @drawable true
     * @example
     * ```typescript
     * const turned = await bitbybit.occt.transforms.rotateByQuaternion({ shape: box, quaternion: [0, 0.7071, 0, 0.7071] });
     * ```
     */
    rotateByQuaternion(inputs: Inputs.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotateByQuaternion(inputs);
    }

    /**
     * Applies a 4x4 matrix, or a list of matrices applied first to last, to a shape.
     *
     * The matrix is column-major, so the translation sits at indices 12 to 14. A matrix that
     * stretches or shears is allowed; build matrices with the `...ToMatrix` methods and combine
     * them with `multiplyTransforms`. A matrix the kernel cannot apply throws an error.
     * @param inputs - The shape and the matrix or list of matrices
     * @returns The transformed shape
     * @group by matrix
     * @shortname transform by matrix
     * @drawable true
     * @example
     * ```typescript
     * const move = await bitbybit.occt.transforms.translationToMatrix({ translation: [10, 0, 0] });
     * const turn = await bitbybit.occt.transforms.rotationAxisAngleToMatrix({ axis: [0, 1, 0], angle: 90, center: [0, 0, 0] });
     * const placed = await bitbybit.occt.transforms.transformByMatrix({ shape: box, transformation: [turn, move] });
     * ```
     */
    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.transformByMatrix(inputs);
    }

    /**
     * Applies the same 4x4 matrix, or list of matrices applied first to last, to several shapes, as
     * `transformByMatrix` does for one.
     * @param inputs - The shapes and the matrix or list of matrices
     * @returns The transformed shapes, in the same order
     * @group by matrix
     * @shortname transform shapes by matrix
     * @drawable true
     * @example
     * ```typescript
     * const moved = await bitbybit.occt.transforms.transformShapesByMatrix({ shapes: [box, sphere], transformation: matrix });
     * ```
     */
    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.transformsService.transformShapesByMatrix(inputs);
    }

    /**
     * Reads the placement a shape carries, the transform stored on it rather than baked into its
     * geometry, as a matrix plus its translation, rotation quaternion and uniform scale.
     *
     * A shape placed with `align` or through an assembly carries such a placement; most other
     * methods here bake the move into the geometry, and such a shape reports the identity.
     * @param inputs - The shape to read
     * @returns The matrix, the translation, the quaternion as `[x, y, z, w]` and the scale
     * @group by matrix
     * @shortname get shape transform
     * @drawable false
     * @example
     * ```typescript
     * const placement = await bitbybit.occt.transforms.getShapeTransform({ shape: movedBox });
     * console.log(placement.translation, placement.scale);
     * ```
     */
    getShapeTransform(inputs: Inputs.OCCT.ShapeTransformQueryDto<TopoDS_Shape>): Inputs.OCCT.ShapeTransformInfo {
        return this.och.transformsService.getShapeTransform(inputs);
    }

    /**
     * Builds the identity matrix, the transform that changes nothing, as a starting point for
     * composing others.
     * @returns The identity matrix, column-major
     * @group matrix builders
     * @shortname identity matrix
     * @drawable false
     * @example
     * ```typescript
     * const identity = await bitbybit.occt.transforms.identityTransform();
     * ```
     */
    identityTransform(): Base.TransformMatrix {
        return this.och.transformsService.identityTransform();
    }

    /**
     * Builds one matrix from a translation, three rotation angles in degrees about X, Y and Z, and
     * a uniform scale.
     *
     * The scale is applied first, then the rotations (Z first, then Y, then X), then the
     * translation, which is the order assembly placements use. Any part left out is taken as no
     * change.
     * @param inputs - The translation, the three rotation angles in degrees and the scale factor
     * @returns The combined matrix, column-major
     * @group matrix builders
     * @shortname compose transform
     * @drawable false
     * @example
     * ```typescript
     * const placement = await bitbybit.occt.transforms.composeTransform({ translation: [10, 0, 0], rotation: [0, 90, 0], scale: 1 });
     * ```
     */
    composeTransform(inputs: Inputs.OCCT.ComposeTransformDto): Base.TransformMatrix {
        return this.och.transformsService.composeTransform(inputs);
    }

    /**
     * Folds a list of matrices into one, applied first to last, so a chain of moves becomes a
     * single matrix.
     *
     * A single matrix is returned unchanged and an empty list gives the identity.
     * @param inputs - The matrix or list of matrices
     * @returns The combined matrix, column-major
     * @group matrix builders
     * @shortname multiply transforms
     * @drawable false
     * @example
     * ```typescript
     * const combined = await bitbybit.occt.transforms.multiplyTransforms({ transformation: [turn, move] });
     * ```
     */
    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Base.TransformMatrix {
        return this.och.transformsService.multiplyTransforms(inputs);
    }

    /**
     * Inverts a matrix, giving the transform that undoes it: applying a matrix and then its inverse
     * puts a shape back where it was.
     * @param inputs - The matrix to invert
     * @returns The inverse matrix, column-major
     * @group matrix builders
     * @shortname invert transform
     * @drawable false
     * @example
     * ```typescript
     * const back = await bitbybit.occt.transforms.invertTransform({ transformation: placement });
     * ```
     */
    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Base.TransformMatrix {
        return this.och.transformsService.invertTransform(inputs);
    }

    /**
     * Builds the matrix of a move by a vector, in model units.
     * @param inputs - The translation vector
     * @returns The translation matrix, column-major
     * @group matrix builders
     * @shortname translation to matrix
     * @drawable false
     * @example
     * ```typescript
     * const move = await bitbybit.occt.transforms.translationToMatrix({ translation: [10, 0, 0] });
     * ```
     */
    translationToMatrix(inputs: Inputs.OCCT.TranslationToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.translationToMatrix(inputs);
    }

    /**
     * Builds the matrix of a rotation by an angle in degrees about an axis, through the origin or
     * through an optional center point.
     *
     * The rotation follows the right-hand rule about `axis`.
     * @param inputs - The axis direction, the angle in degrees and the optional point the axis passes through
     * @returns The rotation matrix, column-major
     * @group matrix builders
     * @shortname rotation axis angle to matrix
     * @drawable false
     * @example
     * ```typescript
     * const turn = await bitbybit.occt.transforms.rotationAxisAngleToMatrix({ axis: [0, 1, 0], angle: 90, center: [5, 0, 5] });
     * ```
     */
    rotationAxisAngleToMatrix(inputs: Inputs.OCCT.RotationAxisAngleToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.rotationAxisAngleToMatrix(inputs);
    }

    /**
     * Builds the matrix of a uniform scale by a factor about the origin or an optional center
     * point.
     * @param inputs - The factor and the optional point to scale about
     * @returns The scale matrix, column-major
     * @group matrix builders
     * @shortname scale uniform to matrix
     * @drawable false
     * @example
     * ```typescript
     * const grow = await bitbybit.occt.transforms.scaleUniformToMatrix({ factor: 2, center: [0, 0, 0] });
     * ```
     */
    scaleUniformToMatrix(inputs: Inputs.OCCT.ScaleUniformToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.scaleUniformToMatrix(inputs);
    }

    /**
     * Builds the matrix of a mirror through a point, the transform `mirrorAboutPoint` applies.
     * @param inputs - The point to mirror through
     * @returns The mirror matrix, column-major
     * @group matrix builders
     * @shortname mirror point to matrix
     * @drawable false
     * @example
     * ```typescript
     * const invert = await bitbybit.occt.transforms.mirrorPointToMatrix({ point: [0, 0, 0] });
     * ```
     */
    mirrorPointToMatrix(inputs: Inputs.OCCT.MirrorPointToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPointToMatrix(inputs);
    }

    /**
     * Builds the matrix of a mirror across a line, the transform `mirror` applies: the axis through
     * `origin` along `direction`.
     * @param inputs - A point on the axis and the axis direction
     * @returns The mirror matrix, column-major
     * @group matrix builders
     * @shortname mirror axis to matrix
     * @drawable false
     * @example
     * ```typescript
     * const flip = await bitbybit.occt.transforms.mirrorAxisToMatrix({ origin: [0, 0, 0], direction: [0, 1, 0] });
     * ```
     */
    mirrorAxisToMatrix(inputs: Inputs.OCCT.MirrorAxisToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorAxisToMatrix(inputs);
    }

    /**
     * Builds the matrix of a mirror across a plane, the transform `mirrorAlongNormal` applies: the
     * plane through `origin` with the given normal.
     * @param inputs - A point on the plane and the plane's normal
     * @returns The mirror matrix, column-major
     * @group matrix builders
     * @shortname mirror plane to matrix
     * @drawable false
     * @example
     * ```typescript
     * const reflect = await bitbybit.occt.transforms.mirrorPlaneToMatrix({ origin: [0, 0, 0], normal: [1, 0, 0] });
     * ```
     */
    mirrorPlaneToMatrix(inputs: Inputs.OCCT.MirrorPlaneToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPlaneToMatrix(inputs);
    }

    /**
     * Builds the rotation matrix of a quaternion given as `[x, y, z, w]`.
     *
     * The quaternion is normalized first, so its length does not matter.
     * @param inputs - The quaternion
     * @returns The rotation matrix, column-major
     * @group matrix builders
     * @shortname quaternion to matrix
     * @drawable false
     * @example
     * ```typescript
     * const turn = await bitbybit.occt.transforms.quaternionToMatrix({ quaternion: [0, 0.7071, 0, 0.7071] });
     * ```
     */
    quaternionToMatrix(inputs: Inputs.OCCT.QuaternionToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.quaternionToMatrix(inputs);
    }

    private checkIfListsEqualLength<T>(lists: T[][]) {
        const firstLength = lists[0]!.length;
        const notSameLength = lists.some(s => s.length !== firstLength);
        if (notSameLength) {
            throw new Error("Some of the list lengths are not the same. For this operation to work all lists need to be of equal length");
        }
    }
}
