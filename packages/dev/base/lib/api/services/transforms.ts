
import { Base } from "../inputs/base-inputs";
import * as Inputs from "../inputs";
import { MathBitByBit } from "./math";
import { Vector } from "./vector";

/**
 * Builds transformation matrices for moving, rotating, scaling and stretching geometry. A
 * transformation is a 4x4 matrix as 16 numbers in column-major order; most methods return a short
 * list of them that is applied in order, so a rotation about a point is a move to the origin, the
 * rotation, and the move back. Angles are in degrees. Apply the result with the transform methods
 * of `point`, `polyline`, `line` and the kernels.
 */
export class Transforms {

    constructor(private readonly vector: Vector, private readonly math: MathBitByBit) { }

    /**
     * Builds a rotation about an axis that passes through a center point.
     *
     * The result is three matrices applied in order: move the center to the origin, rotate, move
     * back. The angle is in degrees; positive turns counter-clockwise when the axis points toward
     * you.
     * Example: center [5,0,0], axis [0,1,0], angle 90 -> a quarter turn about the vertical line
     * through [5,0,0]
     * @param inputs - The axis direction, the center it passes through and the angle in degrees
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center axis
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.transforms.rotationCenterAxis({ center: [5, 0, 0], axis: [0, 1, 0], angle: 90 });
     * const points = bitbybit.point.transformPoints({ points: [[10, 0, 0]], transformation: turn });
     * ```
     */
    rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.rotationAxis(
                inputs.axis,
                this.math.degToRad({ number: inputs.angle })
            ),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the X axis through a center point.
     *
     * The result is three matrices applied in order: move the center to the origin, rotate, move
     * back. The angle is in degrees; positive turns counter-clockwise when the axis points toward
     * you.
     * Example: center [0,0,0], angle 90 -> a quarter turn about the X axis
     * @param inputs - The center and the angle in degrees
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center x
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.transforms.rotationCenterX({ center: [0, 0, 0], angle: 90 });
     * ```
     */
    rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.rotationX(this.math.degToRad({ number: inputs.angle })),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the Y axis through a center point.
     *
     * The result is three matrices applied in order: move the center to the origin, rotate, move
     * back. The angle is in degrees; positive turns counter-clockwise when the axis points toward
     * you.
     * Example: center [0,0,0], angle 90 -> a quarter turn about the Y axis
     * @param inputs - The center and the angle in degrees
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center y
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.transforms.rotationCenterY({ center: [0, 0, 0], angle: 90 });
     * ```
     */
    rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.rotationY(this.math.degToRad({ number: inputs.angle })),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation about a line parallel to the Z axis through a center point.
     *
     * The result is three matrices applied in order: move the center to the origin, rotate, move
     * back. The angle is in degrees; positive turns counter-clockwise when the axis points toward
     * you.
     * Example: center [0,0,0], angle 90 -> a quarter turn about the Z axis
     * @param inputs - The center and the angle in degrees
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname center z
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.transforms.rotationCenterZ({ center: [0, 0, 0], angle: 90 });
     * ```
     */
    rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.rotationZ(this.math.degToRad({ number: inputs.angle })),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a rotation from three angles about a center point: yaw turns about Y, pitch about X
     * and roll about Z.
     *
     * The result is three matrices applied in order: move the center to the origin, rotate, move
     * back. Angles are in degrees.
     * Example: yaw 90, pitch 0, roll 0 -> a quarter turn about the vertical axis
     * @param inputs - The yaw, pitch and roll in degrees and the center
     * @returns The list of matrices to apply in order
     * @group rotation
     * @shortname yaw pitch roll
     * @drawable false
     * @example
     * ```typescript
     * const turn = bitbybit.transforms.rotationCenterYawPitchRoll({ yaw: 90, pitch: 0, roll: 0, center: [0, 0, 0] });
     * ```
     */
    rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.rotationYawPitchRoll(
                this.math.degToRad({ number: inputs.yaw }),
                this.math.degToRad({ number: inputs.pitch }),
                this.math.degToRad({ number: inputs.roll })),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale with its own factor per axis, measured from a center point that stays in
     * place.
     *
     * The result is three matrices applied in order: move the center to the origin, scale, move
     * back.
     * Example: center [5,5,5], factors [2,1,0.5] -> doubles X, keeps Y, halves Z about [5,5,5]
     * @param inputs - The center and the factor for each axis
     * @returns The list of matrices to apply in order
     * @group scale
     * @shortname center xyz
     * @drawable false
     * @example
     * ```typescript
     * const scale = bitbybit.transforms.scaleCenterXYZ({ center: [5, 5, 5], scaleXyz: [2, 1, 0.5] });
     * ```
     */
    scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2]),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale with its own factor per axis, measured from the origin.
     *
     * Example: factors [2,3,1] -> doubles X, triples Y, keeps Z
     * @param inputs - The factor for each axis
     * @returns A list with the one scale matrix
     * @group scale
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const scale = bitbybit.transforms.scaleXYZ({ scaleXyz: [2, 3, 1] });
     * ```
     */
    scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): Base.TransformMatrixes {
        return [this.scaling(inputs.scaleXyz[0], inputs.scaleXyz[1], inputs.scaleXyz[2])] as Base.TransformMatrixes;
    }

    /**
     * Builds a stretch along one direction, measured from a center point; distances across that
     * direction stay as they are.
     *
     * The result is three matrices applied in order: move the center to the origin, stretch, move
     * back.
     * Example: center [0,0,0], direction [1,0,0], scale 2 -> everything twice as far from the
     * center along X
     * @param inputs - The center, the direction and the factor
     * @returns The list of matrices to apply in order
     * @group scale
     * @shortname stretch dir center
     * @drawable false
     * @example
     * ```typescript
     * const stretch = bitbybit.transforms.stretchDirFromCenter({ center: [0, 0, 0], direction: [1, 0, 0], scale: 2 });
     * ```
     */
    stretchDirFromCenter(inputs: Inputs.Transforms.StretchDirCenterDto): Base.TransformMatrixes {
        const { center = [0, 0, 0], direction = [0, 0, 1], scale = 2 } = inputs;
        return [
            this.translation(-center[0], -center[1], -center[2]),
            this.stretchDirection(direction, scale),
            this.translation(center[0], center[1], center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale by the same factor on every axis, measured from the origin.
     *
     * Example: 2 -> everything twice as big and twice as far from the origin
     * @param inputs - The factor
     * @returns A list with the one scale matrix
     * @group scale
     * @shortname uniform
     * @drawable false
     * @example
     * ```typescript
     * const scale = bitbybit.transforms.uniformScale({ scale: 2 });
     * ```
     */
    uniformScale(inputs: Inputs.Transforms.UniformScaleDto): Base.TransformMatrixes {
        return [this.scaling(inputs.scale, inputs.scale, inputs.scale)] as Base.TransformMatrixes;
    }

    /**
     * Builds a scale by the same factor on every axis, measured from a center point that stays in
     * place.
     *
     * The result is three matrices applied in order: move the center to the origin, scale, move
     * back.
     * Example: center [5,5,5], scale 0.5 -> everything half as big, shrinking toward [5,5,5]
     * @param inputs - The factor and the center
     * @returns The list of matrices to apply in order
     * @group scale
     * @shortname uniform from center
     * @drawable false
     * @example
     * ```typescript
     * const scale = bitbybit.transforms.uniformScaleFromCenter({ center: [5, 5, 5], scale: 0.5 });
     * ```
     */
    uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): Base.TransformMatrixes {
        return [
            this.translation(-inputs.center[0], -inputs.center[1], -inputs.center[2]),
            this.scaling(inputs.scale, inputs.scale, inputs.scale),
            this.translation(inputs.center[0], inputs.center[1], inputs.center[2]),
        ] as Base.TransformMatrixes;
    }

    /**
     * Builds a move by a vector.
     *
     * Example: [10,5,0] -> 10 along X, 5 along Y, nothing along Z
     * @param inputs - The vector to move by
     * @returns A list with the one translation matrix
     * @group translation
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const move = bitbybit.transforms.translationXYZ({ translation: [10, 5, 0] });
     * ```
     */
    translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): Base.TransformMatrixes {
        return [this.translation(inputs.translation[0], inputs.translation[1], inputs.translation[2])] as Base.TransformMatrixes;
    }

    /**
     * Builds one move per vector, for transforming many points each by its own vector.
     *
     * Example: [[1,0,0], [0,2,0]] -> two transformations: one along X, one along Y
     * @param inputs - The vectors to move by
     * @returns One transformation per vector, in the same order
     * @group translations
     * @shortname xyz
     * @drawable false
     * @example
     * ```typescript
     * const moves = bitbybit.transforms.translationsXYZ({ translations: [[1, 0, 0], [0, 2, 0]] });
     * ```
     */
    translationsXYZ(inputs: Inputs.Transforms.TranslationsXYZDto): Base.TransformMatrixes[] {
        return inputs.translations.map(translation => [this.translation(translation[0], translation[1], translation[2])]) as Base.TransformMatrixes[];
    }

    /**
     * Gives the matrix that changes nothing, as a starting point or a placeholder.
     *
     * Example: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
     * @returns The identity matrix
     * @group identity
     * @shortname identity
     * @drawable false
     */
    identity(): Base.TransformMatrix {
        return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    }

    private translation(x: number, y: number, z: number) {
        return [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, z, 1.0];
    }

    private scaling(x: number, y: number, z: number) {
        return [x, 0.0, 0.0, 0.0, 0.0, y, 0.0, 0.0, 0.0, 0.0, z, 0.0, 0.0, 0.0, 0.0, 1.0];
    }


    private rotationAxis(axis: Base.Vector3, angle: number) {
        const s = Math.sin(-angle);
        const c = Math.cos(-angle);
        const c1 = 1 - c;

        const a = this.vector.normalized({ vector: axis }) as Base.Vector3;

        const x = a[0];
        const y = a[1];
        const z = a[2];

        const m = this.identity();

        m[0] = x * x * c1 + c;
        m[1] = x * y * c1 - z * s;
        m[2] = x * z * c1 + y * s;
        m[3] = 0.0;

        m[4] = y * x * c1 + z * s;
        m[5] = y * y * c1 + c;
        m[6] = y * z * c1 - x * s;
        m[7] = 0.0;

        m[8] = z * x * c1 - y * s;
        m[9] = z * y * c1 + x * s;
        m[10] = z * z * c1 + c;
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;

        return m;
    }

    private rotationX(angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return [1.0, 0.0, 0.0, 0.0, 0.0, c, s, 0.0, 0.0, -s, c, 0.0, 0.0, 0.0, 0.0, 1.0];
    }

    private rotationY(angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return [c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0];
    }

    private rotationZ(angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        return [c, s, 0.0, 0.0, -s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0];
    }

    private rotationYawPitchRoll(yaw: number, pitch: number, roll: number) {
        const halfRoll = roll * 0.5;
        const halfPitch = pitch * 0.5;
        const halfYaw = yaw * 0.5;

        const sinRoll = Math.sin(halfRoll);
        const cosRoll = Math.cos(halfRoll);
        const sinPitch = Math.sin(halfPitch);
        const cosPitch = Math.cos(halfPitch);
        const sinYaw = Math.sin(halfYaw);
        const cosYaw = Math.cos(halfYaw);

        const x = cosYaw * sinPitch * cosRoll + sinYaw * cosPitch * sinRoll;
        const y = sinYaw * cosPitch * cosRoll - cosYaw * sinPitch * sinRoll;
        const z = cosYaw * cosPitch * sinRoll - sinYaw * sinPitch * cosRoll;
        const w = cosYaw * cosPitch * cosRoll + sinYaw * sinPitch * sinRoll;

        return this.rotationMatrixFromQuat(x, y, z, w);
    }

    private rotationMatrixFromQuat(x: number, y: number, z: number, w: number) {
        const xx = x * x;
        const yy = y * y;
        const zz = z * z;
        const xy = x * y;
        const zw = z * w;
        const zx = z * x;
        const yw = y * w;
        const yz = y * z;
        const xw = x * w;

        const m = this.identity();

        m[0] = 1.0 - 2.0 * (yy + zz);
        m[1] = 2.0 * (xy + zw);
        m[2] = 2.0 * (zx - yw);
        m[3] = 0.0;

        m[4] = 2.0 * (xy - zw);
        m[5] = 1.0 - 2.0 * (zz + xx);
        m[6] = 2.0 * (yz + xw);
        m[7] = 0.0;

        m[8] = 2.0 * (zx + yw);
        m[9] = 2.0 * (yz - xw);
        m[10] = 1.0 - 2.0 * (yy + xx);
        m[11] = 0.0;

        m[12] = 0.0;
        m[13] = 0.0;
        m[14] = 0.0;
        m[15] = 1.0;
        return m;
    }

    /**
     * Creates a 4x4 matrix that scales along a given direction vector.
     * @param direction The direction vector (will be normalized).
     * @param scale The scale factor along the direction.
     * @returns A 4x4 column-major transformation matrix.
     */
    private stretchDirection(direction: Base.Vector3, scale: number): Base.TransformMatrix {
        const d = this.vector.normalized({ vector: direction });

        if (!d || isNaN(d[0]!) || (d[0] === 0 && d[1] === 0 && d[2] === 0)) {
            console.warn("Stretch direction vector is zero or invalid. Returning identity matrix.");
            return this.identity();
        }
        const [dx, dy, dz] = d as Base.Vector3;

        const s = scale;
        const sMinus1 = s - 1.0;

        const m11 = 1.0 + sMinus1 * dx * dx;
        const m12 = sMinus1 * dx * dy;
        const m13 = sMinus1 * dx * dz;

        const m21 = sMinus1 * dy * dx;
        const m22 = 1.0 + sMinus1 * dy * dy;
        const m23 = sMinus1 * dy * dz;

        const m31 = sMinus1 * dz * dx;
        const m32 = sMinus1 * dz * dy;
        const m33 = 1.0 + sMinus1 * dz * dz;

        const m: Base.TransformMatrix = [
            m11, m21, m31, 0.0,
            m12, m22, m32, 0.0,
            m13, m23, m33, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];

        return m;
    }

}
