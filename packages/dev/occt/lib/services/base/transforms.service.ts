import { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
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

    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        const matrix = this.foldTransformations(inputs.transformation);
        const gtrsf = this.matrixToGTrsf(matrix);
        let shp: TopoDS_Shape;
        try {
            const gtrans = new this.occ.BRepBuilderAPI_GTransform(inputs.shape, gtrsf);
            const s = gtrans.Shape();
            shp = this.converterService.getActualTypeOfShape(s);
            s.delete();
            gtrans.delete();
        } catch (ex) {
            gtrsf.delete();
            throw new Error("Could not apply the transformation matrix to the shape.");
        }
        gtrsf.delete();
        return shp;
    }

    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => this.transformByMatrix({ shape, transformation: inputs.transformation }));
    }

    getShapeTransform(inputs: Inputs.OCCT.ShapeTransformQueryDto<TopoDS_Shape>): Inputs.OCCT.ShapeTransformInfo {
        const location = inputs.shape.Location();
        const trsf = location.Transformation();
        const matrix = this.trsfToMatrix(trsf);
        const scale = trsf.ScaleFactor();
        const translation: Inputs.Base.Point3 = [matrix[12], matrix[13], matrix[14]];
        const quaternion = this.quaternionFromMatrix(matrix, scale);
        trsf.delete();
        location.delete();
        return { matrix, translation, quaternion, scale };
    }

    scaleFromCenter(inputs: Inputs.OCCT.ScaleFromCenterDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const center = this.entitiesService.gpPnt(inputs.center);
        transformation.SetScale(center, inputs.factor);
        const shp = this.applyTrsf(inputs.shape, transformation);
        center.delete();
        transformation.delete();
        return shp;
    }

    mirrorAboutPoint(inputs: Inputs.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const pnt = this.entitiesService.gpPnt(inputs.point);
        transformation.SetMirror(pnt);
        const shp = this.applyTrsf(inputs.shape, transformation);
        pnt.delete();
        transformation.delete();
        return shp;
    }

    rotateByQuaternion(inputs: Inputs.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        const matrix = this.quaternionToMatrix({ quaternion: inputs.quaternion });
        const transformation = this.matrixToTrsf(matrix);
        const shp = this.applyTrsf(inputs.shape, transformation);
        transformation.delete();
        return shp;
    }

    identityTransform(): Inputs.Base.TransformMatrix {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }

    composeTransform(inputs: Inputs.OCCT.ComposeTransformDto): Inputs.Base.TransformMatrix {
        const scale = inputs.scale ?? 1;
        const rotation = inputs.rotation ?? [0, 0, 0];
        const translation = inputs.translation ?? [0, 0, 0];

        const s = new this.occ.gp_Trsf();
        const origin = this.entitiesService.gpPnt([0, 0, 0]);
        s.SetScale(origin, scale);

        const rot = this.eulerXyzToTrsf(rotation);
        const t = new this.occ.gp_Trsf();
        const vec = new this.occ.gp_Vec(translation[0], translation[1], translation[2]);
        t.SetTranslation(vec);

        const rs = rot.Multiplied(s);          // R * S
        const trs = t.Multiplied(rs);           // T * R * S
        const matrix = this.trsfToMatrix(trs);

        origin.delete();
        vec.delete();
        s.delete();
        rot.delete();
        t.delete();
        rs.delete();
        trs.delete();
        return matrix;
    }

    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Inputs.Base.TransformMatrix {
        return this.foldTransformations(inputs.transformation);
    }

    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Inputs.Base.TransformMatrix {
        const gtrsf = this.matrixToGTrsf(inputs.transformation);
        const inverted = gtrsf.Inverted();
        const matrix = this.gtrsfToMatrix(inverted);
        gtrsf.delete();
        inverted.delete();
        return matrix;
    }

    translationToMatrix(inputs: Inputs.OCCT.TranslationToMatrixDto): Inputs.Base.TransformMatrix {
        return this.composeTransform(new Inputs.OCCT.ComposeTransformDto(inputs.translation));
    }

    rotationAxisAngleToMatrix(inputs: Inputs.OCCT.RotationAxisAngleToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx1(inputs.center ?? [0, 0, 0], inputs.axis);
        transformation.SetRotation(ax1, this.vecHelper.degToRad(inputs.angle));
        const matrix = this.trsfToMatrix(transformation);
        ax1.delete();
        transformation.delete();
        return matrix;
    }

    scaleUniformToMatrix(inputs: Inputs.OCCT.ScaleUniformToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const center = this.entitiesService.gpPnt(inputs.center ?? [0, 0, 0]);
        transformation.SetScale(center, inputs.factor);
        const matrix = this.trsfToMatrix(transformation);
        center.delete();
        transformation.delete();
        return matrix;
    }

    mirrorPointToMatrix(inputs: Inputs.OCCT.MirrorPointToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const pnt = this.entitiesService.gpPnt(inputs.point);
        transformation.SetMirror(pnt);
        const matrix = this.trsfToMatrix(transformation);
        pnt.delete();
        transformation.delete();
        return matrix;
    }

    mirrorAxisToMatrix(inputs: Inputs.OCCT.MirrorAxisToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirrorAx1(ax1);
        const matrix = this.trsfToMatrix(transformation);
        ax1.delete();
        transformation.delete();
        return matrix;
    }

    mirrorPlaneToMatrix(inputs: Inputs.OCCT.MirrorPlaneToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax2 = this.entitiesService.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirrorOnPlane(ax2);
        const matrix = this.trsfToMatrix(transformation);
        ax2.delete();
        transformation.delete();
        return matrix;
    }

    quaternionToMatrix(inputs: Inputs.OCCT.QuaternionToMatrixDto): Inputs.Base.TransformMatrix {
        const [qx, qy, qz, qw] = inputs.quaternion;
        const len = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw) || 1;
        const x = qx / len, y = qy / len, z = qz / len, w = qw / len;
        const xx = x * x, yy = y * y, zz = z * z;
        const xy = x * y, xz = x * z, yz = y * z;
        const wx = w * x, wy = w * y, wz = w * z;
        // column-major, p' = M * p
        return [
            1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy), 0,
            2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx), 0,
            2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy), 0,
            0, 0, 0, 1,
        ];
    }

    foldToRowMajor12(transformation: Inputs.Base.TransformMatrix | Inputs.Base.TransformMatrixes): number[] {
        const m = this.foldTransformations(transformation);
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
        ];
    }

    private applyTrsf(shape: TopoDS_Shape, transformation): TopoDS_Shape {
        const transf = new this.occ.BRepBuilderAPI_Transform(shape, transformation, true);
        const s = transf.Shape();
        const shp = this.converterService.getActualTypeOfShape(s);
        s.delete();
        transf.delete();
        return shp;
    }

    private eulerXyzToTrsf(rotation: Inputs.Base.Vector3) {
        const make = (axis: Inputs.Base.Vector3, angleDeg: number) => {
            const t = new this.occ.gp_Trsf();
            const ax1 = this.entitiesService.gpAx1([0, 0, 0], axis);
            t.SetRotation(ax1, this.vecHelper.degToRad(angleDeg));
            ax1.delete();
            return t;
        };
        const rx = make([1, 0, 0], rotation[0]);
        const ry = make([0, 1, 0], rotation[1]);
        const rz = make([0, 0, 1], rotation[2]);
        const ryz = ry.Multiplied(rz);     // Ry * Rz
        const rxyz = rx.Multiplied(ryz);   // Rx * Ry * Rz
        rx.delete();
        ry.delete();
        rz.delete();
        ryz.delete();
        return rxyz;
    }

    private trsfToMatrix(trsf): Inputs.Base.TransformMatrix {
        return [
            trsf.Value(1, 1), trsf.Value(2, 1), trsf.Value(3, 1), 0,
            trsf.Value(1, 2), trsf.Value(2, 2), trsf.Value(3, 2), 0,
            trsf.Value(1, 3), trsf.Value(2, 3), trsf.Value(3, 3), 0,
            trsf.Value(1, 4), trsf.Value(2, 4), trsf.Value(3, 4), 1,
        ];
    }

    private gtrsfToMatrix(gtrsf): Inputs.Base.TransformMatrix {
        return [
            gtrsf.Value(1, 1), gtrsf.Value(2, 1), gtrsf.Value(3, 1), 0,
            gtrsf.Value(1, 2), gtrsf.Value(2, 2), gtrsf.Value(3, 2), 0,
            gtrsf.Value(1, 3), gtrsf.Value(2, 3), gtrsf.Value(3, 3), 0,
            gtrsf.Value(1, 4), gtrsf.Value(2, 4), gtrsf.Value(3, 4), 1,
        ];
    }

    private matrixToTrsf(m: Inputs.Base.TransformMatrix) {
        const t = new this.occ.gp_Trsf();
        t.SetValues(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
        );
        return t;
    }

    private matrixToGTrsf(m: Inputs.Base.TransformMatrix) {
        const g = new this.occ.gp_GTrsf();
        g.SetValue(1, 1, m[0]); g.SetValue(2, 1, m[1]); g.SetValue(3, 1, m[2]);
        g.SetValue(1, 2, m[4]); g.SetValue(2, 2, m[5]); g.SetValue(3, 2, m[6]);
        g.SetValue(1, 3, m[8]); g.SetValue(2, 3, m[9]); g.SetValue(3, 3, m[10]);
        g.SetValue(1, 4, m[12]); g.SetValue(2, 4, m[13]); g.SetValue(3, 4, m[14]);
        return g;
    }

    private foldTransformations(transformation: Inputs.Base.TransformMatrix | Inputs.Base.TransformMatrixes): Inputs.Base.TransformMatrix {
        const list: Inputs.Base.TransformMatrixes = Array.isArray(transformation[0])
            ? transformation as Inputs.Base.TransformMatrixes
            : [transformation as Inputs.Base.TransformMatrix];
        if (list.length === 0) {
            return this.identityTransform();
        }
        let acc = list[0];
        for (let i = 1; i < list.length; i++) {
            acc = this.multiplyMatricesColumnMajor(list[i], acc); // apply acc first, then list[i]
        }
        return acc;
    }

    private multiplyMatricesColumnMajor(a: Inputs.Base.TransformMatrix, b: Inputs.Base.TransformMatrix): Inputs.Base.TransformMatrix {
        const result = new Array(16).fill(0) as unknown as Inputs.Base.TransformMatrix;
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row] * b[col * 4 + k];
                }
                result[col * 4 + row] = sum;
            }
        }
        return result;
    }

    private quaternionFromMatrix(m: Inputs.Base.TransformMatrix, scale: number): [number, number, number, number] {
        const s = scale === 0 ? 1 : scale;
        const r00 = m[0] / s, r10 = m[1] / s, r20 = m[2] / s;
        const r01 = m[4] / s, r11 = m[5] / s, r21 = m[6] / s;
        const r02 = m[8] / s, r12 = m[9] / s, r22 = m[10] / s;
        const trace = r00 + r11 + r22;
        let qx: number, qy: number, qz: number, qw: number;
        if (trace > 0) {
            const f = 0.5 / Math.sqrt(trace + 1.0);
            qw = 0.25 / f;
            qx = (r21 - r12) * f;
            qy = (r02 - r20) * f;
            qz = (r10 - r01) * f;
        } else if (r00 > r11 && r00 > r22) {
            const f = 2.0 * Math.sqrt(1.0 + r00 - r11 - r22);
            qw = (r21 - r12) / f;
            qx = 0.25 * f;
            qy = (r01 + r10) / f;
            qz = (r02 + r20) / f;
        } else if (r11 > r22) {
            const f = 2.0 * Math.sqrt(1.0 + r11 - r00 - r22);
            qw = (r02 - r20) / f;
            qx = (r01 + r10) / f;
            qy = 0.25 * f;
            qz = (r12 + r21) / f;
        } else {
            const f = 2.0 * Math.sqrt(1.0 + r22 - r00 - r11);
            qw = (r10 - r01) / f;
            qx = (r02 + r20) / f;
            qy = (r12 + r21) / f;
            qz = 0.25 * f;
        }
        return [qx, qy, qz, qw];
    }

}
