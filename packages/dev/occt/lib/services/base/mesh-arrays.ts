import * as Inputs from "../../api/inputs";

/**
 * The triangulated mesh of a shape as the kernel lays it out: every face's nodes, normals, UVs and
 * triangles concatenated in face order, one fixed-size record per face, then the edges and vertices.
 * A document's mesh adds one colour record per face; a mesh asked for with metadata adds one record
 * per face and per edge, with the adjacent and incident face indices concatenated after them.
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
    faceColors?: Int32Array;
    faceMetadata?: Float64Array;
    faceTypes?: Int32Array;
    faceAdjacency?: Int32Array;
    edgeMetadata?: Float64Array;
    edgeTypes?: Int32Array;
    edgeIncidence?: Int32Array;
}

/** What a mesh carries besides its geometry: the colour groups of a document, the metadata. */
export interface MeshContents {
    colors: boolean;
    metadata: boolean;
}

type DecodedFace = Omit<Inputs.OCCT.DecomposedFaceDto, "centerPoint" | "centerNormal"> & {
    centerPoint: Inputs.Base.Point3 | null;
    centerNormal: Inputs.Base.Vector3 | null;
};

type DecodedMesh = Omit<Inputs.OCCT.DecomposedMeshDto, "faceList"> & { faceList: DecodedFace[] };

export const FACE_RECORD = 4;
export const FACE_CENTRE_RECORD = 7;
export const EDGE_RECORD = 2;
export const FACE_COLOR_RECORD = 5;
export const FACE_METADATA_RECORD = 6;
export const FACE_TYPE_RECORD = 2;
export const EDGE_METADATA_RECORD = 5;
export const EDGE_TYPE_RECORD = 3;

/** The names the kernel's JSON gives surface types, by the code its buffers carry. */
export const SURFACE_TYPE_NAMES = ["Plane", "Cylinder", "Cone", "Sphere", "Torus", "BezierSurface", "BSplineSurface", "SurfaceOfRevolution", "SurfaceOfExtrusion", "OffsetSurface", "OtherSurface"] as const;

/** The names the kernel's JSON gives curve types, by the code its buffers carry. */
export const CURVE_TYPE_NAMES = ["Line", "Circle", "Ellipse", "Hyperbola", "Parabola", "BezierCurve", "BSplineCurve", "OffsetCurve", "OtherCurve"] as const;

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

function required<T>(name: string, array: T | undefined): T {
    if (array === undefined) {
        throw new Error(`${DISAGREE}: ${name} is missing`);
    }
    return array;
}

function typeName(names: readonly string[], code: number, kind: string): string {
    const name = names[code];
    if (name === undefined) {
        throw new Error(`${DISAGREE}: ${code} is not a ${kind} type`);
    }
    return name;
}

function sumOfCounts(records: Int32Array, size: number, at: number): number {
    let total = 0;
    for (let record = at; record < records.length; record += size) {
        total += records[record]!;
    }
    return total;
}

/** Checks the colour and metadata records against the face and edge records they belong to. */
function checkContents(arrays: MeshArrays, contents: MeshContents): void {
    const faceCount = arrays.faces.length / FACE_RECORD;
    const edgeCount = arrays.edges.length / EDGE_RECORD;
    if (contents.colors) {
        expectLength("faceColors", required("faceColors", arrays.faceColors).length, FACE_COLOR_RECORD * faceCount);
    }
    if (contents.metadata) {
        const faceTypes = required("faceTypes", arrays.faceTypes);
        const edgeTypes = required("edgeTypes", arrays.edgeTypes);
        expectLength("faceMetadata", required("faceMetadata", arrays.faceMetadata).length, FACE_METADATA_RECORD * faceCount);
        expectLength("faceTypes", faceTypes.length, FACE_TYPE_RECORD * faceCount);
        expectLength("faceAdjacency", required("faceAdjacency", arrays.faceAdjacency).length, sumOfCounts(faceTypes, FACE_TYPE_RECORD, 1));
        expectLength("edgeMetadata", required("edgeMetadata", arrays.edgeMetadata).length, EDGE_METADATA_RECORD * edgeCount);
        expectLength("edgeTypes", edgeTypes.length, EDGE_TYPE_RECORD * edgeCount);
        expectLength("edgeIncidence", required("edgeIncidence", arrays.edgeIncidence).length, sumOfCounts(edgeTypes, EDGE_TYPE_RECORD, 2));
    }
}

function hex(value: number): string {
    return value.toString(16).padStart(2, "0");
}

