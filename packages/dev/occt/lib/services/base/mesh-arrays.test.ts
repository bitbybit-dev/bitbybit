import { describe, it, expect } from "vitest";
import { decodeMeshArrays, decodePolylines, type MeshArrays } from "./mesh-arrays";

function consistent(overrides: Partial<MeshArrays>): MeshArrays {
    return arrays({
        positions: new Float64Array(18),
        normals: new Float64Array(18),
        uvs: new Float64Array(6),
        triangles: new Int32Array(6),
        faces: new Int32Array([0, 3, 1, 1, 1, 3, 1, 0]),
        faceCentres: new Float64Array(14),
        edgePoints: new Float64Array(15),
        edges: new Int32Array([0, 2, 1, 3]),
        edgeMiddles: new Float64Array(6),
        vertices: new Float64Array(6),
        ...overrides,
    });
}

function arrays(overrides: Partial<MeshArrays>): MeshArrays {
    return {
        positions: new Float64Array(0),
        normals: new Float64Array(0),
        uvs: new Float64Array(0),
        triangles: new Int32Array(0),
        faces: new Int32Array(0),
        faceCentres: new Float64Array(0),
        edgePoints: new Float64Array(0),
        edges: new Int32Array(0),
        edgeMiddles: new Float64Array(0),
        vertices: new Float64Array(0),
        ...overrides,
    };
}

describe("decodeMeshArrays", () => {
    it("splits the concatenated nodes, UVs and triangles back into their faces", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 5, 5, 6, 5, 5, 5, 6, 5, 6, 6, 5]),
            normals: new Float64Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]),
            uvs: new Float64Array([0, 0, 1, 0, 0, 1]),
            triangles: new Int32Array([0, 1, 2, 0, 2, 1, 1, 3, 2]),
            faces: new Int32Array([0, 3, 1, 1, 2, 4, 2, 0]),
            faceCentres: new Float64Array([1, 0.3, 0.3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList).toEqual([
            {
                faceIndex: 0,
                vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                vertexCoordVec: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                uvs: [0, 0, 1, 0, 0, 1],
                normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                triIndexes: [0, 1, 2],
                numberOfTriangles: 1,
                centerPoint: [0.3, 0.3, 0],
                centerNormal: [0, 0, 1],
            },
            {
                faceIndex: 2,
                vertexCoord: [5, 5, 5, 6, 5, 5, 5, 6, 5, 6, 6, 5],
                vertexCoordVec: [[5, 5, 5], [6, 5, 5], [5, 6, 5], [6, 6, 5]],
                uvs: [],
                normalCoord: [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
                triIndexes: [0, 2, 1, 1, 3, 2],
                numberOfTriangles: 2,
                centerPoint: null,
                centerNormal: null,
            },
        ]);
    });

    it("writes each face's keys in the order the kernel's JSON does", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0]),
            normals: new Float64Array([0, 0, 1]),
            faces: new Int32Array([0, 1, 0, 0]),
            faceCentres: new Float64Array([0, 0, 0, 0, 0, 0, 1]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(Object.keys(mesh)).toEqual(["faceList", "edgeList", "pointsList"]);
        expect(Object.keys(mesh.faceList[0]!)).toEqual(["faceIndex", "vertexCoord", "vertexCoordVec", "uvs", "normalCoord", "triIndexes", "numberOfTriangles", "centerPoint", "centerNormal"]);
    });

    it("gives every edge its own samples and middle point, and lists the vertices", () => {
        // Arrange
        const input = arrays({
            edgePoints: new Float64Array([0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 2, 0]),
            edges: new Int32Array([0, 2, 1, 3]),
            edgeMiddles: new Float64Array([0.5, 0, 0, 1, 1, 0]),
            vertices: new Float64Array([0, 0, 0, 1, 0, 0]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.edgeList).toEqual([
            { edgeIndex: 0, middlePoint: [0.5, 0, 0], vertexCoord: [[0, 0, 0], [1, 0, 0]] },
            { edgeIndex: 1, middlePoint: [1, 1, 0], vertexCoord: [[1, 0, 0], [1, 1, 0], [1, 2, 0]] },
        ]);
        expect(mesh.pointsList).toEqual([[0, 0, 0], [1, 0, 0]]);
        expect(Object.keys(mesh.edgeList[0]!)).toEqual(["edgeIndex", "middlePoint", "vertexCoord"]);
    });

    it("returns empty lists for an empty mesh", () => {
        // Arrange
        const input = arrays({});

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh).toEqual({ faceList: [], edgeList: [], pointsList: [] });
    });
    it("keeps each face's UVs in step when a face without UVs comes first", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 5, 5, 6, 5, 5, 5, 6, 5]),
            normals: new Float64Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
            uvs: new Float64Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]),
            triangles: new Int32Array([0, 1, 2, 0, 1, 2]),
            faces: new Int32Array([0, 3, 1, 0, 1, 3, 1, 1]),
            faceCentres: new Float64Array(14),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList.map(face => face.uvs)).toEqual([[], [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]]);
        expect(mesh.faceList.map(face => face.vertexCoord)).toEqual([[0, 0, 0, 1, 0, 0, 0, 1, 0], [5, 5, 5, 6, 5, 5, 5, 6, 5]]);
    });

    it("accepts arrays that hold exactly what their records describe", () => {
        // Arrange
        const input = consistent({});

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList).toHaveLength(2);
        expect(mesh.edgeList).toHaveLength(2);
        expect(mesh.pointsList).toHaveLength(2);
    });

    it.each([
        ["positions short of a node", { positions: new Float64Array(15) }, "positions"],
        ["normals past the last node", { normals: new Float64Array(21) }, "normals"],
        ["uvs short of a node", { uvs: new Float64Array(4) }, "uvs"],
        ["triangles short of a triangle", { triangles: new Int32Array(3) }, "triangles"],
        ["a face centre missing", { faceCentres: new Float64Array(7) }, "faceCentres"],
        ["an edge sample missing", { edgePoints: new Float64Array(12) }, "edgePoints"],
        ["an edge middle missing", { edgeMiddles: new Float64Array(3) }, "edgeMiddles"],
        ["a face record cut short", { faces: new Int32Array([0, 3, 1, 1, 1]) }, "faces"],
        ["an edge record cut short", { edges: new Int32Array([0, 2, 1, 3, 2]) }, "edges"],
        ["a vertex cut short", { vertices: new Float64Array(4) }, "vertices"],
    ] as [string, Partial<MeshArrays>, string][])("refuses arrays that disagree with their records, naming the array: %s", (_name, broken, array) => {
        // Arrange
        const input = consistent(broken);

        // Act
        const decode = (): unknown => decodeMeshArrays(input);

        // Assert
        expect(decode).toThrow(`the kernel's mesh buffers disagree with their records: ${array} holds`);
    });
});

