import { Base } from "../../../inputs/base-inputs";

const Y_AND_Z_SWAPPED: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
const X_MIRRORED: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const TURNED_TO_Z_UP: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
const TURNED_TO_Y_UP: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];

export function meshMatrixInFile(coordinateSystem: Base.coordinateSystemEnum.leftHanded, zUp: boolean): Base.TransformMatrix;
export function meshMatrixInFile(coordinateSystem: Base.coordinateSystemEnum, zUp: true): Base.TransformMatrix;
export function meshMatrixInFile(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): Base.TransformMatrix | undefined;
export function meshMatrixInFile(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): Base.TransformMatrix | undefined {
    if (coordinateSystem === Base.coordinateSystemEnum.rightHanded) {
        return zUp ? TURNED_TO_Z_UP : undefined;
    }
    return zUp ? Y_AND_Z_SWAPPED : X_MIRRORED;
}

export function meshMatrixInModel(coordinateSystem: Base.coordinateSystemEnum.leftHanded, zUp: boolean): Base.TransformMatrix;
export function meshMatrixInModel(coordinateSystem: Base.coordinateSystemEnum, zUp: true): Base.TransformMatrix;
export function meshMatrixInModel(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): Base.TransformMatrix | undefined;
export function meshMatrixInModel(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): Base.TransformMatrix | undefined {
    if (coordinateSystem === Base.coordinateSystemEnum.rightHanded) {
        return zUp ? TURNED_TO_Y_UP : undefined;
    }
    return zUp ? Y_AND_Z_SWAPPED : X_MIRRORED;
}
