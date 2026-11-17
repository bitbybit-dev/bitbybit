import type * as Manifold3D from "manifold-3d";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import type { Base } from "@bitbybit-dev/base";
import { followedBy } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { meshMatrixInModel } from "@bitbybit-dev/base/lib/api/services/helpers/files/mesh-file-axes";

export type RootPlacing = (matrix: Base.TransformMatrix) => Manifold3D.Mat4;

export const asTheRecipeSays: RootPlacing = (matrix) => matrix;

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

export function mirrorIntoModel(coordinateSystem: BaseInputs.Base.coordinateSystemEnum | undefined, adjustZtoY: boolean): Base.TransformMatrix | undefined {
    return coordinateSystem === BaseInputs.Base.coordinateSystemEnum.leftHanded ? meshMatrixInModel(coordinateSystem, adjustZtoY) : undefined;
}

export function rootPlacingOf(coordinateSystem: BaseInputs.Base.coordinateSystemEnum | undefined, adjustZtoY: boolean): RootPlacing {
    const mirror = mirrorIntoModel(coordinateSystem, adjustZtoY);
    if (mirror !== undefined) {
        return (matrix) => withoutNegativeZero(followedBy(matrix, mirror));
    }
    return adjustZtoY ? turnedZtoY : asTheRecipeSays;
}

export function placedAmongMirrored(matrix: Base.TransformMatrix, mirror: Base.TransformMatrix): Base.TransformMatrix {
    return withoutNegativeZero(followedBy(followedBy(mirror, matrix), mirror));
}