describe("decodeMeshArrays with colours and metadata", () => {
    function withMetadata(overrides: Partial<MeshArrays> = {}): MeshArrays {
        return consistent({
            faceMetadata: new Float64Array([12, 1, 2, 3, 1e-7, 40, 7.5, 4, 5, 6, 2e-7, 41]),
            faceTypes: new Int32Array([0, 2, 6, 1]),
            faceAdjacency: new Int32Array([1, 5, 0]),
            edgeMetadata: new Float64Array([3.5, 0, 0, 1, 50, 2, 1, 1, 1, -1]),
            edgeTypes: new Int32Array([1, 1, 2, 0, 0, 1]),
            edgeIncidence: new Int32Array([0, 1, 1]),
            ...overrides,
        });
    }

    it("adds each face's metadata after its geometry, in the order the kernel's JSON writes it", () => {
        // Arrange
        const input = withMetadata();

        // Act
        const mesh = decodeMeshArrays(input, { colors: false, metadata: true });

        // Assert
        expect(Object.keys(mesh.faceList[0]!)).toEqual(["faceIndex", "vertexCoord", "vertexCoordVec", "uvs", "normalCoord", "triIndexes", "numberOfTriangles", "centerPoint", "centerNormal", "area", "centerOfMass", "surfaceType", "tolerance", "adjacentFaces", "faceUid"]);
        expect(mesh.faceList.map(face => [face.area, face.centerOfMass, face.surfaceType, face.tolerance, face.adjacentFaces, face.faceUid])).toEqual([
            [12, [1, 2, 3], "Plane", 1e-7, [1, 5], 40],
            [7.5, [4, 5, 6], "BSplineSurface", 2e-7, [0], 41],
        ]);
    });

    it("adds each edge's metadata after its samples, in the order the kernel's JSON writes it", () => {
        // Arrange
        const input = withMetadata();

        // Act
        const mesh = decodeMeshArrays(input, { colors: false, metadata: true });

        // Assert
        expect(Object.keys(mesh.edgeList[0]!)).toEqual(["edgeIndex", "middlePoint", "vertexCoord", "length", "centerOfMass", "curveType", "degenerated", "incidentFaces", "edgeUid"]);
        expect(mesh.edgeList.map(edge => [edge.length, edge.centerOfMass, edge.curveType, edge.degenerated, edge.incidentFaces, edge.edgeUid])).toEqual([
            [3.5, [0, 0, 1], "Circle", true, [0, 1], 50],
            [2, [1, 1, 1], "Line", false, [1], -1],
        ]);
    });

    it("leaves the metadata out unless it was asked for", () => {
        // Arrange
        const input = withMetadata();

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList[0]!.area).toBeUndefined();
        expect(mesh.edgeList[0]!.length).toBeUndefined();
        expect("colorGroups" in mesh).toBe(false);
    });

    it("groups coloured faces by their #rrggbbaa colour, colours sorted and faces in face order", () => {
        // Arrange
        const input = consistent({
            faces: new Int32Array([0, 1, 0, 0, 3, 1, 0, 0, 7, 1, 0, 0, 9, 1, 0, 0]),
            positions: new Float64Array(12),
            normals: new Float64Array(12),
            uvs: new Float64Array(0),
            triangles: new Int32Array(0),
            faceCentres: new Float64Array(28),
            faceColors: new Int32Array([1, 255, 0, 0, 255, 0, 9, 9, 9, 9, 1, 0, 16, 32, 128, 1, 255, 0, 0, 255]),
        });

        // Act
        const mesh = decodeMeshArrays(input, { colors: true, metadata: false });

        // Assert
        expect(Object.keys(mesh)).toEqual(["faceList", "edgeList", "pointsList", "colorGroups"]);
        expect(Object.keys(mesh.colorGroups!)).toEqual(["#00102080", "#ff0000ff"]);
        expect(mesh.colorGroups).toEqual({ "#00102080": [7], "#ff0000ff": [0, 9] });
    });

    it("gives a document without colours an empty list of colour groups", () => {
        // Arrange
        const input = consistent({ faceColors: new Int32Array(10) });

        // Act
        const mesh = decodeMeshArrays(input, { colors: true, metadata: false });

        // Assert
        expect(mesh.colorGroups).toEqual({});
    });

    it.each([
        ["face metadata missing", { without: "faceMetadata" }, "faceMetadata is missing"],
        ["face types missing", { without: "faceTypes" }, "faceTypes is missing"],
        ["face neighbours missing", { without: "faceAdjacency" }, "faceAdjacency is missing"],
        ["edge metadata missing", { without: "edgeMetadata" }, "edgeMetadata is missing"],
        ["edge types missing", { without: "edgeTypes" }, "edgeTypes is missing"],
        ["edge faces missing", { without: "edgeIncidence" }, "edgeIncidence is missing"],
        ["a face metadata record cut short", { faceMetadata: new Float64Array(11) }, "faceMetadata holds 11 numbers where 12 were described"],
        ["a face type record cut short", { faceTypes: new Int32Array([0, 2, 6]) }, "faceTypes holds 3 numbers where 4 were described"],
        ["a neighbour too many", { faceAdjacency: new Int32Array([1, 5, 0, 3]) }, "faceAdjacency holds 4 numbers where 3 were described"],
        ["an edge metadata record cut short", { edgeMetadata: new Float64Array(9) }, "edgeMetadata holds 9 numbers where 10 were described"],
        ["an edge type record cut short", { edgeTypes: new Int32Array([1, 1, 2, 0, 0]) }, "edgeTypes holds 5 numbers where 6 were described"],
        ["an edge face missing", { edgeIncidence: new Int32Array([0, 1]) }, "edgeIncidence holds 2 numbers where 3 were described"],
        ["a surface type the JSON has no name for", { faceTypes: new Int32Array([11, 2, 6, 1]) }, "11 is not a surface type"],
        ["a curve type the JSON has no name for", { edgeTypes: new Int32Array([9, 1, 2, 0, 0, 1]) }, "9 is not a curve type"],
    ] as [string, Partial<MeshArrays> & { without?: keyof MeshArrays }, string][])("refuses metadata that disagrees with its records: %s", (_name, broken, message) => {
        // Arrange
        const { without, ...changes } = broken;
        const input = withMetadata(changes);
        if (without) {
            Reflect.deleteProperty(input, without);
        }

        // Act
        const decode = (): unknown => decodeMeshArrays(input, { colors: false, metadata: true });

        // Assert
        expect(decode).toThrow(`the kernel's mesh buffers disagree with their records: ${message}`);
    });

    it.each([
        ["missing", {}, "faceColors is missing"],
        ["cut short", { faceColors: new Int32Array(9) }, "faceColors holds 9 numbers where 10 were described"],
    ] as [string, Partial<MeshArrays>, string][])("refuses face colours that are %s", (_name, colours, message) => {
        // Arrange
        const input = consistent(colours);

        // Act
        const decode = (): unknown => decodeMeshArrays(input, { colors: true, metadata: false });

        // Assert
        expect(decode).toThrow(`the kernel's mesh buffers disagree with their records: ${message}`);
    });
});

