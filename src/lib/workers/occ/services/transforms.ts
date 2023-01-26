import { OpenCascadeInstance, TopoDS_Shape } from '../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';
import { Base } from '../../../api/inputs/inputs';

export class OCCTTransforms {

    constructor(
        private readonly occ: OpenCascadeInstance,
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
        return this.och.rotate(inputs);
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>): TopoDS_Shape{
        return this.och.align(inputs);
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape{
        return this.och.translate(inputs);
    }

    scale(inputs: Inputs.OCCT.ScaleDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf_1();
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        transformation.SetScale(gpPnt, inputs.factor);
        const scaling = new this.occ.TopLoc_Location_2(transformation);
        const moved = inputs.shape.Moved(scaling, false);
        const result = this.och.getActualTypeOfShape(moved);
        gpPnt.delete();
        transformation.delete();
        scaling.delete();
        moved.delete();
        return result;
    }

    scale3d(inputs: Inputs.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeTranslated = this.translate({ shape: inputs.shape, translation: inputs.center.map(c => -c) as Base.Vector3 });
        const transformation = new this.occ.gp_GTrsf_1();
        const scale = inputs.scale;
        const mat = new this.occ.gp_Mat_2(scale[0], 0, 0, 0, scale[1], 0, 0, 0, scale[2]);
        transformation.SetVectorialPart(mat);
        let result;
        try {
            const gtrans = new this.occ.BRepBuilderAPI_GTransform_2(shapeTranslated as TopoDS_Shape, transformation, false);
            const messageProps = new this.occ.Message_ProgressRange_1();
            gtrans.Build(messageProps);
            const scaledShape = gtrans.Shape();
            result = this.translate({ shape: scaledShape, translation: inputs.center });
            gtrans.delete();
            scaledShape.delete();
            messageProps.delete();
        } catch (ex) {
            throw new Error('Could not scale the shape')
        }
        shapeTranslated.delete();
        transformation.delete();
        mat.delete();
        return result;
    }


    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.mirror(inputs);
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.mirrorAlongNormal(inputs);
    }

    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.translations, inputs.rotationAxes, inputs.rotationAngles, inputs.scaleFactors]);
        return inputs.shapes.map((s, index) => this.transform({
            shape: s,
            translation: inputs.translations[index],
            rotationAxis: inputs.rotationAxes[index],
            rotationAngle: inputs.rotationAngles[index],
            scaleFactor: inputs.scaleFactors[index],
        }));
    }

    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.axes, inputs.angles]);
        return inputs.shapes.map((s, index) => this.rotate({
            shape: s,
            axis: inputs.axes[index],
            angle: inputs.angles[index],
        }));
    }

    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.fromOrigins, inputs.fromDirections, inputs.toOrigins, inputs.toDirections]);
        return inputs.shapes.map((s, index) => this.align({
            shape: s,
            fromOrigin: inputs.fromOrigins[index],
            fromDirection: inputs.fromDirections[index],
            toOrigin: inputs.toOrigins[index],
            toDirection: inputs.toDirections[index]
        }));
    }

    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.translations]);
        return inputs.shapes.map((s, index) => this.translate({
            shape: s,
            translation: inputs.translations[index],
        }));
    }

    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.factors]);
        return inputs.shapes.map((s, index) => this.scale({
            shape: s,
            factor: inputs.factors[index],
        }));
    }

    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.scales, inputs.centers]);
        return inputs.shapes.map((s, index) => this.scale3d({
            shape: s,
            scale: inputs.scales[index],
            center: inputs.centers[index],
        }));
    }


    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.directions, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirror({
            shape: s,
            origin: inputs.origins[index],
            direction: inputs.directions[index],
        }));
    }

    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        this.checkIfListsEqualLength([inputs.shapes, inputs.normals, inputs.origins]);
        return inputs.shapes.map((s, index) => this.mirrorAlongNormal({
            shape: s,
            normal: inputs.normals[index],
            origin: inputs.origins[index],
        }));
    }

    checkIfListsEqualLength(lists: any[][]) {
        const firstLength = lists[0].length;
        const notSameLength = lists.some(s => s.length !== firstLength);
        if (notSameLength) {
            throw new Error('Some of the list lengths are not the same. For this operation to work all lists need to be of equal length');
        }
    }
}
