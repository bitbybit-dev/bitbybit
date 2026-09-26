import * as Inputs from "../../api/inputs";

/**
 * The triangulated mesh of a shape as the kernel lays it out: every face's nodes, normals, UVs and
 * triangles concatenated in face order, one fixed-size record per face, then the edges and vertices.
 */
export interface MeshArrays {
    positions: Float64Array;
    normals: Float64Array;
    uvs: Float64Array;
    triangles: Int32Array;
    faces: Int32Array;
    faceCentres: Float64Array;
    edgePoints: Float64Array;
    edges: Int32Array;
    edgeMiddles: Float64Array;
    vertices: Float64Array;
}

type DecodedFace = Omit<Inputs.OCCT.DecomposedFaceDto, "centerPoint" | "centerNormal"> & {
    centerPoint: Inputs.Base.Point3 | null;
    centerNormal: Inputs.Base.Vector3 | null;
};

type DecodedMesh = Omit<Inputs.OCCT.DecomposedMeshDto, "faceList"> & { faceList: DecodedFace[] };

export const FACE_RECORD = 4;
export const FACE_CENTRE_RECORD = 7;
export const EDGE_RECORD = 2;

function numbers(source: Float64Array | Int32Array, start: number, end: number): number[] {
    const result = new Array<number>(end - start);
    for (let i = start; i < end; i++) {
        result[i - start] = source[i]!;
    }
    return result;
}

function point(source: Float64Array, at: number): Inputs.Base.Point3 {
    return [source[at]!, source[at + 1]!, source[at + 2]!];
}

function points(source: Float64Array, first: number, count: number): Inputs.Base.Point3[] {
    const result = new Array<Inputs.Base.Point3>(count);
    for (let i = 0; i < count; i++) {
        result[i] = point(source, 3 * (first + i));
    }
    return result;
}

const DISAGREE = "the kernel's mesh buffers disagree with their records";

function expectLength(name: string, actual: number, expected: number): void {
    if (actual !== expected) {
        throw new Error(`${DISAGREE}: ${name} holds ${actual} numbers where ${expected} were described`);
    }
}

function expectWholeRecords(name: string, length: number, size: number): void {
    if (length % size !== 0) {
        throw new Error(`${DISAGREE}: ${name} holds ${length} numbers, not whole records of ${size}`);
    }
}

/**
 * Checks that every array holds exactly what the face and edge records describe, so a kernel whose
 * layout differs fails here instead of drawing holes in a mesh.
 */
function checkLengths(arrays: MeshArrays): void {
    expectWholeRecords("faces", arrays.faces.length, FACE_RECORD);
    expectWholeRecords("edges", arrays.edges.length, EDGE_RECORD);
    expectWholeRecords("vertices", arrays.vertices.length, 3);
    const faceCount = arrays.faces.length / FACE_RECORD;
    let nodes = 0;
    let uvNodes = 0;
    let triangles = 0;
    for (let record = 0; record < arrays.faces.length; record += FACE_RECORD) {
        nodes += arrays.faces[record + 1]!;
        uvNodes += arrays.faces[record + 3] === 1 ? arrays.faces[record + 1]! : 0;
        triangles += arrays.faces[record + 2]!;
    }
    let samples = 0;
    for (let record = 0; record < arrays.edges.length; record += EDGE_RECORD) {
        samples += arrays.edges[record + 1]!;
    }
    expectLength("positions", arrays.positions.length, 3 * nodes);
    expectLength("normals", arrays.normals.length, 3 * nodes);
    expectLength("uvs", arrays.uvs.length, 2 * uvNodes);
    expectLength("triangles", arrays.triangles.length, 3 * triangles);
    expectLength("faceCentres", arrays.faceCentres.length, FACE_CENTRE_RECORD * faceCount);
    expectLength("edgePoints", arrays.edgePoints.length, 3 * samples);
    expectLength("edgeMiddles", arrays.edgeMiddles.length, 3 * (arrays.edges.length / EDGE_RECORD));
}

/**
 * Builds the decomposed mesh the kernel's JSON describes from its flat arrays: the same objects, the
 * same keys in the same order and the same numbers, including a null centre for a face without a surface.
 * @throws Error when an array holds more or fewer numbers than the records describe
 */
export function decodeMeshArrays(arrays: MeshArrays): Inputs.OCCT.DecomposedMeshDto {
    checkLengths(arrays);
    const faceList: DecodedFace[] = [];
    let node = 0;
    let uvNode = 0;
    let triangle = 0;
    for (let f = 0; f * FACE_RECORD < arrays.faces.length; f++) {
        const record = f * FACE_RECORD;
        const nodes = arrays.faces[record + 1]!;
        const triangles = arrays.faces[record + 2]!;
        const hasUvs = arrays.faces[record + 3] === 1;
        const centre = f * FACE_CENTRE_RECORD;
        const hasCentre = arrays.faceCentres[centre] === 1;
        faceList.push({
            faceIndex: arrays.faces[record]!,
            vertexCoord: numbers(arrays.positions, 3 * node, 3 * (node + nodes)),
            vertexCoordVec: points(arrays.positions, node, nodes),
            uvs: hasUvs ? numbers(arrays.uvs, 2 * uvNode, 2 * (uvNode + nodes)) : [],
            normalCoord: numbers(arrays.normals, 3 * node, 3 * (node + nodes)),
            triIndexes: numbers(arrays.triangles, 3 * triangle, 3 * (triangle + triangles)),
            numberOfTriangles: triangles,
            centerPoint: hasCentre ? point(arrays.faceCentres, centre + 1) : null,
            centerNormal: hasCentre ? point(arrays.faceCentres, centre + 4) : null,
        });
        node += nodes;
        uvNode += hasUvs ? nodes : 0;
        triangle += triangles;
    }

    const edgeList: Inputs.OCCT.DecomposedEdgeDto[] = [];
    let sample = 0;
    for (let e = 0; e * EDGE_RECORD < arrays.edges.length; e++) {
        const samples = arrays.edges[e * EDGE_RECORD + 1]!;
        edgeList.push({
            edgeIndex: arrays.edges[e * EDGE_RECORD]!,
            middlePoint: point(arrays.edgeMiddles, 3 * e),
            vertexCoord: points(arrays.edgePoints, sample, samples),
        });
        sample += samples;
    }

    const mesh: DecodedMesh = { faceList, edgeList, pointsList: points(arrays.vertices, 0, arrays.vertices.length / 3) };
    return mesh as Inputs.OCCT.DecomposedMeshDto;
}
