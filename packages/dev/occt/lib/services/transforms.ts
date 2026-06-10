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

    transform(inputs: Inputs.OCCT.TransformDto<TopoDS_Shape>): TopoDS_Shape {
        const scaledShape = this.scale({ shape: inputs.shape, factor: inputs.scaleFactor });
        const rotatedShape = this.rotate({ shape: scaledShape, axis: inputs.rotationAxis, angle: inputs.rotationAngle });
        const translatedShape = this.translate({ shape: rotatedShape, translation: inputs.translation });
        scaledShape.delete();
        rotatedShape.delete();
        return translatedShape;
    }

    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotate(inputs);
    }

    rotateAroundCenter(inputs: Inputs.OCCT.RotateAroundCenterDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeTranslated = this.translate({ shape: inputs.shape, translation: inputs.center.map(c => -c) as Base.Vector3 });
        const angle = inputs.angle;
        const rotatedShape = this.rotate({ shape: shapeTranslated, axis: inputs.axis, angle });
        const result = this.translate({ shape: rotatedShape, translation: inputs.center });
        rotatedShape.delete();
        shapeTranslated.delete();
        return result;
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.align(inputs);
    }

    alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignNormAndAxis(inputs);
    }

    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.alignAndTranslate(inputs);
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.translate(inputs);
    }

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

    scale3d(inputs: Inputs.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scale3d(inputs); 
    }


    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirror(inputs);
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAlongNormal(inputs);
    }

    scaleFromCenter(inputs: Inputs.OCCT.ScaleFromCenterDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.scaleFromCenter(inputs);
    }

    mirrorAboutPoint(inputs: Inputs.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.mirrorAboutPoint(inputs);
    }

    rotateByQuaternion(inputs: Inputs.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.rotateByQuaternion(inputs);
    }

    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.transformsService.transformByMatrix(inputs);
    }

    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.transformsService.transformShapesByMatrix(inputs);
    }

    getShapeTransform(inputs: Inputs.OCCT.ShapeTransformQueryDto<TopoDS_Shape>): Inputs.OCCT.ShapeTransformInfo {
        return this.och.transformsService.getShapeTransform(inputs);
    }

    identityTransform(): Base.TransformMatrix {
        return this.och.transformsService.identityTransform();
    }

    composeTransform(inputs: Inputs.OCCT.ComposeTransformDto): Base.TransformMatrix {
        return this.och.transformsService.composeTransform(inputs);
    }

    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Base.TransformMatrix {
        return this.och.transformsService.multiplyTransforms(inputs);
    }

    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Base.TransformMatrix {
        return this.och.transformsService.invertTransform(inputs);
    }

    translationToMatrix(inputs: Inputs.OCCT.TranslationToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.translationToMatrix(inputs);
    }

    rotationAxisAngleToMatrix(inputs: Inputs.OCCT.RotationAxisAngleToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.rotationAxisAngleToMatrix(inputs);
    }

    scaleUniformToMatrix(inputs: Inputs.OCCT.ScaleUniformToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.scaleUniformToMatrix(inputs);
    }

    mirrorPointToMatrix(inputs: Inputs.OCCT.MirrorPointToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPointToMatrix(inputs);
    }

    mirrorAxisToMatrix(inputs: Inputs.OCCT.MirrorAxisToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorAxisToMatrix(inputs);
    }

    mirrorPlaneToMatrix(inputs: Inputs.OCCT.MirrorPlaneToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.mirrorPlaneToMatrix(inputs);
    }

    quaternionToMatrix(inputs: Inputs.OCCT.QuaternionToMatrixDto): Base.TransformMatrix {
        return this.och.transformsService.quaternionToMatrix(inputs);
    }

    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.translations, inputs.rotationAxes, inputs.rotationAngles, inputs.scaleFactors]);
        return inputs.shapes.map((s, index) => this.transform({
            shape: s,
            translation: inputs.translations[index],
            rotationAxis: inputs.rotationAxes[index],
            rotationAngle: inputs.rotationAngles[index],
            scaleFactor: inputs.scaleFactors[index],
        }));
    }

    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.axes, inputs.angles]);
        return inputs.shapes.map((s, index) => this.rotate({
            shape: s,
            axis: inputs.axes[index],
            angle: inputs.angles[index],
        }));
    }

    rotateAroundCenterShapes(inputs: Inputs.OCCT.RotateAroundCenterShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | number>([inputs.shapes, inputs.axes, inputs.angles]);
        return inputs.shapes.map((s, index) => this.rotateAroundCenter({
            shape: s,
            axis: inputs.axes[index],
            angle: inputs.angles[index],
            center: inputs.centers[index],
        }));
    }

    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Point3 | Base.Vector3>([inputs.shapes, inputs.fromOrigins, inputs.fromDirections, inputs.toOrigins, inputs.toDirections]);
        return inputs.shapes.map((s, index) => this.align({
            shape: s,
            fromOrigin: inputs.fromOrigins[index],
            fromDirection: inputs.fromDirections[index],
            toOrigin: inputs.toOrigins[index],
            toDirection: inputs.toDirections[index]
        }));
    }

    alignAndTranslateShapes(inputs: Inputs.OCCT.AlignAndTranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3>([inputs.shapes, inputs.centers, inputs.directions]);
        return inputs.shapes.map((s, index) => this.alignAndTranslate({
            shape: s,
            center: inputs.centers[index],
            direction: inputs.directions[index],
        }));
    }

    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3>([inputs.shapes, inputs.translations]);
        return inputs.shapes.map((s, index) => this.translate({
            shape: s,
            translation: inputs.translations[index],
        }));
    }

    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | number>([inputs.shapes, inputs.factors]);
        return inputs.shapes.map((s, index) => this.scale({
            shape: s,
            factor: inputs.factors[index],
        }));
    }

    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.scales, inputs.centers]);
        return inputs.shapes.map((s, index) => this.scale3d({
            shape: s,
            scale: inputs.scales[index],
            center: inputs.centers[index],
        }));
    }


    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.directions, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirror({
            shape: s,
            origin: inputs.origins[index],
            direction: inputs.directions[index],
        }));
    }

    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength<TopoDS_Shape | Base.Vector3 | Base.Point3>([inputs.shapes, inputs.normals, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirrorAlongNormal({
            shape: s,
            normal: inputs.normals[index],
            origin: inputs.origins[index],
        }));
    }

    private checkIfListsEqualLength<T>(lists: T[][]) {
        const firstLength = lists[0].length;
        const notSameLength = lists.some(s => s.length !== firstLength);
        if (notSameLength) {
            throw new Error("Some of the list lengths are not the same. For this operation to work all lists need to be of equal length");
        }
    }
}
