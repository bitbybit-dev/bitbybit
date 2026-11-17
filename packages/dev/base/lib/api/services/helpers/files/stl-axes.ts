import type { Base } from "../../../inputs/base-inputs";
import { linearDeterminant } from "../geometry/matrices";
import { MATRIX_COLUMN } from "../geometry/matrices.constants";
import { meshMatrixInFile, meshMatrixInModel } from "./mesh-file-axes";
import type { StlAxes, StlAxis } from "./stl-types";

const COMPONENTS = [0, 1, 2] as const;
const AS_IT_IS: StlAxes = { x: [0, false], y: [1, false], z: [2, false], mirrors: false };

function stlAxesOf(matrix: Base.TransformMatrix | undefined): StlAxes {
    if (matrix === undefined) {
        return AS_IT_IS;
    }
    const axisOf = (row: 0 | 1 | 2): StlAxis => {
        const source = COMPONENTS.find(column => matrix[column * MATRIX_COLUMN + row] !== 0) ?? row;
        return [source, matrix[source * MATRIX_COLUMN + row]! < 0];
    };
    return { x: axisOf(0), y: axisOf(1), z: axisOf(2), mirrors: linearDeterminant(matrix) < 0 };
}

export function stlAxesInFile(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): StlAxes {
    return stlAxesOf(meshMatrixInFile(coordinateSystem, zUp));
}

export function stlAxesInModel(coordinateSystem: Base.coordinateSystemEnum, zUp: boolean): StlAxes {
    return stlAxesOf(meshMatrixInModel(coordinateSystem, zUp));
}
