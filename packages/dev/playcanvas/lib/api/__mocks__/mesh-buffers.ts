import type * as Inputs from "../inputs";

const LEADING_NUMBERS = 3;
const LEADING_UVS = 2;

export interface MeshBuffersShape {
    withoutCenters?: boolean;
}

export function meshBuffersOf(mesh: Inputs.OCCT.DecomposedMeshDto, shape: MeshBuffersShape = {}): Inputs.OCCT.DecomposedMeshBuffersDto {
    const faces = mesh.faceList;
    const coordinates = faces.reduce((sum, face) => sum + face.vertexCoord.length, LEADING_NUMBERS);
    const uvCount = faces.reduce((sum, face) => sum + (face.uvs ?? []).length, LEADING_UVS);
    const indexCount = faces.reduce((sum, face) => sum + face.triIndexes.length, LEADING_NUMBERS);
    const analysisCount = faces.reduce((sum, face) => sum + (face.analysisValues ?? []).length, LEADING_NUMBERS);
    const positions = new Float32Array(coordinates).fill(-7);
    const normals = new Float32Array(coordinates).fill(-7);
    const uvs = new Float32Array(uvCount).fill(-7);
    const triangles = new Uint32Array(indexCount).fill(7);
    const analysis = new Float32Array(analysisCount).fill(-7);
    let coordinate = LEADING_NUMBERS;
    let uv = LEADING_UVS;
    let index = LEADING_NUMBERS;
    let value = LEADING_NUMBERS;
    const faceList = faces.map((face): Inputs.OCCT.DecomposedFaceBuffersDto => {
        const { vertexCoordVec: _points, analysisValues, ...facts } = face;
        const faceUvs = face.uvs ?? [];
        positions.set(face.vertexCoord, coordinate);
        normals.set(face.normalCoord, coordinate);
        uvs.set(faceUvs, uv);
        triangles.set(face.triIndexes, index);
        const buffered: Inputs.OCCT.DecomposedFaceBuffersDto = {
            ...facts,
            vertexCoord: positions.subarray(coordinate, coordinate + face.vertexCoord.length),
            normalCoord: normals.subarray(coordinate, coordinate + face.normalCoord.length),
            uvs: faceUvs.length === 0 ? uvs.subarray(0, 0) : uvs.subarray(uv, uv + faceUvs.length),
            triIndexes: triangles.subarray(index, index + face.triIndexes.length),
            centerPoint: shape.withoutCenters ? null : face.centerPoint ?? null,
            centerNormal: shape.withoutCenters ? null : face.centerNormal ?? null,
        };
        if (analysisValues !== undefined) {
            analysis.set(analysisValues, value);
            buffered.analysisValues = analysis.subarray(value, value + analysisValues.length);
            value += analysisValues.length;
        }
        coordinate += face.vertexCoord.length;
        uv += faceUvs.length;
        index += face.triIndexes.length;
        return buffered;
    });
    const buffers: Inputs.OCCT.DecomposedMeshBuffersDto = { faceList, edgeList: mesh.edgeList, pointsList: mesh.pointsList ?? [] };
    if (mesh.colorGroups !== undefined) {
        buffers.colorGroups = mesh.colorGroups;
    }
    if (mesh.isoCurveList !== undefined) {
        buffers.isoCurveList = mesh.isoCurveList;
    }
    return buffers;
}

export function triangleFaceLists(faceIndex: number, withUvs: boolean): Inputs.OCCT.DecomposedFaceDto {
    const x = faceIndex * 2;
    return {
        faceIndex,
        vertexCoord: [x, 0, 0, x + 1, 0, 0, x, 1, 0],
        vertexCoordVec: [[x, 0, 0], [x + 1, 0, 0], [x, 1, 0]],
        normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        triIndexes: [0, 1, 2],
        numberOfTriangles: 1,
        centerPoint: [x + 0.25, 0.25, 0],
        centerNormal: [0, 0, 1],
        uvs: withUvs ? [0, 0, 1, 0, 0, 1] : [],
    };
}

export function twoTrianglesLists(): Inputs.OCCT.DecomposedMeshDto {
    return { faceList: [triangleFaceLists(0, true), triangleFaceLists(1, false)], edgeList: [], pointsList: [] };
}

export function twoTrianglesBuffers(): Inputs.OCCT.DecomposedMeshBuffersDto {
    return meshBuffersOf(twoTrianglesLists());
}
