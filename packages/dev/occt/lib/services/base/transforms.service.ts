import type { BitbybitOcctModule, TopoDS_Shape, gp_Ax3, gp_Trsf, gp_GTrsf } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type { ConverterService } from "./converter.service";
import type { EntitiesService } from "./entities.service";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { checkedDirection, checkedShapes } from "./input-checks";
import { kernelObjects, release, releasedOnError } from "./release";
import { readKernelException } from "../../kernel-exception";
import { movedPoint } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IDENTITY_MATRIX } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices.constants";

const smallestScale = 1e-100;

export class TransformsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly base: BaseBitByBit
    ) { }

    alignAndTranslate(inputs: Resolved.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
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

    scale3d(inputs: Resolved.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        const [sx, sy, sz] = inputs.scale;
        if (this.isUsableScale(sx) && sx === sy && sx === sz) {
            return this.scaleFromCenter({ shape: inputs.shape, factor: sx, center: inputs.center });
        }
        const shapeTranslated = this.translate({ shape: inputs.shape, translation: inputs.center.map(c => -c) as Inputs.Base.Vector3 });
        const transformation = new this.occ.gp_GTrsf();
        const scale = inputs.scale;
        const mat = new this.occ.gp_Mat(scale[0], 0.0, 0.0, 0.0, scale[1], 0.0, 0.0, 0.0, scale[2]);
        transformation.SetVectorialPart(mat);
        try {
            const gtrans = new this.occ.BRepBuilderAPI_GTransform(shapeTranslated, transformation);
            try {
                const scaledShape = gtrans.Shape();
                try {
                    return this.translate({ shape: scaledShape, translation: inputs.center });
                } finally {
                    scaledShape.delete();
                }
            } finally {
                gtrans.delete();
            }
        } catch (ex) {
            throw new Error("Could not scale the shape", { cause: ex });
        } finally {
            [shapeTranslated, transformation, mat].forEach(release);
        }
    }

    translate(inputs: Resolved.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const gpVec = new this.occ.gp_Vec(inputs.translation[0], inputs.translation[1], inputs.translation[2]);
        transformation.SetTranslation(gpVec);
        const transf = new this.occ.BRepBuilderAPI_Transform(inputs.shape, transformation, true);
        const s = transf.Shape();
        const shp = this.converterService.castAndRelease(s);
        transformation.delete();
        transf.delete();
        gpVec.delete();
        return shp;
    }

    mirror(inputs: Resolved.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        const ax1 = this.entitiesService.gpAx1(inputs.origin, checkedDirection(inputs.direction, "direction"));
        const transformation = new this.occ.gp_Trsf();
        try {
            transformation.SetMirrorAx1(ax1);
            return this.applyTrsf(inputs.shape, transformation);
        } finally {
            transformation.delete();
            ax1.delete();
        }
    }

    mirrorAlongNormal(inputs: Resolved.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        const ax = this.entitiesService.gpAx2(inputs.origin, checkedDirection(inputs.normal, "normal"));
        const transformation = new this.occ.gp_Trsf();
        try {
            transformation.SetMirrorOnPlane(ax);
            return this.applyTrsf(inputs.shape, transformation);
        } finally {
            transformation.delete();
            ax.delete();
        }
    }

    rotate(inputs: Resolved.OCCT.RotateDto<TopoDS_Shape>): TopoDS_Shape {
        if (inputs.angle === 0) {
            return this.converterService.getActualTypeOfShape(inputs.shape);
        }
        const ax = this.entitiesService.gpAx1([0, 0, 0], checkedDirection(inputs.axis, "axis"));
        const transformation = new this.occ.gp_Trsf();
        try {
            transformation.SetRotation(ax, this.base.math.degToRad({ number: inputs.angle }));
            return this.applyTrsf(inputs.shape, transformation);
        } finally {
            transformation.delete();
            ax.delete();
        }
    }

    rotateAroundCenter(inputs: Resolved.OCCT.RotateAroundCenterDto<TopoDS_Shape>): TopoDS_Shape {
        if (inputs.angle === 0) {
            return this.converterService.getActualTypeOfShape(inputs.shape);
        }
        const axis = this.entitiesService.gpAx1(inputs.center, checkedDirection(inputs.axis, "axis"));
        const transformation = new this.occ.gp_Trsf();
        try {
            transformation.SetRotation(axis, this.base.math.degToRad({ number: inputs.angle }));
            return this.applyTrsf(inputs.shape, transformation);
        } finally {
            transformation.delete();
            axis.delete();
        }
    }

    transform(inputs: Resolved.OCCT.TransformDto<TopoDS_Shape>): TopoDS_Shape {
        this.refuseCollapsingScale(inputs.scaleFactor, "scaleFactor");
        const origin = this.entitiesService.gpPnt([0, 0, 0]);
        const scaling = new this.occ.gp_Trsf();
        scaling.SetScale(origin, inputs.scaleFactor);
        const rotation = new this.occ.gp_Trsf();
        if (inputs.rotationAngle !== 0) {
            const axis = this.entitiesService.gpAx1([0, 0, 0], inputs.rotationAxis);
            rotation.SetRotation(axis, this.base.math.degToRad({ number: inputs.rotationAngle }));
            axis.delete();
        }
        const translation = new this.occ.gp_Trsf();
        const vector = new this.occ.gp_Vec(inputs.translation[0], inputs.translation[1], inputs.translation[2]);
        translation.SetTranslation(vector);
        const turned = rotation.Multiplied(scaling);
        const composed = translation.Multiplied(turned);
        const shp = this.applyTrsf(inputs.shape, composed);
        [origin, scaling, rotation, translation, vector, turned, composed].forEach(temporary => temporary.delete());
        return shp;
    }

    placePoints(points: Inputs.Base.Point3[], rotation: number, direction: Inputs.Base.Vector3, center: Inputs.Base.Point3): Inputs.Base.Point3[] {
        const to = this.entitiesService.gpAx3_4([0, 0, 0], checkedDirection(direction, "direction"));
        const { own, releaseAll } = kernelObjects();
        own(to);
        try {
            const turn = own(new this.occ.gp_Trsf());
            if (rotation !== 0) {
                const axis = own(this.entitiesService.gpAx1([0, 0, 0], [0, 1, 0]));
                turn.SetRotation(axis, this.base.math.degToRad({ number: rotation }));
            }
            const from = own(this.entitiesService.gpAx3_4([0, 0, 0], [0, 1, 0]));
            const alignment = own(new this.occ.gp_Trsf());
            alignment.SetDisplacement(from, to);
            const move = own(new this.occ.gp_Trsf());
            move.SetTranslation(own(new this.occ.gp_Vec(center[0], center[1], center[2])));
            const placement = own(move.Multiplied(own(alignment.Multiplied(turn))));
            const m = this.trsfToMatrix(placement);
            return points.map(point => movedPoint(m, point));
        } finally {
            releaseAll();
        }
    }

    align(inputs: Resolved.OCCT.AlignDto<TopoDS_Shape>): TopoDS_Shape {
        const ax1 = this.entitiesService.gpAx3_4(inputs.fromOrigin, checkedDirection(inputs.fromDirection, "fromDirection"));
        const ax2 = releasedOnError([ax1], () => this.entitiesService.gpAx3_4(inputs.toOrigin, checkedDirection(inputs.toDirection, "toDirection")));
        return this.movedBetween(inputs.shape, ax1, ax2);
    }

    private movedBetween(shape: TopoDS_Shape, from: gp_Ax3, to: gp_Ax3): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        try {
            transformation.SetDisplacement(from, to);
            const location = new this.occ.TopLoc_Location(transformation);
            try {
                return this.converterService.castAndRelease(shape.Moved(location));
            } finally {
                location.delete();
            }
        } finally {
            [transformation, from, to].forEach(release);
        }
    }

    alignNormAndAxis(inputs: Resolved.OCCT.AlignNormAndAxisDto<TopoDS_Shape>): TopoDS_Shape {
        const ax1 = this.entitiesService.gpAx3_3(inputs.fromOrigin, inputs.fromNorm, inputs.fromAx);
        const ax2 = releasedOnError([ax1], () => this.entitiesService.gpAx3_3(inputs.toOrigin, inputs.toNorm, inputs.toAx));
        return this.movedBetween(inputs.shape, ax1, ax2);
    }

    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        const matrix = this.foldTransformations(inputs.transformation);
        if (this.isSimilarity(matrix)) {
            const trsf = this.matrixToTrsf(matrix);
            try {
                return this.applyTrsf(inputs.shape, trsf);
            } finally {
                trsf.delete();
            }
        }
        if (typeof this.occ.TransformByMatrix === "function" && this.holdsFaceWithoutSurface(inputs.shape)) {
            return this.stretchedMesh(inputs.shape, matrix);
        }
        const gtrsf = this.matrixToGTrsf(matrix);
        let shp: TopoDS_Shape;
        try {
            const gtrans = new this.occ.BRepBuilderAPI_GTransform(inputs.shape, gtrsf);
            const s = gtrans.Shape();
            shp = this.converterService.castAndRelease(s);
            gtrans.delete();
        } catch (ex) {
            gtrsf.delete();
            throw new Error("Could not apply the transformation matrix to the shape.", { cause: ex });
        }
        gtrsf.delete();
        return shp;
    }

    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        checkedShapes(inputs.shapes);
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

    scaleFromCenter(inputs: Resolved.OCCT.ScaleFromCenterDto<TopoDS_Shape>): TopoDS_Shape {
        this.refuseCollapsingScale(inputs.factor, "factor");
        const transformation = new this.occ.gp_Trsf();
        const center = this.entitiesService.gpPnt(inputs.center);
        transformation.SetScale(center, inputs.factor);
        const shp = this.applyTrsf(inputs.shape, transformation);
        center.delete();
        transformation.delete();
        return shp;
    }

    mirrorAboutPoint(inputs: Resolved.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const pnt = this.entitiesService.gpPnt(inputs.point);
        transformation.SetMirror(pnt);
        const shp = this.applyTrsf(inputs.shape, transformation);
        pnt.delete();
        transformation.delete();
        return shp;
    }

    rotateByQuaternion(inputs: Resolved.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        const matrix = this.quaternionToMatrix({ quaternion: inputs.quaternion });
        const transformation = this.matrixToTrsf(matrix);
        const shp = this.applyTrsf(inputs.shape, transformation);
        transformation.delete();
        return shp;
    }

    identityTransform(): Inputs.Base.TransformMatrix {
        return [...IDENTITY_MATRIX];
    }

    composeTransform(inputs: Resolved.OCCT.ComposeTransformDto): Inputs.Base.TransformMatrix {
        const scale = inputs.scale;
        const rotation = inputs.rotation;
        const translation = inputs.translation;

        const s = new this.occ.gp_Trsf();
        const origin = this.entitiesService.gpPnt([0, 0, 0]);
        s.SetScale(origin, scale);

        const rot = this.eulerXyzToTrsf(rotation);
        const t = new this.occ.gp_Trsf();
        const vec = new this.occ.gp_Vec(translation[0], translation[1], translation[2]);
        t.SetTranslation(vec);

        const rs = rot.Multiplied(s);
        const trs = t.Multiplied(rs);
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
        try {
            const inverted = gtrsf.Inverted();
            try {
                return this.gtrsfToMatrix(inverted);
            } finally {
                inverted.delete();
            }
        } finally {
            gtrsf.delete();
        }
    }

    translationToMatrix(inputs: Resolved.OCCT.TranslationToMatrixDto): Inputs.Base.TransformMatrix {
        return this.composeTransform(new Inputs.OCCT.ComposeTransformDto(inputs.translation) as Resolved.OCCT.ComposeTransformDto);
    }

    rotationAxisAngleToMatrix(inputs: Resolved.OCCT.RotationAxisAngleToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx1(inputs.center, inputs.axis);
        transformation.SetRotation(ax1, this.base.math.degToRad({ number: inputs.angle }));
        const matrix = this.trsfToMatrix(transformation);
        ax1.delete();
        transformation.delete();
        return matrix;
    }

    scaleUniformToMatrix(inputs: Resolved.OCCT.ScaleUniformToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const center = this.entitiesService.gpPnt(inputs.center);
        transformation.SetScale(center, inputs.factor);
        const matrix = this.trsfToMatrix(transformation);
        center.delete();
        transformation.delete();
        return matrix;
    }

    mirrorPointToMatrix(inputs: Resolved.OCCT.MirrorPointToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const pnt = this.entitiesService.gpPnt(inputs.point);
        transformation.SetMirror(pnt);
        const matrix = this.trsfToMatrix(transformation);
        pnt.delete();
        transformation.delete();
        return matrix;
    }

    mirrorAxisToMatrix(inputs: Resolved.OCCT.MirrorAxisToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax1 = this.entitiesService.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirrorAx1(ax1);
        const matrix = this.trsfToMatrix(transformation);
        ax1.delete();
        transformation.delete();
        return matrix;
    }

    mirrorPlaneToMatrix(inputs: Resolved.OCCT.MirrorPlaneToMatrixDto): Inputs.Base.TransformMatrix {
        const transformation = new this.occ.gp_Trsf();
        const ax2 = this.entitiesService.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirrorOnPlane(ax2);
        const matrix = this.trsfToMatrix(transformation);
        ax2.delete();
        transformation.delete();
        return matrix;
    }

    quaternionToMatrix(inputs: Resolved.OCCT.QuaternionToMatrixDto): Inputs.Base.TransformMatrix {
        const [qx, qy, qz, qw] = inputs.quaternion;
        const len = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw) || 1;
        const x = qx / len, y = qy / len, z = qz / len, w = qw / len;
        const xx = x * x, yy = y * y, zz = z * z;
        const xy = x * y, xz = x * z, yz = y * z;
        const wx = w * x, wy = w * y, wz = w * z;
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

    private applyTrsf(shape: TopoDS_Shape, transformation: gp_Trsf): TopoDS_Shape {
        const transf = new this.occ.BRepBuilderAPI_Transform(shape, transformation, true);
        try {
            return this.converterService.castAndRelease(transf.Shape());
        } finally {
            transf.delete();
        }
    }

    private eulerXyzToTrsf(rotation: Inputs.Base.Vector3) {
        const make = (axis: Inputs.Base.Vector3, angleDeg: number) => {
            const t = new this.occ.gp_Trsf();
            const ax1 = this.entitiesService.gpAx1([0, 0, 0], axis);
            t.SetRotation(ax1, this.base.math.degToRad({ number: angleDeg }));
            ax1.delete();
            return t;
        };
        const rx = make([1, 0, 0], rotation[0]);
        const ry = make([0, 1, 0], rotation[1]);
        const rz = make([0, 0, 1], rotation[2]);
        const ryz = ry.Multiplied(rz);
        const rxyz = rx.Multiplied(ryz);
        rx.delete();
        ry.delete();
        rz.delete();
        ryz.delete();
        return rxyz;
    }

    private trsfToMatrix(trsf: gp_Trsf): Inputs.Base.TransformMatrix {
        return [
            trsf.Value(1, 1), trsf.Value(2, 1), trsf.Value(3, 1), 0,
            trsf.Value(1, 2), trsf.Value(2, 2), trsf.Value(3, 2), 0,
            trsf.Value(1, 3), trsf.Value(2, 3), trsf.Value(3, 3), 0,
            trsf.Value(1, 4), trsf.Value(2, 4), trsf.Value(3, 4), 1,
        ];
    }

    private gtrsfToMatrix(gtrsf: gp_GTrsf): Inputs.Base.TransformMatrix {
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

    refuseCollapsingScale(factor: number, property: string): void {
        if (!this.isUsableScale(factor)) {
            throw new InputError(`\`${property}\` is ${factor}, and a scale factor has to be a finite number at least 1e-100 away from 0; nearer 0 the shape shrinks to a point.`, property);
        }
    }

    private isUsableScale(factor: number): boolean {
        return Number.isFinite(factor) && Math.abs(factor) >= smallestScale;
    }

    private stretchedMesh(shape: TopoDS_Shape, matrix: Inputs.Base.TransformMatrix): TopoDS_Shape {
        let placed: TopoDS_Shape;
        try {
            placed = this.occ.TransformByMatrix(shape, matrix);
        } catch (thrown) {
            throw readKernelException(this.occ, thrown);
        }
        const shp = this.converterService.castAndRelease(placed);
        return shp;
    }

    private holdsFaceWithoutSurface(shape: TopoDS_Shape): boolean {
        const explorer = new this.occ.TopExp_Explorer(shape, this.occ.TopAbs_ShapeEnum.FACE, this.occ.TopAbs_ShapeEnum.SHAPE);
        try {
            for (; explorer.More(); explorer.Next()) {
                const current = explorer.Current();
                const face = this.occ.CastToFace(current);
                const kind = this.occ.GetFaceSurfaceType(face);
                current.delete();
                face.delete();
                if (kind === "unknown") {
                    return true;
                }
            }
            return false;
        } finally {
            explorer.delete();
        }
    }

    private isSimilarity(m: Inputs.Base.TransformMatrix): boolean {
        const columns: Inputs.Base.Vector3[] = [[m[0], m[1], m[2]], [m[4], m[5], m[6]], [m[8], m[9], m[10]]];
        const length = dot3(columns[0]!, columns[0]!);
        if (!(length >= smallestScale * smallestScale) || !Number.isFinite(length)) {
            return false;
        }
        const tolerance = 1e-12 * length;
        return Math.abs(dot3(columns[1]!, columns[1]!) - length) <= tolerance
            && Math.abs(dot3(columns[2]!, columns[2]!) - length) <= tolerance
            && Math.abs(dot3(columns[0]!, columns[1]!)) <= tolerance
            && Math.abs(dot3(columns[0]!, columns[2]!)) <= tolerance
            && Math.abs(dot3(columns[1]!, columns[2]!)) <= tolerance;
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
        let acc = list[0]!;
        for (let i = 1; i < list.length; i++) {
            acc = this.multiplyMatricesColumnMajor(list[i]!, acc);
        }
        return acc;
    }

    private multiplyMatricesColumnMajor(a: Inputs.Base.TransformMatrix, b: Inputs.Base.TransformMatrix): Inputs.Base.TransformMatrix {
        const result: Inputs.Base.TransformMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row]! * b[col * 4 + k]!;
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