/** The colour groups the kernel's JSON writes: each "#rrggbbaa" colour, in sorted order, with its faces. */
function colorGroups(arrays: MeshArrays): { [color: string]: number[] } {
    const colors = required("faceColors", arrays.faceColors);
    const byColor = new Map<string, number[]>();
    for (let f = 0; f * FACE_RECORD < arrays.faces.length; f++) {
        const record = f * FACE_COLOR_RECORD;
        if (colors[record] !== 1) {
            continue;
        }
        const color = `#${hex(colors[record + 1]!)}${hex(colors[record + 2]!)}${hex(colors[record + 3]!)}${hex(colors[record + 4]!)}`;
        const faces = byColor.get(color);
        if (faces) {
            faces.push(arrays.faces[f * FACE_RECORD]!);
        } else {
            byColor.set(color, [arrays.faces[f * FACE_RECORD]!]);
        }
    }
    const groups: { [color: string]: number[] } = {};
    for (const color of [...byColor.keys()].sort()) {
        groups[color] = byColor.get(color)!;
    }
    return groups;
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
 * same keys in the same order and the same numbers, including a null centre for a face without a
 * surface, the metadata of every face and edge when `contents` asks for it and a document's colour groups.
 * @throws Error when an array holds more or fewer numbers than the records describe
 */
export function decodeMeshArrays(arrays: MeshArrays, contents: MeshContents = { colors: false, metadata: false }): Inputs.OCCT.DecomposedMeshDto {
    checkLengths(arrays);
    checkContents(arrays, contents);
    const faceList: DecodedFace[] = [];
    let node = 0;
    let uvNode = 0;
    let triangle = 0;
    let adjacent = 0;
    for (let f = 0; f * FACE_RECORD < arrays.faces.length; f++) {
        const record = f * FACE_RECORD;
        const nodes = arrays.faces[record + 1]!;
        const triangles = arrays.faces[record + 2]!;
        const hasUvs = arrays.faces[record + 3] === 1;
        const centre = f * FACE_CENTRE_RECORD;
        const hasCentre = arrays.faceCentres[centre] === 1;
        const face: DecodedFace = {
            faceIndex: arrays.faces[record]!,
            vertexCoord: numbers(arrays.positions, 3 * node, 3 * (node + nodes)),
            vertexCoordVec: points(arrays.positions, node, nodes),
            uvs: hasUvs ? numbers(arrays.uvs, 2 * uvNode, 2 * (uvNode + nodes)) : [],
            normalCoord: numbers(arrays.normals, 3 * node, 3 * (node + nodes)),
            triIndexes: numbers(arrays.triangles, 3 * triangle, 3 * (triangle + triangles)),
            numberOfTriangles: triangles,
            centerPoint: hasCentre ? point(arrays.faceCentres, centre + 1) : null,
            centerNormal: hasCentre ? point(arrays.faceCentres, centre + 4) : null,
        };
        if (contents.metadata) {
            const metadata = arrays.faceMetadata!;
            const types = arrays.faceTypes!;
            const at = f * FACE_METADATA_RECORD;
            const count = types[f * FACE_TYPE_RECORD + 1]!;
            face.area = metadata[at]!;
            face.centerOfMass = point(metadata, at + 1);
            face.surfaceType = typeName(SURFACE_TYPE_NAMES, types[f * FACE_TYPE_RECORD]!, "surface");
            face.tolerance = metadata[at + 4]!;
            face.adjacentFaces = numbers(arrays.faceAdjacency!, adjacent, adjacent + count);
            face.faceUid = metadata[at + 5]!;
            adjacent += count;
        }
        faceList.push(face);
        node += nodes;
        uvNode += hasUvs ? nodes : 0;
        triangle += triangles;
    }

    const edgeList: Inputs.OCCT.DecomposedEdgeDto[] = [];
    let sample = 0;
    let incident = 0;
    for (let e = 0; e * EDGE_RECORD < arrays.edges.length; e++) {
        const samples = arrays.edges[e * EDGE_RECORD + 1]!;
        const edge: Inputs.OCCT.DecomposedEdgeDto = {
            edgeIndex: arrays.edges[e * EDGE_RECORD]!,
            middlePoint: point(arrays.edgeMiddles, 3 * e),
            vertexCoord: points(arrays.edgePoints, sample, samples),
        };
        if (contents.metadata) {
            const metadata = arrays.edgeMetadata!;
            const types = arrays.edgeTypes!;
            const at = e * EDGE_METADATA_RECORD;
            const count = types[e * EDGE_TYPE_RECORD + 2]!;
            edge.length = metadata[at]!;
            edge.centerOfMass = point(metadata, at + 1);
            edge.curveType = typeName(CURVE_TYPE_NAMES, types[e * EDGE_TYPE_RECORD]!, "curve");
            edge.degenerated = types[e * EDGE_TYPE_RECORD + 1] === 1;
            edge.incidentFaces = numbers(arrays.edgeIncidence!, incident, incident + count);
            edge.edgeUid = metadata[at + 4]!;
            incident += count;
        }
        edgeList.push(edge);
        sample += samples;
    }

    const mesh: DecodedMesh = { faceList, edgeList, pointsList: points(arrays.vertices, 0, arrays.vertices.length / 3) };
    if (contents.colors) {
        mesh.colorGroups = colorGroups(arrays);
    }
    return mesh as Inputs.OCCT.DecomposedMeshDto;
}