describe("decodeMeshArrays with a surface analysis", () => {
    it("splits the values into their faces, in the order of each face's vertices", () => {
        // Arrange
        const input = consistent({ analysis: new Float64Array([0.5, NaN, 2, Infinity, 4, -6]) });

        // Act
        const mesh = decodeMeshArrays(input, { colors: false, metadata: false, analysis: true });

        // Assert
        expect(mesh.faceList.map(face => face.analysisValues)).toEqual([[0.5, NaN, 2], [Infinity, 4, -6]]);
        expect(mesh.faceList.map(face => face.analysisValues!.length)).toEqual(mesh.faceList.map(face => face.vertexCoord.length / 3));
    });

    it("writes the values after every other key of a face, metadata included", () => {
        // Arrange
        const input = consistent({
            analysis: new Float64Array(6),
            faceMetadata: new Float64Array(12),
            faceTypes: new Int32Array([0, 0, 0, 0]),
            faceAdjacency: new Int32Array(0),
            edgeMetadata: new Float64Array(10),
            edgeTypes: new Int32Array(6),
            edgeIncidence: new Int32Array(0),
        });

        // Act
        const mesh = decodeMeshArrays(input, { colors: false, metadata: true, analysis: true });

        // Assert
        expect(Object.keys(mesh.faceList[0]!)).toEqual(["faceIndex", "vertexCoord", "vertexCoordVec", "uvs", "normalCoord", "triIndexes", "numberOfTriangles", "centerPoint", "centerNormal", "area", "centerOfMass", "surfaceType", "tolerance", "adjacentFaces", "faceUid", "analysisValues"]);
    });

    it("leaves the values out unless they were asked for", () => {
        // Arrange
        const input = consistent({ analysis: new Float64Array(6) });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList.some(face => "analysisValues" in face)).toBe(false);
    });

    it.each([
        ["missing", {}, "analysis is missing"],
        ["one value short", { analysis: new Float64Array(5) }, "analysis holds 5 numbers where 6 were described"],
        ["one value too many", { analysis: new Float64Array(7) }, "analysis holds 7 numbers where 6 were described"],
    ] as [string, Partial<MeshArrays>, string][])("refuses values that are %s", (_name, values, message) => {
        // Arrange
        const input = consistent(values);

        // Act
        const decode = (): unknown => decodeMeshArrays(input, { colors: false, metadata: false, analysis: true });

        // Assert
        expect(decode).toThrow(`the kernel's mesh buffers disagree with their records: ${message}`);
    });
});

