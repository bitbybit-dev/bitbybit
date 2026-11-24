import type * as Inputs from "../../api/inputs";
import { linearDeterminant, movedPoint, movedPositions, turnedVector } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { TURNED_TO_Z_UP } from "./file-axes";

type Point = Inputs.Base.Point3;
type Matrix = Inputs.Base.TransformMatrix;

const TRIANGLE_CORNERS = 3;

const windingReversed = (indexes: ArrayLike<number>): number[] => Array.from(indexes, (_corner, at) => {
    const first = at - at % TRIANGLE_CORNERS;
    const turned = at % TRIANGLE_CORNERS === 0 ? at : first + TRIANGLE_CORNERS - at % TRIANGLE_CORNERS;
    return indexes[turned]!;
});

export function meshTurnedToZUp(mesh: Inputs.OCCT.DecomposedMeshDto): Inputs.OCCT.DecomposedMeshDto {
    return meshTurnedBy(mesh, TURNED_TO_Z_UP);
}

export function meshTurnedBy(mesh: Inputs.OCCT.DecomposedMeshDto, matrix: Matrix): Inputs.OCCT.DecomposedMeshDto {
    if (!Array.isArray(mesh.faceList) || !Array.isArray(mesh.edgeList) || !Array.isArray(mesh.pointsList)) {
        return mesh;
    }
    const mirrored = linearDeterminant(matrix) < 0;
    const turnedPoint = (point: Point): Point => movedPoint(matrix, point);
    const turnedFlat = (coordinates: number[]): number[] => Array.from(movedPositions(matrix, coordinates));
    const turnedIfGiven = (point: Point | undefined | null): Point | undefined | null => (point ? turnedPoint(point) : point);
    const turnedDirectionIfGiven = (direction: Point | undefined | null): Point | undefined | null => (direction ? turnedVector(matrix, direction) : direction);
    const turned: Inputs.OCCT.DecomposedMeshDto = {
        ...mesh,
        faceList: mesh.faceList.map(face => ({
            ...face,
            vertexCoord: turnedFlat(face.vertexCoord),
            normalCoord: turnedFlat(face.normalCoord),
            ...(mirrored ? { triIndexes: windingReversed(face.triIndexes) } : {}),
            ...("vertexCoordVec" in face ? { vertexCoordVec: face.vertexCoordVec.map(turnedPoint) } : {}),
            centerPoint: turnedIfGiven(face.centerPoint) as Point,
            centerNormal: turnedDirectionIfGiven(face.centerNormal) as Point,
            ...("centerOfMass" in face ? { centerOfMass: turnedIfGiven(face.centerOfMass) as Point | undefined } : {}),
        })),
        edgeList: mesh.edgeList.map(edge => ({
            ...edge,
            middlePoint: turnedIfGiven(edge.middlePoint) as Point,
            vertexCoord: edge.vertexCoord.map(turnedPoint),
            ...("centerOfMass" in edge ? { centerOfMass: turnedIfGiven(edge.centerOfMass) as Point | undefined } : {}),
        })),
        pointsList: mesh.pointsList.map(turnedPoint),
    };
    return turned;
}
