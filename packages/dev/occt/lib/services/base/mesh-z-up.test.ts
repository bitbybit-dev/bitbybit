import { describe, expect, it } from "vitest";
import type * as Inputs from "../../api/inputs";
import { meshTurnedBy, meshTurnedToZUp } from "./mesh-z-up";

const mesh = (): Inputs.OCCT.DecomposedMeshDto => ({
    faceList: [{
        faceIndex: 4,
        normalCoord: [0, 1, 0, 0, 0, 1],
        numberOfTriangles: 1,
        triIndexes: [0, 1, 2],
        vertexCoord: [1, 2, 3, 4, 5, 6],
        vertexCoordVec: [[1, 2, 3], [4, 5, 6]],
        centerPoint: [7, 8, 9],
        centerNormal: [0, 0, 1],
        uvs: [0.25, 0.75],
        area: 12,
        centerOfMass: [10, 11, 12],
        faceUid: 77,
    }],
    edgeList: [{
        edgeIndex: 2,
        middlePoint: [13, 14, 15],
        vertexCoord: [[16, 17, 18], [19, 20, 21]],
        length: 5,
        centerOfMass: [22, 23, 24],
        edgeUid: 88,
    }],
    pointsList: [[25, 26, 27]],
    colorGroups: { "#ff0000ff": [4] },
});

describe("meshTurnedToZUp", () => {
    it("should turn every point and direction of a mesh a quarter about x and keep everything else", () => {
        // Act
        const turned = meshTurnedToZUp(mesh());

        // Assert
        expect(turned).toEqual({
            faceList: [{
                faceIndex: 4,
                normalCoord: [0, 0, 1, 0, -1, 0],
                numberOfTriangles: 1,
                triIndexes: [0, 1, 2],
                vertexCoord: [1, -3, 2, 4, -6, 5],
                vertexCoordVec: [[1, -3, 2], [4, -6, 5]],
                centerPoint: [7, -9, 8],
                centerNormal: [0, -1, 0],
                uvs: [0.25, 0.75],
                area: 12,
                centerOfMass: [10, -12, 11],
                faceUid: 77,
            }],
            edgeList: [{
                edgeIndex: 2,
                middlePoint: [13, -15, 14],
                vertexCoord: [[16, -18, 17], [19, -21, 20]],
                length: 5,
                centerOfMass: [22, -24, 23],
                edgeUid: 88,
            }],
            pointsList: [[25, -27, 26]],
            colorGroups: { "#ff0000ff": [4] },
        });
    });

    it("should leave the mesh it was given as it was", () => {
        // Arrange
        const given = mesh();

        // Act
        meshTurnedToZUp(given);

        // Assert
        expect(given).toEqual(mesh());
    });

    it("should not add a centre of mass to a face or an edge that carries none", () => {
        // Arrange
        const plain = mesh();
        delete plain.faceList[0]!.centerOfMass;
        delete plain.edgeList[0]!.centerOfMass;

        // Act
        const turned = meshTurnedToZUp(plain);

        // Assert
        expect(["centerOfMass" in turned.faceList[0]!, "centerOfMass" in turned.edgeList[0]!]).toEqual([false, false]);
    });

    it("should hand back an answer that is no mesh as it is", () => {
        // Arrange
        const refused: Inputs.OCCT.DecomposedMeshDto = JSON.parse("{\"error\":\"the precision must be a finite number\"}");

        // Act
        const answer = meshTurnedToZUp(refused);

        // Assert
        expect(answer).toBe(refused);
    });

    it("should reverse each triangle's winding when the turn mirrors, so the faces keep facing out", () => {
        // Arrange
        const swapped: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
        const two = { ...mesh(), faceList: [{ ...mesh().faceList[0]!, triIndexes: [0, 1, 2, 2, 1, 0] }] };

        // Act
        const turned = meshTurnedBy(two, swapped);
        const rotated = meshTurnedBy(two, [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1]);

        // Assert
        expect(turned.faceList[0]!.triIndexes).toEqual([0, 2, 1, 2, 0, 1]);
        expect(turned.faceList[0]!.vertexCoord).toEqual([1, 3, 2, 4, 6, 5]);
        expect(turned.faceList[0]!.normalCoord).toEqual([0, 0, 1, 0, 1, 0]);
        expect(rotated.faceList[0]!.triIndexes).toEqual([0, 1, 2, 2, 1, 0]);
        expect(two.faceList[0]!.triIndexes).toEqual([0, 1, 2, 2, 1, 0]);
    });
});
