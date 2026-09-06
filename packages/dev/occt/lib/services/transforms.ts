import { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { Base } from "../api/inputs";

export class OCCTTransforms {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Transforms the shape
     * @param inputs Transformation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname transform
     * @drawable true
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
     * Rotate the shape
     * @param inputs Rotation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate
     * @drawable true
     */
    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotate(inputs);
    }

    /**
     * Rotate the shape around the provided center
     * @param inputs Rotation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate around center
     * @drawable true
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
     * Align the shape
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align
     * @drawable true
     */
    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.align(inputs);
    }

    /**
     * Align the shape with normal and axis
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align normal and axis
     * @drawable true
     */
    alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignNormAndAxis(inputs);
    }

    /**
     * Align and translates the shape
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align and translate
     * @drawable true
     */
    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignAndTranslate(inputs);
    }

    /**
     * Translates the shape
     * @param inputs Translation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname translate
     * @drawable true
     */
    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.translate(inputs);
    }

    /**
     * Scales the shape
     * @param inputs Scale description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname scale
     * @drawable true
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
     * Scales the shape in 3D
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     * @group on single shape
     * @shortname scale 3d
     * @drawable true
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scale3d(inputs); 
    }


    /**
     * Mirrors the shape
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror
     * @drawable true
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirror(inputs);
    }

    /**
     * Mirrors the shape along the normal and origin
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror normal
     * @drawable true
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAlongNormal(inputs);
    }

    /**
     * Transforms the array of shapes with transformations
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname transforms
     * @drawable true
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
     * Rotate the shapes with rotations
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname rotations
     * @drawable true
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
     * Rotate the shapes around the center and an axis
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname rotations around center
     * @drawable true
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
     * Align the shapes with alignments
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname alignments
     * @drawable true
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
     * Align and translate the shapes
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname align and translate
     * @drawable true
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
     * Translates the shapes with translations
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname translations
     * @drawable true
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3>([inputs.shapes, inputs.translations]);
        return inputs.shapes.map((s, index) => this.translate({
            shape: s,
            translation: inputs.translations[index]!,
        }));
    }

    /**
     * Scales the shapes with scale factors
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname scales
     * @drawable true
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | number>([inputs.shapes, inputs.factors]);
        return inputs.shapes.map((s, index) => this.scale({
            shape: s,
            factor: inputs.factors[index]!,
        }));
    }

    /**
     * Scales the shape in 3D
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     * @group on shapes
     * @shortname scales 3d
     * @drawable true
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
     * Mirrors the shapes with multiple mirrors
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname mirrors
     * @drawable true
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
     * Mirrors the shapes along the normal and origin
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname mirrors normal
     * @drawable true
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
     * Scales the shape uniformly about an arbitrary center point
     * @param inputs Scale factor, center and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname scale from center
     * @drawable true
     */
    scaleFromCenter(inputs: Inputs.OCCT.ScaleFromCenterDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scaleFromCenter(inputs);
    }

    /**
     * Mirrors (point-inverts) the shape about a point
     * @param inputs Mirror point and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror about point
     * @drawable true
     */
    mirrorAboutPoint(inputs: Inputs.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAboutPoint(inputs);
    }

    /**
     * Rotates the shape by a quaternion [x, y, z, w]
     * @param inputs Quaternion and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate by quaternion
     * @drawable true
     */
    rotateByQuaternion(inputs: Inputs.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotateByQuaternion(inputs);
    }

    /**
     * Applies an arbitrary 4x4 matrix (column-major) - or an ordered list of matrices
     * applied first-to-last - to a shape
     * @param inputs Transformation matrix (or list) and shape
     * @returns OpenCascade shape
     * @group by matrix
     * @shortname transform by matrix
     * @drawable true
     */
    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.transformByMatrix(inputs);
    }

    /**
     * Applies the same matrix (or ordered list) to multiple shapes
     * @param inputs Transformation matrix (or list) and shapes
     * @returns OpenCascade shapes
     * @group by matrix
     * @shortname transform shapes by matrix
     * @drawable true
     */
    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.transformsService.transformShapesByMatrix(inputs);
    }

    /**
     * Reads a shape's current placement (location) transform as a decomposed transform
     * @param inputs Shape to read
     * @returns Decomposed transform (matrix, translation, quaternion, scale)
     * @group by matrix
     * @shortname get shape transform
     * @drawable false
     */
    getShapeTransform(inputs: Inputs.OCCT.ShapeTransformQueryDto<TopoDS_Shape>): Inputs.OCCT.ShapeTransformInfo {
        return this.och.transformsService.getShapeTransform(inputs);
    }

    /**
     * Builds an identity transformation matrix
     * @returns Column-major 4x4 identity matrix
     * @group matrix builders
     * @shortname identity matrix
     * @drawable false
     */
    identityTransform(): Base.TransformMatrix {
        return this.och.transformsService.identityTransform();
    }

    /**
     * Composes a matrix from translation, Euler rotation (degrees) and uniform scale
     * (matches the T * R * S placement used by assembly nodes)
     * @param inputs Translation, rotation and scale
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname compose transform
     * @drawable false
     */
    composeTransform(inputs: Inputs.OCCT.ComposeTransformDto): Base.TransformMatrix {
        return this.och.transformsService.composeTransform(inputs);
    }

    /**
     * Folds a matrix or an ordered list of matrices (applied first-to-last) into one matrix
     * @param inputs Matrix or list of matrices
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname multiply transforms
     * @drawable false
     */
    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Base.TransformMatrix {
        return this.och.transformsService.multiplyTransforms(inputs);
    }

    /**
     * Inverts a transformation matrix
     * @param inputs Matrix to invert
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname invert transform
     * @drawable false
     */
    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Base.TransformMatrix {
        return this.och.transformsService.invertTransform(inputs);
    }

    /**
     * Builds a translation matrix
     * @param inputs Translation
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname translation to matrix
     * @drawable false
     */
    translationToMatrix(inputs: Inputs.OCCT.TranslationToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.translationToMatrix(inputs);
    }

    /**
     * Builds a rotation matrix from an axis (through an optional center) and angle in degrees
     * @param inputs Axis, angle and optional center
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname rotation axis angle to matrix
     * @drawable false
     */
    rotationAxisAngleToMatrix(inputs: Inputs.OCCT.RotationAxisAngleToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.rotationAxisAngleToMatrix(inputs);
    }

    /**
     * Builds a uniform-scale matrix about an optional center point
     * @param inputs Factor and optional center
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname scale uniform to matrix
     * @drawable false
     */
    scaleUniformToMatrix(inputs: Inputs.OCCT.ScaleUniformToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.scaleUniformToMatrix(inputs);
    }

    /**
     * Builds a mirror (point inversion) matrix about a point
     * @param inputs Point
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror point to matrix
     * @drawable false
     */
    mirrorPointToMatrix(inputs: Inputs.OCCT.MirrorPointToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPointToMatrix(inputs);
    }

    /**
     * Builds a mirror matrix about an axis
     * @param inputs Axis origin and direction
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror axis to matrix
     * @drawable false
     */
    mirrorAxisToMatrix(inputs: Inputs.OCCT.MirrorAxisToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorAxisToMatrix(inputs);
    }

    /**
     * Builds a mirror matrix about a plane (origin + normal)
     * @param inputs Plane origin and normal
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror plane to matrix
     * @drawable false
     */
    mirrorPlaneToMatrix(inputs: Inputs.OCCT.MirrorPlaneToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPlaneToMatrix(inputs);
    }

    /**
     * Builds a rotation matrix from a quaternion [x, y, z, w]
     * @param inputs Quaternion
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname quaternion to matrix
     * @drawable false
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
