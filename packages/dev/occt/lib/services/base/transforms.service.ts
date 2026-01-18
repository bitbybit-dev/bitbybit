import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";

export class TransformsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly vecHelper: VectorHelperService
    ) { }

    alignAndTranslate(inputs: Inputs.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        const alignedShape = this.align(
            {
                shape: inputs.shape,
                fromOrigin: [0, 0, 0],
                fromDirection: [0, 1, 0],
                toOrigin: [0, 0, 0],
                toDirection: inputs.direction
            }
        );
        const translated = this.translate(
            {
                shape: alignedShape,
                translation: inputs.center
            }
        );
        alignedShape.delete();
        return translated;
    }

    scale3d(inputs: Inputs.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        const shapeTranslated = this.translate({ shape: inputs.shape, translation: inputs.center.map(c => -c) as Inputs.Base.Vector3 });
        const transformation = new this.occ.gp_GTrsf();
        const scale = inputs.scale;
        const mat = new this.occ.gp_Mat(scale[0], 0.0, 0.0, 0.0, scale[1], 0.0, 0.0, 0.0, scale[2]);
        transformation.SetVectorialPart(mat);
        let result;
        try {
            const gtrans = new this.occ.BRepBuilderAPI_GTransform(shapeTranslated as TopoDS_Shape, transformation);
            const scaledShape = gtrans.Shape();
            result = this.translate({ shape: scaledShape, translation: inputs.center });
            gtrans.delete();
            scaledShape.delete();
        } catch (ex) {
            throw new Error("Could not scale the shape");
        }
        shapeTranslated.delete();
        transformation.delete();
        mat.delete();
        return result;
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf();
        const gpVec = new this.occ.gp_Vec(inputs.translation[0], inputs.translation[1], inputs.translation[2]);
        transformation.SetTranslation(gpVec);
        const transf = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
        const s = transf.Shape();
        const shp = this.converterService.getActualTypeOfShape(s);
        s.delete();
        transformation.delete();
        transf.delete();
        gpVec.delete();
        return shp;
    }

    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirrorAx1(ax1);
        const transformed = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.converterService.getActualTypeOfShape(transformedShape);

        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        ax1.delete();

        return shp;
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf();
        const ax = this.entitiesService.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirrorOnPlane(ax);
        const transformed = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.converterService.getActualTypeOfShape(transformedShape);
        ax.delete();
        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        return shp;
    }

    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>) {
        let rotated;
        if (inputs.angle === 0) {
            rotated = inputs.shape;
        } else {
            const transformation = new this.occ.gp_Trsf();
            const gpVec = new this.occ.gp_Vec(inputs.axis[0], inputs.axis[1], inputs.axis[2]);
            const dir = new this.occ.gp_Dir(inputs.axis[0], inputs.axis[1], inputs.axis[2]);
            const pt1 = new this.occ.gp_Pnt(0, 0, 0);
            const ax = new this.occ.gp_Ax1(pt1, dir);
            transformation.SetRotation(ax, this.vecHelper.degToRad(inputs.angle));
            const transf = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
            const s = transf.Shape();
            const shp = this.converterService.getActualTypeOfShape(s);
            s.delete();
            gpVec.delete();
            dir.delete();
            pt1.delete();
            ax.delete();
            transf.delete();
            transformation.delete();
            return shp;
        }
        const actualShape = this.converterService.getActualTypeOfShape(rotated);
        if (inputs.angle !== 0) {
            rotated.delete();
        }
        return actualShape;
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf();

        const ax1 = this.entitiesService.gpAx3_4(inputs.fromOrigin, inputs.fromDirection);
        const ax2 = this.entitiesService.gpAx3_4(inputs.toOrigin, inputs.toDirection);

        transformation.SetDisplacement(
            ax1,
            ax2,
        );
        const location = new this.occ.TopLoc_Location(transformation);
        const moved = inputs.shape.Moved(location);

        location.delete();
        transformation.delete();
        ax1.delete();
        ax2.delete();
        const shp = this.converterService.getActualTypeOfShape(moved);
        moved.delete();
        return shp;
    }

    alignNormAndAxis(inputs: Inputs.OCCT.AlignNormAndAxisDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx3_3(inputs.fromOrigin, inputs.fromNorm, inputs.fromAx);
        const ax2 = this.entitiesService.gpAx3_3(inputs.toOrigin, inputs.toNorm, inputs.toAx);

        transformation.SetDisplacement(
            ax1,
            ax2,
        );
        const location = new this.occ.TopLoc_Location(transformation);
        const moved = inputs.shape.Moved(location);

        location.delete();
        transformation.delete();
        ax1.delete();
        ax2.delete();
        const shp = this.converterService.getActualTypeOfShape(moved);
        moved.delete();
        return shp;
    }


}
