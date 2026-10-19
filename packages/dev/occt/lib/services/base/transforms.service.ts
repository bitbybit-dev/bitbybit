import type { BitbybitOcctModule, TopoDS_Shape, gp_Ax3, gp_Trsf, gp_GTrsf } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { KernelObjects } from "./release-types";
import * as Inputs from "../../api/inputs";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type { ConverterService } from "./converter.service";
import type { EntitiesService } from "./entities.service";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { checkedDirection, checkedNumberList, checkedShape, checkedShapes, checkedWithin } from "./input-checks";
import { kernelObjects, release, released, releasedOnError } from "./release";
import { readKernelException } from "../../kernel-exception";
import { trapOr } from "../../kernel-traps";
import { movedPoint } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IDENTITY_MATRIX } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices.constants";
import { withKernelErrorsRead, withKernelRefusals } from "./kernel-refusals";

const smallestScale = 1e-100;
const QUATERNION_PARTS = 4;
const NO_INVERSE = /gp_GTrsf\.Inverted: the determinant is 0 or not a finite number/;

export class TransformsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly base: BaseBitByBit
    ) { }

    alignAndTranslate(inputs: Resolved.OCCT.AlignAndTranslateDto<TopoDS_Shape>): TopoDS_Shape {
        const direction = checkedDirection(inputs.direction, "direction");
        const alignedShape = this.align({ shape: inputs.shape, fromOrigin: [0, 0, 0], fromDirection: [0, 1, 0], toOrigin: [0, 0, 0], toDirection: direction });
        return released([alignedShape], () => this.translate({ shape: alignedShape, translation: inputs.center }));
    }

    scale3d(inputs: Resolved.OCCT.Scale3DDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        checkedNumberList(inputs.scale, "scale");
        checkedNumberList(inputs.center, "center");
        const [sx, sy, sz] = inputs.scale;
        if (this.isUsableScale(sx) && sx === sy && sx === sz) {
            return this.scaleFromCenter({ shape, factor: sx, center: inputs.center });
        }
        const shapeTranslated = this.translate({ shape, translation: inputs.center.map(c => -c) as Inputs.Base.Vector3 });
        const transformation = new this.occ.gp_GTrsf();
        const scale = inputs.scale;
        const mat = new this.occ.gp_Mat(scale[0], 0.0, 0.0, 0.0, scale[1], 0.0, 0.0, 0.0, scale[2]);
        transformation.SetVectorialPart(mat);
        try {
            return withKernelErrorsRead(this.occ, () => {
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
            });
        } catch (ex) {
            throw trapOr(ex, () => new Error("Could not scale the shape", { cause: ex }));
        } finally {
            [shapeTranslated, transformation, mat].forEach(release);
        }
    }

    translate(inputs: Resolved.OCCT.TranslateDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const [x, y, z] = inputs.translation;
        checkedNumberList(inputs.translation, "translation");
        return this.movedBy(shape, (transformation, own) => transformation.SetTranslation(own(new this.occ.gp_Vec(x, y, z))));
    }

    mirror(inputs: Resolved.OCCT.MirrorDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const direction = checkedDirection(inputs.direction, "direction");
        return this.movedBy(shape, (transformation, own) => transformation.SetMirrorAx1(own(this.entitiesService.gpAx1(inputs.origin, direction))));
    }

    mirrorAlongNormal(inputs: Resolved.OCCT.MirrorAlongNormalDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const normal = checkedDirection(inputs.normal, "normal");
        return this.movedBy(shape, (transformation, own) => transformation.SetMirrorOnPlane(own(this.entitiesService.gpAx2(inputs.origin, normal))));
    }

    rotate(inputs: Resolved.OCCT.RotateDto<TopoDS_Shape>): TopoDS_Shape {
        return this.turned(checkedShape(inputs.shape), [0, 0, 0], inputs.axis, inputs.angle);
    }

    rotateAroundCenter(inputs: Resolved.OCCT.RotateAroundCenterDto<TopoDS_Shape>): TopoDS_Shape {
        return this.turned(checkedShape(inputs.shape), inputs.center, inputs.axis, inputs.angle);
    }

    private turned(shape: TopoDS_Shape, center: Inputs.Base.Point3, axis: Inputs.Base.Vector3, angle: number): TopoDS_Shape {
        if (checkedWithin(angle, "angle", {}) === 0) {
            return this.converterService.getActualTypeOfShape(shape);
        }
        const direction = checkedDirection(axis, "axis");
        return this.movedBy(shape, (transformation, own) => transformation.SetRotation(own(this.entitiesService.gpAx1(center, direction)), this.base.math.degToRad({ number: angle })));
    }

    transform(inputs: Resolved.OCCT.TransformDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        this.refuseCollapsingScale(inputs.scaleFactor, "scaleFactor");
        checkedNumberList(inputs.translation, "translation");
        const rotationAxis = checkedWithin(inputs.rotationAngle, "rotationAngle", {}) === 0 ? undefined : checkedDirection(inputs.rotationAxis, "rotationAxis");
        const { own, releaseAll } = kernelObjects();
        try {
            const scaling = own(new this.occ.gp_Trsf());
            scaling.SetScale(own(this.entitiesService.gpPnt([0, 0, 0])), inputs.scaleFactor);
            const rotation = own(new this.occ.gp_Trsf());
            if (rotationAxis !== undefined) {
                rotation.SetRotation(own(this.entitiesService.gpAx1([0, 0, 0], rotationAxis)), this.base.math.degToRad({ number: inputs.rotationAngle }));
            }
            const translation = own(new this.occ.gp_Trsf());
            translation.SetTranslation(own(new this.occ.gp_Vec(inputs.translation[0], inputs.translation[1], inputs.translation[2])));
            const composed = own(translation.Multiplied(own(rotation.Multiplied(scaling))));
            return this.applyTrsf(shape, composed);
        } finally {
            releaseAll();
        }
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
        const shape = checkedShape(inputs.shape);
        const ax1 = this.entitiesService.gpAx3_4(inputs.fromOrigin, checkedDirection(inputs.fromDirection, "fromDirection"));
        const ax2 = releasedOnError([ax1], () => this.entitiesService.gpAx3_4(inputs.toOrigin, checkedDirection(inputs.toDirection, "toDirection")));
        return this.movedBetween(shape, ax1, ax2);
    }

    private movedBetween(shape: TopoDS_Shape, from: gp_Ax3, to: gp_Ax3): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            const transformation = own(new this.occ.gp_Trsf());
            transformation.SetDisplacement(from, to);
            const moved = shape.Moved(own(new this.occ.TopLoc_Location(transformation)));
            return releasedOnError([moved], () => this.converterService.castAndRelease(moved));
        } finally {
            releaseAll();
            [from, to].forEach(release);
        }
    }

    alignNormAndAxis(inputs: Resolved.OCCT.AlignNormAndAxisDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const ax1 = this.entitiesService.gpAx3_3(inputs.fromOrigin, inputs.fromNorm, inputs.fromAx);
        const ax2 = releasedOnError([ax1], () => this.entitiesService.gpAx3_3(inputs.toOrigin, inputs.toNorm, inputs.toAx));
        return this.movedBetween(shape, ax1, ax2);
    }

    transformByMatrix(inputs: Inputs.OCCT.TransformByMatrixDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const matrix = this.foldTransformations(inputs.transformation);
        checkedNumberList(matrix, "transformation");
        if (this.isSimilarity(matrix)) {
            return this.movedBy(shape, transformation => this.setValuesOf(transformation, matrix));
        }
        if (typeof this.occ.TransformByMatrix === "function" && this.holdsFaceWithoutSurface(shape)) {
            return this.stretchedMesh(shape, matrix);
        }
        const gtrsf = this.matrixToGTrsf(matrix);
        let shp: TopoDS_Shape;
        try {
            shp = withKernelErrorsRead(this.occ, () => {
                const gtrans = new this.occ.BRepBuilderAPI_GTransform(shape, gtrsf);
                try {
                    return this.converterService.castAndRelease(gtrans.Shape());
                } finally {
                    gtrans.delete();
                }
            });
        } catch (ex) {
            gtrsf.delete();
            throw trapOr(ex, () => new Error("Could not apply the transformation matrix to the shape.", { cause: ex }));
        }
        gtrsf.delete();
        return shp;
    }

    transformShapesByMatrix(inputs: Inputs.OCCT.TransformShapesByMatrixDto<TopoDS_Shape>): TopoDS_Shape[] {
        const shapes = checkedShapes(inputs.shapes);
        const transformed: TopoDS_Shape[] = [];
        return releasedOnError(transformed, () => {
            shapes.forEach(shape => {
                transformed.push(this.transformByMatrix({ shape, transformation: inputs.transformation }));
            });
            return transformed;
        });
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
        const shape = checkedShape(inputs.shape);
        this.refuseCollapsingScale(inputs.factor, "factor");
        return this.movedBy(shape, (transformation, own) => transformation.SetScale(own(this.entitiesService.gpPnt(inputs.center)), inputs.factor));
    }

    mirrorAboutPoint(inputs: Resolved.OCCT.MirrorAboutPointDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        return this.movedBy(shape, (transformation, own) => transformation.SetMirror(own(this.entitiesService.gpPnt(inputs.point))));
    }

    rotateByQuaternion(inputs: Resolved.OCCT.RotateByQuaternionDto<TopoDS_Shape>): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const matrix = this.quaternionToMatrix({ quaternion: inputs.quaternion });
        return this.movedBy(shape, transformation => this.setValuesOf(transformation, matrix));
    }

    identityTransform(): Inputs.Base.TransformMatrix {
        return [...IDENTITY_MATRIX];
    }

    composeTransform(inputs: Resolved.OCCT.ComposeTransformDto): Inputs.Base.TransformMatrix {
        this.refuseCollapsingScale(inputs.scale, "scale");
        checkedNumberList(inputs.rotation, "rotation");
        checkedNumberList(inputs.translation, "translation");
        return this.matrixOf((composed, own) => {
            const scaling = own(new this.occ.gp_Trsf());
            scaling.SetScale(own(this.entitiesService.gpPnt([0, 0, 0])), inputs.scale);
            const moving = own(new this.occ.gp_Trsf());
            moving.SetTranslation(own(this.entitiesService.gpVec(inputs.translation)));
            const rotated = own(this.eulerXyzToTrsf(inputs.rotation));
            composed.Multiply(own(moving.Multiplied(own(rotated.Multiplied(scaling)))));
        });
    }

    multiplyTransforms(inputs: Inputs.OCCT.MultiplyTransformsDto): Inputs.Base.TransformMatrix {
        return this.foldTransformations(inputs.transformation);
    }

    invertTransform(inputs: Inputs.OCCT.InvertTransformDto): Inputs.Base.TransformMatrix {
        const gtrsf = this.matrixToGTrsf(inputs.transformation);
        try {
            const inverted = withKernelRefusals(this.occ, () => gtrsf.Inverted(), message => NO_INVERSE.test(message)
                ? new InputError("`transformation` has no inverse: its determinant is 0 or not a finite number.", "transformation")
                : undefined);
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
        const axis = checkedDirection(inputs.axis, "axis");
        const radians = this.base.math.degToRad({ number: checkedWithin(inputs.angle, "angle", {}) });
        return this.matrixOf((transformation, own) => transformation.SetRotation(own(this.entitiesService.gpAx1(inputs.center, axis)), radians));
    }

    scaleUniformToMatrix(inputs: Resolved.OCCT.ScaleUniformToMatrixDto): Inputs.Base.TransformMatrix {
        this.refuseCollapsingScale(inputs.factor, "factor");
        return this.matrixOf((transformation, own) => transformation.SetScale(own(this.entitiesService.gpPnt(inputs.center)), inputs.factor));
    }

    mirrorPointToMatrix(inputs: Resolved.OCCT.MirrorPointToMatrixDto): Inputs.Base.TransformMatrix {
        return this.matrixOf((transformation, own) => transformation.SetMirror(own(this.entitiesService.gpPnt(inputs.point))));
    }

    mirrorAxisToMatrix(inputs: Resolved.OCCT.MirrorAxisToMatrixDto): Inputs.Base.TransformMatrix {
        const direction = checkedDirection(inputs.direction, "direction");
        return this.matrixOf((transformation, own) => transformation.SetMirrorAx1(own(this.entitiesService.gpAx1(inputs.origin, direction))));
    }

    mirrorPlaneToMatrix(inputs: Resolved.OCCT.MirrorPlaneToMatrixDto): Inputs.Base.TransformMatrix {
        const normal = checkedDirection(inputs.normal, "normal");
        return this.matrixOf((transformation, own) => transformation.SetMirrorOnPlane(own(this.entitiesService.gpAx2(inputs.origin, normal))));
    }

    quaternionToMatrix(inputs: Resolved.OCCT.QuaternionToMatrixDto): Inputs.Base.TransformMatrix {
        const parts = checkedNumberList(inputs.quaternion, "quaternion").length;
        if (parts !== QUATERNION_PARTS) {
            throw new InputError(`\`quaternion\` holds ${parts} numbers, and a quaternion is four: x, y, z and w.`, "quaternion");
        }
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

    private movedBy(shape: TopoDS_Shape, place: (transformation: gp_Trsf, own: KernelObjects["own"]) => void): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            return withKernelErrorsRead(this.occ, () => {
                const transformation = own(new this.occ.gp_Trsf());
                place(transformation, own);
                return this.applyTrsf(shape, transformation);
            });
        } finally {
            releaseAll();
        }
    }

    private matrixOf(place: (transformation: gp_Trsf, own: KernelObjects["own"]) => void): Inputs.Base.TransformMatrix {
        const { own, releaseAll } = kernelObjects();
        try {
            return withKernelErrorsRead(this.occ, () => {
                const transformation = own(new this.occ.gp_Trsf());
                place(transformation, own);
                return this.trsfToMatrix(transformation);
            });
        } finally {
            releaseAll();
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

    private setValuesOf(t: gp_Trsf, m: Inputs.Base.TransformMatrix): void {
        t.SetValues(
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
        );
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
