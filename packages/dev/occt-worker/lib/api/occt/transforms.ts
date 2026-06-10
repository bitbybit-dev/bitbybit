
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { Inputs } from "@bitbybit-dev/occt";

export class OCCTTransforms {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
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
    transform(inputs: Inputs.OCCT.TransformDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.transform", inputs);
    }

    /**
     * Rotate the shape
     * @param inputs Rotation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate
     * @drawable true
     */
    rotate(inputs: Inputs.OCCT.RotateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotate", inputs);
    }

    /**
     * Rotate the shape around the provided center
     * @param inputs Rotation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate around center
     * @drawable true
     */
    rotateAroundCenter(inputs: Inputs.OCCT.RotateAroundCenterDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotateAroundCenter", inputs);
    }

    /**
     * Align the shape
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align
     * @drawable true
     */
    align(inputs: Inputs.OCCT.AlignDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.align", inputs);
    }

    /**
     * Align the shape with normal and axis
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align normal and axis
     * @drawable true
     */
    alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.alignNormAndAxis", inputs);
    }

    /**
     * Align and translates the shape
     * @param inputs Align description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname align and translate
     * @drawable true
     */
    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.alignAndTranslate", inputs);
    }

    /**
     * Translates the shape
     * @param inputs Translation description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname translate
     * @drawable true
     */
    translate(inputs: Inputs.OCCT.TranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.translate", inputs);
    }

    /**
     * Scales the shape
     * @param inputs Scale description
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname scale
     * @drawable true
     */
    scale(inputs: Inputs.OCCT.ScaleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scale", inputs);
    }

    /**
     * Scales the shape in 3D
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     * @group on single shape
     * @shortname scale 3d
     * @drawable true
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scale3d", inputs);
    }

    /**
     * Mirrors the shape
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror
     * @drawable true
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirror", inputs);
    }

    /**
     * Mirrors the shape along the normal and origin
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror normal
     * @drawable true
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorAlongNormal", inputs);
    }

    /**
     * Transforms the array of shapes with transformations
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname transforms
     * @drawable true
     */
    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.transformShapes", inputs);
    }

    /**
     * Rotate the shapes with rotations
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname rotations
     * @drawable true
     */
    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotateShapes", inputs);
    }

    /**
     * Rotate the shapes around the center and an axis
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname rotations around center
     * @drawable true
     */
    rotateAroundCenterShapes(inputs: Inputs.OCCT.RotateAroundCenterShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotateAroundCenterShapes", inputs);
    }

    /**
     * Align the shapes with alignments
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname alignments
     * @drawable true
     */
    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.alignShapes", inputs);
    }

    /**
     * Align and translate the shapes
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname align and translate
     * @drawable true
     */
    alignAndTranslateShapes(inputs: Inputs.OCCT.AlignAndTranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.alignAndTranslateShapes", inputs);
    }

    /**
     * Translates the shapes with translations
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname translations
     * @drawable true
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.translateShapes", inputs);
    }

    /**
     * Scales the shapes with scale factors
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname scales
     * @drawable true
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scaleShapes", inputs);
    }

    /**
     * Scales the shape in 3D
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     * @group on shapes
     * @shortname scales 3d
     * @drawable true
     */
    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scale3dShapes", inputs);
    }

    /**
     * Mirrors the shapes with multiple mirrors
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname mirrors
     * @drawable true
     */
    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorShapes", inputs);
    }

    /**
     * Mirrors the shapes along the normal and origin
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     * @group on shapes
     * @shortname mirrors normal
     * @drawable true
     */
    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorAlongNormalShapes", inputs);
    }

    /**
     * Scales the shape uniformly about an arbitrary center point
     * @param inputs Scale factor, center and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname scale from center
     * @drawable true
     */
    scaleFromCenter(inputs: Inputs.OCCT.ScaleFromCenterDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scaleFromCenter", inputs);
    }

    /**
     * Mirrors (point-inverts) the shape about a point
     * @param inputs Mirror point and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname mirror about point
     * @drawable true
     */
    mirrorAboutPoint(inputs: Inputs.OCCT.MirrorAboutPointDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorAboutPoint", inputs);
    }

    /**
     * Rotates the shape by a quaternion [x, y, z, w]
     * @param inputs Quaternion and shape
     * @returns OpenCascade shape
     * @group on single shape
     * @shortname rotate by quaternion
     * @drawable true
     */
    rotateByQuaternion(inputs: Inputs.OCCT.RotateByQuaternionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotateByQuaternion", inputs);
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
    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.transformByMatrix", inputs);
    }

    /**
     * Applies the same matrix (or ordered list) to multiple shapes
     * @param inputs Transformation matrix (or list) and shapes
     * @returns OpenCascade shapes
     * @group by matrix
     * @shortname transform shapes by matrix
     * @drawable true
     */
    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.transformShapesByMatrix", inputs);
    }

    /**
     * Reads a shape's current placement (location) transform as a decomposed transform
     * @param inputs Shape to read
     * @returns Decomposed transform (matrix, translation, quaternion, scale)
     * @group by matrix
     * @shortname get shape transform
     * @drawable false
     */
    getShapeTransform(inputs: Inputs.OCCT.ShapeTransformQueryDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.ShapeTransformInfo> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.getShapeTransform", inputs);
    }

    /**
     * Builds an identity transformation matrix
     * @returns Column-major 4x4 identity matrix
     * @group matrix builders
     * @shortname identity matrix
     * @drawable false
     */
    identityTransform(): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.identityTransform", {});
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
    composeTransform(inputs: Inputs.OCCT.ComposeTransformDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.composeTransform", inputs);
    }

    /**
     * Folds a matrix or an ordered list of matrices (applied first-to-last) into one matrix
     * @param inputs Matrix or list of matrices
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname multiply transforms
     * @drawable false
     */
    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.multiplyTransforms", inputs);
    }

    /**
     * Inverts a transformation matrix
     * @param inputs Matrix to invert
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname invert transform
     * @drawable false
     */
    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.invertTransform", inputs);
    }

    /**
     * Builds a translation matrix
     * @param inputs Translation
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname translation to matrix
     * @drawable false
     */
    translationToMatrix(inputs: Inputs.OCCT.TranslationToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.translationToMatrix", inputs);
    }

    /**
     * Builds a rotation matrix from an axis (through an optional center) and angle in degrees
     * @param inputs Axis, angle and optional center
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname rotation axis angle to matrix
     * @drawable false
     */
    rotationAxisAngleToMatrix(inputs: Inputs.OCCT.RotationAxisAngleToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.rotationAxisAngleToMatrix", inputs);
    }

    /**
     * Builds a uniform-scale matrix about an optional center point
     * @param inputs Factor and optional center
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname scale uniform to matrix
     * @drawable false
     */
    scaleUniformToMatrix(inputs: Inputs.OCCT.ScaleUniformToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.scaleUniformToMatrix", inputs);
    }

    /**
     * Builds a mirror (point inversion) matrix about a point
     * @param inputs Point
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror point to matrix
     * @drawable false
     */
    mirrorPointToMatrix(inputs: Inputs.OCCT.MirrorPointToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorPointToMatrix", inputs);
    }

    /**
     * Builds a mirror matrix about an axis
     * @param inputs Axis origin and direction
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror axis to matrix
     * @drawable false
     */
    mirrorAxisToMatrix(inputs: Inputs.OCCT.MirrorAxisToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorAxisToMatrix", inputs);
    }

    /**
     * Builds a mirror matrix about a plane (origin + normal)
     * @param inputs Plane origin and normal
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname mirror plane to matrix
     * @drawable false
     */
    mirrorPlaneToMatrix(inputs: Inputs.OCCT.MirrorPlaneToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.mirrorPlaneToMatrix", inputs);
    }

    /**
     * Builds a rotation matrix from a quaternion [x, y, z, w]
     * @param inputs Quaternion
     * @returns Column-major 4x4 matrix
     * @group matrix builders
     * @shortname quaternion to matrix
     * @drawable false
     */
    quaternionToMatrix(inputs: Inputs.OCCT.QuaternionToMatrixDto): Promise<Inputs.Base.TransformMatrix> {
        return this.occWorkerManager.genericCallToWorkerPromise("transforms.quaternionToMatrix", inputs);
    }
}
