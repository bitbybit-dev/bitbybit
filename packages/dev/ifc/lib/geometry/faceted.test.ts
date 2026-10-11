import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import type { IfcModel } from "../model/model-types";
import { withContext } from "../__test__/geometry-fixtures";
import { UnsupportedGeometryError } from "./errors";
import { INWARD, MeshCollector, OUTWARD, UNORIENTED, concatenated, zeroBased } from "./faceted";
import type { TriangleMesh } from "./geometry-types";

const CUBE_CORNERS = [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0], [0, 0, 2], [2, 0, 2], [2, 2, 2], [0, 2, 2]];
const OUTWARD_FACES = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [0, 4, 7, 3], [1, 2, 6, 5]];
const CUBE_SHELL = 126;

interface CubeOptions {
    readonly first?: number;
    readonly scale?: number;
    readonly offset?: number;
    readonly faces?: readonly (readonly number[])[];
    readonly orientation?: string;
    readonly bound?: string;
    readonly shell?: string;
}

function cubeRows(options: CubeOptions = {}): string[] {
    const first = options.first ?? 100;
    const scale = options.scale ?? 1;
    const offset = options.offset ?? 0;
    const faces = options.faces ?? OUTWARD_FACES;
    const points = CUBE_CORNERS.map((corner, at) => `#${first + at}=IFCCARTESIANPOINT((${corner.map((value) => `${value * scale + offset}.`).join(",")}));`);
    const faceRows = faces.flatMap((face, at) => {
        const loop = first + 8 + at * 3;
        return [
            `#${loop}=IFCPOLYLOOP((${face.map((corner) => `#${first + corner}`).join(",")}));`,
            `#${loop + 1}=${options.bound ?? "IFCFACEOUTERBOUND"}(#${loop},${options.orientation ?? ".T."});`,
            `#${loop + 2}=IFCFACE((#${loop + 1}));`,
        ];
    });
    const faceIds = faces.map((_, at) => `#${first + 10 + at * 3}`).join(",");
    return [...points, ...faceRows, `#${first + 26}=${options.shell ?? "IFCCLOSEDSHELL"}((${faceIds}));`];
}

function collected(model: IfcModel, shells: readonly [number, number][]): TriangleMesh {
    const collector = new MeshCollector(modelOf(model));
    shells.forEach(([shell, sense]) => collector.shell(shell, sense));
    return collector.mesh;
}

function directedEdges(indices: readonly number[]): string[] {
    const edges: string[] = [];
    for (let at = 0; at < indices.length; at += 3) {
        const [a, b, c] = [indices[at]!, indices[at + 1]!, indices[at + 2]!];
        edges.push(`${a}>${b}`, `${b}>${c}`, `${c}>${a}`);
    }
    return edges;
}

function isClosed(indices: readonly number[]): boolean {
    const edges = directedEdges(indices);
    const set = new Set(edges);
    return set.size === edges.length && edges.every((edge) => {
        const [a, b] = edge.split(">");
        return set.has(`${b}>${a}`);
    });
}

function volume(mesh: TriangleMesh): number {
    const p = mesh.positions;
    let sum = 0;
    for (let at = 0; at < mesh.indices.length; at += 3) {
        const [a, b, c] = [mesh.indices[at]! * 3, mesh.indices[at + 1]! * 3, mesh.indices[at + 2]! * 3];
        sum += p[a]! * (p[b + 1]! * p[c + 2]! - p[b + 2]! * p[c + 1]!)
            - p[a + 1]! * (p[b]! * p[c + 2]! - p[b + 2]! * p[c]!)
            + p[a + 2]! * (p[b]! * p[c + 1]! - p[b + 1]! * p[c]!);
    }
    return sum / 6;
}

