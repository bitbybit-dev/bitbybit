import type * as Manifold3D from "manifold-3d";
import { checkedUpAxis, Inputs as BaseInputs } from "@bitbybit-dev/base";
import type { Base } from "@bitbybit-dev/base";
import { followedBy } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { meshMatrixInModel } from "@bitbybit-dev/base/lib/api/services/helpers/files/mesh-file-axes";

export type RootPlacing = (matrix: Base.TransformMatrix) => Manifold3D.Mat4;

export const asTheRecipeSays: RootPlacing = (matrix) => matrix;

export function turnedFromZUp(upAxis: unknown): boolean {
    const { keep, zUpToYUp } = BaseInputs.Base.upAxisConversionEnum;
    return checkedUpAxis(upAxis, [keep, zUpToYUp]) === zUpToYUp;
}

function withoutNegativeZero(matrix: Base.TransformMatrix): Base.TransformMatrix {
    return matrix.map((value) => value + 0) as Base.TransformMatrix;
}

function negatedWithoutNegativeZero(value: number): number {
    return 0 - value;
}

export function turnedZtoY(matrix: Base.TransformMatrix): Manifold3D.Mat4 {
    const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = matrix;
    return [
        a, c, negatedWithoutNegativeZero(b), d,
        e, g, negatedWithoutNegativeZero(f), h,
        i, k, negatedWithoutNegativeZero(j), l,
        m, o, negatedWithoutNegativeZero(n), p,
    ];
}

export function mirrorIntoModel(coordinateSystem: BaseInputs.Base.coordinateSystemEnum | undefined, zUp: boolean): Base.TransformMatrix | undefined {
    return coordinateSystem === BaseInputs.Base.coordinateSystemEnum.leftHanded ? meshMatrixInModel(coordinateSystem, zUp) : undefined;
}

export function rootPlacingOf(coordinateSystem: BaseInputs.Base.coordinateSystemEnum | undefined, zUp: boolean): RootPlacing {
    const mirror = mirrorIntoModel(coordinateSystem, zUp);
    if (mirror !== undefined) {
        return (matrix) => withoutNegativeZero(followedBy(matrix, mirror));
    }
    return zUp ? turnedZtoY : asTheRecipeSays;
}

export function placedAmongMirrored(matrix: Base.TransformMatrix, mirror: Base.TransformMatrix): Base.TransformMatrix {
    return withoutNegativeZero(followedBy(followedBy(mirror, matrix), mirror));
}
