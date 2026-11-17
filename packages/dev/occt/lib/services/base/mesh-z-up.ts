import type * as Inputs from "../../api/inputs";
import { movedPoint, movedPositions, turnedVector } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { TURNED_TO_Z_UP } from "./file-axes";

type Point = Inputs.Base.Point3;

const turnedPoint = (point: Point): Point => movedPoint(TURNED_TO_Z_UP, point);

const turnedFlat = (coordinates: number[]): number[] => Array.from(movedPositions(TURNED_TO_Z_UP, coordinates));

const turnedIfGiven = (point: Point | undefined | null): Point | undefined | null => (point ? turnedPoint(point) : point);

const turnedDirectionIfGiven = (direction: Point | undefined | null): Point | undefined | null => (direction ? turnedVector(TURNED_TO_Z_UP, direction) : direction);

export function meshTurnedToZUp(mesh: Inputs.OCCT.DecomposedMeshDto): Inputs.OCCT.DecomposedMeshDto {
    if (!Array.isArray(mesh.faceList) || !Array.isArray(mesh.edgeList) || !Array.isArray(mesh.pointsList)) {
        return mesh;
    }
    const turned: Inputs.OCCT.DecomposedMeshDto = {
        ...mesh,
        faceList: mesh.faceList.map(face => ({
            ...face,
            vertexCoord: turnedFlat(face.vertexCoord),
            normalCoord: turnedFlat(face.normalCoord),
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