describe("decodePolylines", () => {
    const coordinates = new Float64Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);

    it("cuts the points into polylines of the counts given, in order", () => {
        // Act
        const polylines = decodePolylines(coordinates, new Int32Array([2, 3]), false);

        // Assert
        expect(polylines).toEqual([[[0, 1, 2], [3, 4, 5]], [[6, 7, 8], [9, 10, 11], [12, 13, 14]]]);
    });

    it("trades each point's Y and Z when asked to", () => {
        // Act
        const polylines = decodePolylines(coordinates, new Int32Array([2, 3]), true);

        // Assert
        expect(polylines).toEqual([[[0, 2, 1], [3, 5, 4]], [[6, 8, 7], [9, 11, 10], [12, 14, 13]]]);
    });

    it("gives no polylines for no counts", () => {
        // Act
        const polylines = decodePolylines(new Float64Array(0), new Int32Array(0), true);

        // Assert
        expect(polylines).toEqual([]);
    });

    it.each([
        ["short of a point", new Int32Array([2, 4]), "the points hold 15 numbers where 18 were described"],
        ["past the last point", new Int32Array([2, 2]), "the points hold 15 numbers where 12 were described"],
    ])("refuses points %s", (_name, counts, message) => {
        // Act
        const decode = (): unknown => decodePolylines(coordinates, counts, false);

        // Assert
        expect(decode).toThrow(`the kernel's iso curves disagree with their counts: ${message}`);
    });
});