describe("MeshCollector", () => {
    it("should turn a closed shell of quads into a closed mesh that shares its corners", () => {
        // Arrange
        const model = withContext(cubeRows());

        // Act
        const mesh = collected(model, [[CUBE_SHELL, OUTWARD]]);

        // Assert
        expect(mesh.positions).toHaveLength(24);
        expect(mesh.indices).toHaveLength(36);
        expect(isClosed(mesh.indices)).toBe(true);
        expect(volume(mesh)).toBeCloseTo(8, 12);
    });

    it("should turn a shell whose faces all point inwards the right way round", () => {
        // Arrange
        const model = withContext(cubeRows({ faces: OUTWARD_FACES.map((face) => [...face].reverse()) }));

        // Act
        const outward = collected(model, [[CUBE_SHELL, OUTWARD]]);
        const unoriented = collected(model, [[CUBE_SHELL, UNORIENTED]]);

        // Assert
        expect(volume(outward)).toBeCloseTo(8, 12);
        expect(volume(unoriented)).toBeCloseTo(-8, 12);
    });

    it("should run a loop backwards when its bound says it disagrees with its face", () => {
        // Arrange
        const model = withContext(cubeRows({ faces: OUTWARD_FACES.map((face) => [...face].reverse()), orientation: ".F." }));

        // Act
        const mesh = collected(model, [[CUBE_SHELL, UNORIENTED]]);

        // Assert
        expect(volume(mesh)).toBeCloseTo(8, 12);
        expect(isClosed(mesh.indices)).toBe(true);
    });

    it("should hollow a void shell out of the outer one, facing into the void", () => {
        // Arrange
        const model = withContext([...cubeRows({ scale: 3 }), ...cubeRows({ first: 200, offset: 2 })]);

        // Act
        const mesh = collected(model, [[CUBE_SHELL, OUTWARD], [226, INWARD]]);

        // Assert
        expect(volume(mesh)).toBeCloseTo(216 - 8, 9);
        expect(isClosed(mesh.indices)).toBe(true);
        expect(mesh.positions).toHaveLength(48);
    });

    it("should take separate points at the same place as one vertex, so the faces meeting there join", () => {
        // Arrange
        const rows = cubeRows();
        const duplicated = [...rows, "#300=IFCCARTESIANPOINT((2.,2.,2.));", "#301=IFCPOLYLOOP((#101,#102,#300,#105));"]
            .map((row) => (row.startsWith("#124=") ? "#124=IFCFACEOUTERBOUND(#301,.T.);" : row));

        // Act
        const mesh = collected(withContext(duplicated), [[CUBE_SHELL, OUTWARD]]);

        // Assert
        expect(mesh.positions).toHaveLength(24);
        expect(isClosed(mesh.indices)).toBe(true);
    });

    it("should take the largest loop as the outer one when no bound says which it is", () => {
        // Arrange
        const model = withContext([
            "#100=IFCCARTESIANPOINT((0.,0.,0.));",
            "#101=IFCCARTESIANPOINT((4.,0.,0.));",
            "#102=IFCCARTESIANPOINT((4.,4.,0.));",
            "#103=IFCCARTESIANPOINT((0.,4.,0.));",
            "#104=IFCCARTESIANPOINT((1.,1.,0.));",
            "#105=IFCCARTESIANPOINT((3.,1.,0.));",
            "#106=IFCCARTESIANPOINT((3.,3.,0.));",
            "#107=IFCCARTESIANPOINT((1.,3.,0.));",
            "#110=IFCPOLYLOOP((#107,#106,#105,#104));",
            "#111=IFCFACEBOUND(#110,.T.);",
            "#112=IFCPOLYLOOP((#100,#101,#102,#103));",
            "#113=IFCFACEBOUND(#112,.T.);",
            "#114=IFCFACE((#111,#113));",
            "#115=IFCOPENSHELL((#114));",
        ]);

        // Act
        const mesh = collected(model, [[115, UNORIENTED]]);

        // Assert
        expect(mesh.indices).toHaveLength(24);
        expect(volume(mesh)).toBeCloseTo(0, 12);
    });

    it("should refuse a face bounded by anything but a poly loop, and a shell whose faces are not references", () => {
        // Arrange
        const model = withContext([
            "#100=IFCCARTESIANPOINT((0.,0.,0.));",
            "#101=IFCVERTEXPOINT(#100);",
            "#102=IFCVERTEXLOOP(#101);",
            "#103=IFCFACEOUTERBOUND(#102,.T.);",
            "#104=IFCFACE((#103));",
            "#105=IFCOPENSHELL((#104));",
            "#106=IFCFACEOUTERBOUND($,.T.);",
            "#107=IFCFACE((#106));",
            "#108=IFCOPENSHELL((#107));",
            "#109=IFCOPENSHELL(('face'));",
            "#110=IFCOPENSHELL($);",
        ]);

        // Act & Assert
        expect(() => collected(model, [[105, OUTWARD]])).toThrow("A face bounded by an IfcVertexLoop is not supported yet");
        expect(() => collected(model, [[108, OUTWARD]])).toThrow("#106 has no loop");
        expect(() => collected(model, [[109, OUTWARD]])).toThrow("#109 CfsFaces holds something other than a reference");
        expect(() => collected(model, [[110, OUTWARD]])).toThrow("#110 CfsFaces is not a list");
    });

    it("should read a polygonal face set's faces and holes through its point index, and turn a closed one outwards", () => {
        // Arrange
        const coordinates = CUBE_CORNERS.map((corner) => `(${corner.map((value) => `${value}.`).join(",")})`).join(",");
        const faces = OUTWARD_FACES.map((face, at) => `#${110 + at}=IFCINDEXEDPOLYGONALFACE((${[...face].reverse().map((corner) => corner + 1).join(",")}));`);
        const model = withContext([
            `#100=IFCCARTESIANPOINTLIST3D((${coordinates}));`,
            ...faces,
            "#120=IFCPOLYGONALFACESET(#100,.T.,(#110,#111,#112,#113,#114,#115),$);",
            "#121=IFCPOLYGONALFACESET(#100,.T.,(#110,#111,#112,#113,#114,#115),(1,2,3,4,5,6,7,8));",
            "#122=IFCPOLYGONALFACESET(#100,$,(#110,#111,#112,#113,#114,#115),$);",
        ]);

        // Act
        const meshes = [120, 121, 122].map((item) => {
            const collector = new MeshCollector(modelOf(model));
            collector.polygonalFaces(item);
            return collector.mesh;
        });

        // Assert
        expect(volume(meshes[0]!)).toBeCloseTo(8, 12);
        expect(volume(meshes[1]!)).toBeCloseTo(8, 12);
        expect(volume(meshes[2]!)).toBeCloseTo(-8, 12);
        expect(isClosed(meshes[0]!.indices)).toBe(true);
    });

    it("should leave the hole of an indexed polygonal face open", () => {
        // Arrange
        const model = withContext([
            "#100=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(4.,0.,0.),(4.,4.,0.),(0.,4.,0.),(1.,1.,0.),(3.,1.,0.),(3.,3.,0.),(1.,3.,0.)));",
            "#101=IFCINDEXEDPOLYGONALFACEWITHVOIDS((1,2,3,4),((8,7,6,5)));",
            "#102=IFCPOLYGONALFACESET(#100,.F.,(#101),$);",
            "#103=IFCPOLYGONALFACESET(#100,.F.,(#101),(1,2,3));",
        ]);
        const collector = new MeshCollector(modelOf(model));

        // Act
        collector.polygonalFaces(102);

        // Assert
        expect(collector.mesh.indices).toHaveLength(24);
        expect(() => new MeshCollector(modelOf(model)).polygonalFaces(103)).toThrow("#101 CoordIndex names 4, outside the 3 entries of PnIndex");
    });

    it("should refuse a polygonal face set without coordinates", () => {
        // Arrange
        const model = withContext(["#100=IFCPOLYGONALFACESET($,.T.,(),$);"]);

        // Act & Assert
        expect(() => new MeshCollector(modelOf(model)).polygonalFaces(100)).toThrow("#100 has no coordinates");
    });
});

describe("zeroBased", () => {
    it("should turn one-based indices into zero-based ones and refuse any outside the count or not whole", () => {
        // Act & Assert
        expect(zeroBased([1, 3, 2], 3, "loop", "points")).toEqual([0, 2, 1]);
        expect(() => zeroBased([0], 3, "loop", "points")).toThrow("loop names 0, outside the 3 points");
        expect(() => zeroBased([1.5], 3, "loop", "points")).toThrow(UnsupportedGeometryError);
        expect(() => zeroBased("1", 3, "loop", "points")).toThrow("loop is not a list of indices");
    });
});

describe("concatenated", () => {
    it("should lay meshes one after another, moving each one's indices past the corners before it", () => {
        // Arrange
        const first: TriangleMesh = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] };
        const second: TriangleMesh = { positions: [5, 5, 5, 6, 5, 5, 5, 6, 5, 5, 5, 6], indices: [0, 1, 2, 0, 2, 3] };

        // Act
        const mesh = concatenated([first, second]);

        // Assert
        expect(mesh.positions).toEqual([...first.positions, ...second.positions]);
        expect(mesh.indices).toEqual([0, 1, 2, 3, 4, 5, 3, 5, 6]);
        expect(first.indices).toEqual([0, 1, 2]);
    });
});
