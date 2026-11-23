import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { InputError } from "@bitbybit-dev/base";
import { shapeInModelAxes } from "./base/file-axes";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = number[];
type System = Inputs.Base.coordinateSystemEnum | undefined;
type Mesh = Inputs.OCCT.DecomposedMeshDto;

const SYSTEMS: [string, System][] = [["no coordinate system", undefined], ["a left-handed system", leftHanded], ["a right-handed system", rightHanded]];
const UP_SETTINGS: [string, boolean][] = [["as the model is", false], ["for a tool with z up", true]];
const CASES = SYSTEMS.flatMap(([systemName, system]) => UP_SETTINGS.map(([upName, adjustYtoZ]): [string, string, System, boolean] => [systemName, upName, system, adjustYtoZ]));

const rounded = (point: Point): Point => point.map(value => Math.round(value * 1e4) / 1e4 + 0);
const inTriples = (flat: number[]): Point[] => Array.from({ length: flat.length / 3 }, (_point, at) => flat.slice(at * 3, at * 3 + 3));
const sorted = (points: Point[]): string[] => points.map(point => JSON.stringify(rounded(point))).sort();
const distinct = (points: Point[]): string[] => [...new Set(sorted(points))];

describe("OCCT document meshes: which axis lands where", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let occHelper: OccHelper;
    const documents: Handle_TDocStd_Document[] = [];

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        vi.restoreAllMocks();
        occHelper.base.settings = {};
        while (documents.length) {
            documents.pop()!.delete();
        }
    });

    const inSystem = (system: System): void => {
        occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };
    };
    const marker = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 1, length: 0.6, height: 0.4, center: [3, 5, 7] });
    const documentOf = (shape: TopoDS_Shape): Handle_TDocStd_Document => {
        const manager = occt.assembly.manager;
        const structure = manager.combineStructure({
            parts: [manager.createPart({ id: "marker", shape, name: "Marker" })],
            nodes: [manager.createInstanceNode({ id: "marker-1", partId: "marker", name: "Marker 1" })],
            clearDocument: false,
        });
        const document = manager.buildAssemblyDocument({ structure });
        documents.push(document);
        return document;
    };
    const volumeOf = (mesh: Mesh): number => {
        const triangles = mesh.faceList.flatMap((face) => {
            const corners = inTriples(face.vertexCoord);
            return inTriples(face.triIndexes).map(triangle => triangle.map(corner => corners[corner]!) as Inputs.Base.Triangle3);
        });
        return Math.round(occHelper.base.mesh.signedVolume({ mesh: triangles }) * 1e4) / 1e4;
    };
    const readingOf = (mesh: Mesh): Record<string, unknown> => ({
        corners: distinct(mesh.faceList.flatMap(face => inTriples(face.vertexCoord))),
        cornersAsVectors: distinct(mesh.faceList.flatMap(face => face.vertexCoordVec)),
        normalsAtCorners: distinct(mesh.faceList.flatMap((face) => {
            const normals = inTriples(face.normalCoord);
            return inTriples(face.vertexCoord).map((corner, at) => [...corner, ...normals[at]!]);
        })),
        faceCentres: sorted(mesh.faceList.map(face => [...face.centerPoint, ...face.centerNormal])),
        faceMasses: sorted(mesh.faceList.map(face => [...face.centerOfMass!, face.area!])),
        edgeMiddles: sorted(mesh.edgeList.map(edge => edge.middlePoint)),
        edgePoints: distinct(mesh.edgeList.flatMap(edge => edge.vertexCoord)),
        edgeMasses: sorted(mesh.edgeList.map(edge => [...edge.centerOfMass!, edge.length!])),
        volume: volumeOf(mesh),
    });

    it.each(CASES)("should mesh a document in %s, %s, as it meshes the shape the document holds", (_system, _up, system, adjustYtoZ) => {
        // Arrange
        inSystem(system);
        const shape = marker();
        const document = documentOf(shape);

        // Act
        const ofDocument = occt.docToMesh({ document, precision: 0.01, adjustYtoZ, computeMetadata: true });
        const ofEachShape = occt.docToMeshes({ document, precision: 0.01, adjustYtoZ, computeMetadata: true });

        // Assert
        const ofShape = readingOf(occt.shapeToMesh({ shape, precision: 0.01, adjustYtoZ, computeMetadata: true }));
        expect(readingOf(ofDocument)).toEqual(ofShape);
        expect(ofEachShape.map(readingOf)).toEqual([ofShape]);
    });

    it.each([
        ["no coordinate system", undefined, [3, 7, 5]],
        ["a left-handed system", leftHanded, [3, 7, 5]],
        ["a right-handed system", rightHanded, [3, -7, 5]],
    ] as [string, System, Point][])("should stand a document's mesh for a tool with z up in %s where the table says", (_name, system, centre) => {
        // Arrange
        inSystem(system);
        const document = documentOf(marker());

        // Act
        const mesh = occt.docToMesh({ document, precision: 0.01, adjustYtoZ: true });

        // Assert
        const corners = mesh.faceList.flatMap(face => inTriples(face.vertexCoord));
        expect(rounded([0, 1, 2].map(axis => (Math.min(...corners.map(corner => corner[axis]!)) + Math.max(...corners.map(corner => corner[axis]!))) / 2))).toEqual(centre);
    });

    it("should keep a document's colours and its faces' order through the turn of a right-handed system", () => {
        // Arrange
        const manager = occt.assembly.manager;
        const structure = manager.combineStructure({
            parts: [manager.createPart({ id: "marker", shape: marker(), name: "Marker", colorRgba: { r: 1, g: 0, b: 0, a: 1 } })],
            nodes: [manager.createInstanceNode({ id: "marker-1", partId: "marker", name: "Marker 1" })],
            clearDocument: false,
        });
        const document = manager.buildAssemblyDocument({ structure });
        documents.push(document);
        const asModelled = occt.docToMesh({ document, precision: 0.01, adjustYtoZ: false, computeMetadata: true });
        inSystem(rightHanded);

        // Act
        const turned = occt.docToMesh({ document, precision: 0.01, adjustYtoZ: true, computeMetadata: true });

        // Assert
        expect(turned.colorGroups).toEqual(asModelled.colorGroups);
        expect(Object.keys(turned.colorGroups ?? {})).toHaveLength(1);
        expect(turned.faceList.map(face => [face.faceIndex, face.triIndexes, face.uvs, face.faceUid, face.adjacentFaces])).toEqual(asModelled.faceList.map(face => [face.faceIndex, face.triIndexes, face.uvs, face.faceUid, face.adjacentFaces]));
        expect(turned.edgeList.map(edge => [edge.edgeIndex, edge.edgeUid, edge.incidentFaces])).toEqual(asModelled.edgeList.map(edge => [edge.edgeIndex, edge.edgeUid, edge.incidentFaces]));
    });

    it("should turn a document's mesh the same way from a kernel that only gives its mesh as text", () => {
        // Arrange
        inSystem(rightHanded);
        const document = documentOf(marker());
        const fromBuffers = readingOf(occt.docToMesh({ document, precision: 0.01, adjustYtoZ: true, computeMetadata: true }));
        const buffers = Reflect.get(kernel, "DocumentToMeshBuffers") as unknown;
        const asText = vi.spyOn(kernel, "DocumentToMeshJson");
        const eachAsText = vi.spyOn(kernel, "DocumentToMeshesJson");
        Reflect.set(kernel, "DocumentToMeshBuffers", undefined);

        // Act
        const meshes = ((): Mesh[] => {
            try {
                return [occt.docToMesh({ document, precision: 0.01, adjustYtoZ: true, computeMetadata: true }), ...occt.docToMeshes({ document, precision: 0.01, adjustYtoZ: true, computeMetadata: true })];
            } finally {
                Reflect.set(kernel, "DocumentToMeshBuffers", buffers);
            }
        })();

        // Assert
        expect([asText.mock.calls.length, eachAsText.mock.calls.length]).toEqual([1, 1]);
        expect(meshes.map(readingOf)).toEqual([fromBuffers, fromBuffers]);
    });

    it("should hand back what the kernel answers a document it could not mesh, as it is, in a right-handed system", () => {
        // Arrange
        const document = documentOf(marker());
        const refused = occt.docToMesh({ document, precision: 0, adjustYtoZ: true });
        inSystem(rightHanded);

        // Act
        const mesh = occt.docToMesh({ document, precision: 0, adjustYtoZ: true });
        const meshes = occt.docToMeshes({ document, precision: 0, adjustYtoZ: true });

        // Assert
        expect(Object.keys(refused)).toEqual(["error"]);
        expect(Object.keys(mesh)).toEqual(["error"]);
        expect(meshes.map(each => Object.keys(each))).toEqual([["error"]]);
    });

    it("should leave the mesh it was asked for alone when the model's own axes are wanted in a right-handed system", () => {
        // Arrange
        const document = documentOf(marker());
        const before = readingOf(occt.docToMesh({ document, precision: 0.01, adjustYtoZ: false, computeMetadata: true }));
        inSystem(rightHanded);

        // Act
        const mesh = occt.docToMesh({ document, precision: 0.01, adjustYtoZ: false, computeMetadata: true });

        // Assert
        expect(readingOf(mesh)).toEqual(before);
    });

    it.each([
        ["no coordinate system", undefined, [3, 7, 5]],
        ["a left-handed system", leftHanded, [3, 7, 5]],
        ["a right-handed system", rightHanded, [3, 7, -5]],
    ] as [string, System, Point][])("should stand a Z-up document Y-up in %s as io.loadSTEPorIGES turns the shape it reads, facing out", (_name, system, centre) => {
        // Arrange
        inSystem(system);
        const document = documentOf(marker());
        const loaded = shapeInModelAxes(occHelper, marker(), true);

        // Act
        const mesh = occt.docToMesh({ document, precision: 0.01, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp, computeMetadata: true });
        const meshes = occt.docToMeshes({ document, precision: 0.01, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp, computeMetadata: true });

        // Assert
        const corners = mesh.faceList.flatMap(face => inTriples(face.vertexCoord));
        expect(rounded([0, 1, 2].map(axis => (Math.min(...corners.map(corner => corner[axis]!)) + Math.max(...corners.map(corner => corner[axis]!))) / 2))).toEqual(centre);
        expect(readingOf(mesh)).toEqual(readingOf(occt.shapeToMesh({ shape: loaded, precision: 0.01, computeMetadata: true })));
        expect(meshes.map(readingOf)).toEqual([readingOf(mesh)]);
        expect(volumeOf(mesh)).toBeCloseTo(0.24, 4);
    });

    it("should refuse turning a document both ways at once", () => {
        // Arrange
        const document = documentOf(marker());

        // Act
        const both = (): Mesh => occt.docToMesh({ document, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp, adjustYtoZ: true });

        // Assert
        expect(both).toThrow(InputError);
        expect(both).toThrow("`upAxis`");
        expect(both).toThrow("`adjustYtoZ`");
    });
});
