import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = number[];

const loose = <T>(value: unknown): T => value as T;

const rounded = (point: Point): Point => point.map(value => Math.round(value * 1e4) / 1e4 + 0);

const centreOf = (points: Point[]): Point => rounded([0, 1, 2].map(axis => {
    const values = points.map(point => point[axis]!);
    return (Math.min(...values) + Math.max(...values)) / 2;
}));

const stlPoints = (stl: string | Uint8Array): Point[] => {
    if (typeof stl !== "string") {
        throw new Error("expected the STL file as ASCII text");
    }
    return [...stl.matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);
};

const objPoints = (obj: string): Point[] => [...obj.matchAll(/^v\s+(\S+)\s+(\S+)\s+(\S+)/gm)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);

const plyPoints = (ply: string): Point[] => {
    const lines = ply.split(/\r?\n/);
    const count = Number(lines.find(line => line.startsWith("element vertex"))!.split(/\s+/)[2]);
    const start = lines.indexOf("end_header") + 1;
    return lines.slice(start, start + count).map(line => line.trim().split(/\s+/).slice(0, 3).map(Number));
};

const TOP_VIEW: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

const squareDrawing = (x: number, y: number, elevation = 0): string => [
    "0", "SECTION", "2", "ENTITIES",
    "0", "LWPOLYLINE", "8", "0", "90", "4", "70", "1", "38", String(elevation),
    ...[[x - 0.5, y - 0.5], [x + 0.5, y - 0.5], [x + 0.5, y + 0.5], [x - 0.5, y + 0.5]].flatMap(([px, py]) => ["10", String(px), "20", String(py)]),
    "0", "ENDSEC", "0", "EOF",
].join("\n");

describe("OCCT io: which axis lands where", () => {
    let occt: OCCTService;
    let occHelper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
    });

    const marker = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 1, length: 0.6, height: 0.4, center: [3, 5, 7] });
    const centreOfShape = (shape: TopoDS_Shape | undefined): Point => {
        if (shape === undefined) {
            throw new Error("expected the file to load");
        }
        return rounded(occt.operations.boundingBoxOfShape({ shape }).center);
    };
    const stepAsBuilt = (): string => occt.io.saveShapeSTEP({ shape: marker(), fileName: "marker.step", adjustYtoZ: false, tryDownload: false });
    const stlAsBuilt = (): string | Uint8Array => occt.io.saveShapeStl({ shape: marker(), fileName: "marker.stl", precision: 0.01, adjustYtoZ: false, tryDownload: false });

    describe("mesh files written", () => {
        it.each([
            ["as built", false, [3, 5, 7]],
            ["with Y and Z swapped", true, [3, 7, 5]],
        ])("should write an STL %s", (_name, adjustYtoZ, expected) => {
            // Act
            const stl = occt.io.saveShapeStl({ shape: marker(), fileName: "marker.stl", precision: 0.01, adjustYtoZ, tryDownload: false });

            // Assert
            expect(centreOf(stlPoints(stl))).toEqual(expected);
        });

        it.each([
            ["as built", false, [3, 5, 7]],
            ["with Y and Z swapped", true, [3, 7, 5]],
        ])("should write an OBJ %s", (_name, adjustYtoZ, expected) => {
            // Act
            const files = occt.io.saveShapeObj({ shape: marker(), fileName: "marker.obj", adjustYtoZ, tryDownload: false });

            // Assert
            expect(centreOf(objPoints(files.obj))).toEqual(expected);
        });

        it.each([
            ["as built", false, [3, 5, 7]],
            ["with Y and Z swapped", true, [3, 7, 5]],
        ])("should write a PLY %s", (_name, adjustYtoZ, expected) => {
            // Act
            const ply = occt.io.saveShapePly({ shape: marker(), fileName: "marker.ply", adjustYtoZ, tryDownload: false });

            // Assert
            expect(centreOf(plyPoints(ply))).toEqual(expected);
        });
    });

    describe("files read", () => {
        it.each([
            ["as written", false, [3, 5, 7]],
            ["with Y and Z swapped", true, [3, 7, 5]],
        ])("should read a STEP %s", (_name, adjustZtoY, expected) => {
            // Act
            const loaded = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", adjustZtoY });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it.each([
            ["as written", false, [3, 5, 7]],
            ["with Y and Z swapped", true, [3, 7, 5]],
        ])("should read an STL %s", (_name, adjustZtoY, expected) => {
            // Act
            const loaded = occt.io.loadStl({ stlData: stlAsBuilt(), asFaces: true, adjustZtoY });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it("should swap a STEP read with the defaults, so one written with the defaults comes back swapped", () => {
            // Act
            const loaded = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step" });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 7, 5]);
        });
    });

    describe("STEP under the coordinate system switch", () => {
        const savedCentre = (options: { adjustYtoZ: boolean, fromRightHanded?: boolean }): Point => {
            const step = occt.io.saveShapeSTEP({ shape: marker(), fileName: "marker.step", tryDownload: false, ...options });
            const settings = occHelper.base.settings;
            occHelper.base.settings = {};
            try {
                return centreOfShape(occt.io.loadSTEPorIGES({ filetext: step, fileName: "marker.step", adjustZtoY: false }));
            } finally {
                occHelper.base.settings = settings;
            }
        };

        it.each([
            ["swap Y and Z for a Z-up file in a left-handed system", leftHanded, true, [3, 7, 5]],
            ["turn a Z-up file a quarter about X in a right-handed system", rightHanded, true, [3, -7, 5]],
            ["mirror X for a Y-up file in a left-handed system", leftHanded, false, [-3, 5, 7]],
            ["write a Y-up file as built in a right-handed system", rightHanded, false, [3, 5, 7]],
        ])("should %s when saving", (_name, system, adjustYtoZ, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const centre = savedCentre({ adjustYtoZ });

            // Assert
            expect(centre).toEqual(expected);
        });

        it("should turn, not swap, a left-handed save that sets fromRightHanded itself", () => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: leftHanded };

            // Act
            const centre = savedCentre({ adjustYtoZ: true, fromRightHanded: true });

            // Assert
            expect(centre).toEqual([3, -7, 5]);
        });

        it.each([
            ["swap Y and Z of a Z-up file in a left-handed system", leftHanded, true, [3, 7, 5]],
            ["turn a Z-up file a quarter back about X in a right-handed system", rightHanded, true, [3, 7, -5]],
            ["mirror X of a Y-up file in a left-handed system", leftHanded, false, [-3, 5, 7]],
            ["read a Y-up file as written in a right-handed system", rightHanded, false, [3, 5, 7]],
        ])("should %s when loading", (_name, system, adjustZtoY, expected) => {
            // Arrange
            const file = stepAsBuilt();
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const loaded = occt.io.loadSTEPorIGES({ filetext: file, fileName: "marker.step", adjustZtoY });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it.each([
            ["left-handed", leftHanded, true],
            ["left-handed", leftHanded, false],
            ["right-handed", rightHanded, true],
            ["right-handed", rightHanded, false],
        ])("should bring a %s save back where it was, a solid of the same volume, with the up flag %s", (_name, system, zUp) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const step = occt.io.saveShapeSTEP({ shape: marker(), fileName: "marker.step", adjustYtoZ: zUp, tryDownload: false });

            // Act
            const loaded = occt.io.loadSTEPorIGES({ filetext: step, fileName: "marker.step", adjustZtoY: zUp });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 5, 7]);
            expect(occt.shapes.solid.getSolidVolume({ shape: loaded! })).toBeCloseTo(1 * 0.6 * 0.4, 9);
        });
    });

    describe("mesh files under the coordinate system switch", () => {
        type Triangle = [Point, Point, Point];
        const SYSTEMS: [string, Inputs.Base.coordinateSystemEnum, boolean, Point][] = [
            ["a Z-up file in a left-handed system", leftHanded, true, [3, 7, 5]],
            ["a Z-up file in a right-handed system", rightHanded, true, [3, -7, 5]],
            ["a Y-up file in a left-handed system", leftHanded, false, [-3, 5, 7]],
            ["a Y-up file in a right-handed system", rightHanded, false, [3, 5, 7]],
        ];
        const facetsOf = (stl: string | Uint8Array): { normal: Point, triangle: Triangle }[] => {
            const numbers = stlPoints(stl);
            const normals = [...(stl as string).matchAll(/facet\s+normal\s+(\S+)\s+(\S+)\s+(\S+)/g)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);
            return normals.map((normal, at) => ({ normal, triangle: [numbers[at * 3]!, numbers[at * 3 + 1]!, numbers[at * 3 + 2]!] }));
        };
        const savedStl = (zUp: boolean, binary = false): string | Uint8Array => occt.io.saveShapeStl({ shape: marker(), fileName: "marker.stl", precision: 0.01, adjustYtoZ: zUp, binary, tryDownload: false });

        it.each(SYSTEMS)("should write an STL as %s", (_name, system, zUp, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const stl = savedStl(zUp);

            // Assert
            expect(centreOf(stlPoints(stl))).toEqual(expected);
        });

        it.each(SYSTEMS)("should keep the facets facing out, and their normals with them, in %s", (_name, system, zUp) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const { vector, mesh } = occHelper.base;

            // Act
            const facets = facetsOf(savedStl(zUp));

            // Assert
            expect(mesh.signedVolume({ mesh: facets.map(facet => facet.triangle) as Inputs.Base.Mesh3 })).toBeCloseTo(1 * 0.6 * 0.4, 6);
            const agreeing = facets.filter(({ normal, triangle: [a, b, c] }) => vector.dot({ first: normal, second: vector.cross({ first: vector.sub({ first: b, second: a }), second: vector.sub({ first: c, second: a }) }) }) > 0);
            expect(agreeing).toHaveLength(facets.length);
        });

        it.each(SYSTEMS)("should write an OBJ as %s", (_name, system, zUp, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const files = occt.io.saveShapeObj({ shape: marker(), fileName: "marker.obj", adjustYtoZ: zUp, tryDownload: false });

            // Assert
            expect(centreOf(objPoints(files.obj))).toEqual(expected);
        });

        it.each(SYSTEMS)("should write a PLY as %s", (_name, system, zUp, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const ply = occt.io.saveShapePly({ shape: marker(), fileName: "marker.ply", adjustYtoZ: zUp, tryDownload: false });

            // Assert
            expect(centreOf(plyPoints(ply))).toEqual(expected);
        });

        it.each([
            ["a Z-up file in a left-handed system", leftHanded, true, [3, 7, 5]],
            ["a Z-up file in a right-handed system", rightHanded, true, [3, 7, -5]],
            ["a Y-up file in a left-handed system", leftHanded, false, [-3, 5, 7]],
            ["a Y-up file in a right-handed system", rightHanded, false, [3, 5, 7]],
        ])("should read an STL as %s", (_name, system, zUp, expected) => {
            // Arrange
            const file = stlAsBuilt();
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const loaded = occt.io.loadStl({ stlData: file, asFaces: true, adjustZtoY: zUp });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
            occHelper.base.settings = {};
            const asLoaded = facetsOf(occt.io.saveShapeStl({ shape: loaded, fileName: "loaded.stl", precision: 0.01, adjustYtoZ: false, tryDownload: false }));
            expect(occHelper.base.mesh.signedVolume({ mesh: asLoaded.map(facet => facet.triangle) as Inputs.Base.Mesh3 })).toBeCloseTo(1 * 0.6 * 0.4, 6);
        });

        it.each(SYSTEMS.flatMap(([name, system, zUp]) => [[name, "text", system, zUp, false] as const, [name, "binary", system, zUp, true] as const]))("should bring %s back where it was, saved as %s", (_name, _kind, system, zUp, binary) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const stl = savedStl(zUp, binary);

            // Act
            const loaded = occt.io.loadStl({ stlData: stl, asFaces: true, adjustZtoY: zUp });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 5, 7]);
        });
    });

    describe("drawings under the coordinate system switch", () => {
        const SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"3\" y=\"5\" width=\"1\" height=\"0.5\"/></svg>";
        const groundSquare = (): TopoDS_Shape => occt.shapes.wire.createSquareWire({ size: 1, center: [3, 0, 5], direction: [0, 1, 0] });
        const BOTH: [string, Inputs.Base.coordinateSystemEnum][] = [["left-handed", leftHanded], ["right-handed", rightHanded]];

        it.each([
            ["+Z in a left-handed system", leftHanded, [3, 0, 5]],
            ["-Z in a right-handed system", rightHanded, [3, 0, -5]],
        ])("should lay a DXF drawing's y along %s", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const loaded = occt.io.loadDxf({ dxf: squareDrawing(3, 5) });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it.each([
            ["with no coordinate system", undefined, [3, 5, 5]],
            ["in a left-handed system", leftHanded, [3, 5, 5]],
            ["in a right-handed system", rightHanded, [3, 5, -5]],
        ] as [string, Inputs.Base.coordinateSystemEnum | undefined, Point][])("should stand a DXF drawing's elevation up along +Y, as the file's Z is up, %s", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };

            // Act
            const loaded = occt.io.loadDxf({ dxf: squareDrawing(3, 5, 5) });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it.each([
            ["with no coordinate system", undefined],
            ["in a left-handed system", leftHanded],
            ["in a right-handed system", rightHanded],
        ] as [string, Inputs.Base.coordinateSystemEnum | undefined][])("should face a DXF drawing's faces up along +Y, as they face the file's Z, %s", (_name, system) => {
            // Arrange
            occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };

            // Act
            const loaded = occt.io.loadDxf({ dxf: squareDrawing(3, 5), makeFaces: true });

            // Assert
            const [face] = occt.shapes.face.getFaces({ shape: loaded });
            expect(rounded(occt.shapes.face.normalOnUV({ shape: face!, paramU: 0.5, paramV: 0.5 }))).toEqual([0, 1, 0]);
        });

        it.each([
            ["-Z in a left-handed system", leftHanded, [3.5, 0, -5.25]],
            ["+Z in a right-handed system", rightHanded, [3.5, 0, 5.25]],
        ])("should lay an SVG's downward y along %s", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const loaded = occt.svg.loadSVG({ svg: SVG, keepOrigin: true });

            // Assert
            expect(centreOfShape(loaded)).toEqual(expected);
        });

        it.each([
            ["as it lies in a left-handed system", leftHanded, [3, 0, 5]],
            ["front to back in a right-handed system", rightHanded, [3, 0, -5]],
        ])("should read the ground as a drawing %s", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const drawing = occt.io.dxfCreate({ pathsParts: [occt.io.dxfPathsWithLayer({ paths: occt.io.shapeToDxfPaths({ shape: groundSquare() }), layer: "0", color: "#000000" })] });
            occHelper.base.settings = {};

            // Act
            const laidAsBefore = occt.io.loadDxf({ dxf: drawing });

            // Assert
            expect(centreOfShape(laidAsBefore)).toEqual(expected);
        });

        it.each(BOTH)("should bring an outline read from the ground back where it lay in a %s system", (_name, system) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const drawing = occt.io.dxfCreate({ pathsParts: [occt.io.dxfPathsWithLayer({ paths: occt.io.shapeToDxfPaths({ shape: groundSquare() }), layer: "0", color: "#000000" })] });

            // Act
            const loaded = occt.io.loadDxf({ dxf: drawing });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 0, 5]);
        });

        it.each(BOTH)("should read a top view back under the shape it shows in a %s system", (_name, system) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const view = occt.io.saveShapeDxf({ shape: marker(), frame: TOP_VIEW, drawHidden: false, precision: 0.01, fileName: "top.dxf", tryDownload: false });

            // Act
            const loaded = occt.io.loadDxf({ dxf: view });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 0, 7]);
        });

        it.each([
            ["with its y mirrored in a left-handed system", leftHanded, [3, 0, 7]],
            ["as the view has it in a right-handed system", rightHanded, [3, 0, -7]],
        ])("should draw a top view %s", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };
            const view = occt.io.saveShapeDxf({ shape: marker(), frame: TOP_VIEW, drawHidden: false, precision: 0.01, fileName: "top.dxf", tryDownload: false });
            occHelper.base.settings = {};

            // Act
            const laidAsBefore = occt.io.loadDxf({ dxf: view });

            // Assert
            expect(centreOfShape(laidAsBefore)).toEqual(expected);
        });

        it.each(BOTH)("should lay a top view's hidden lines under the shape in a %s system", (_name, system) => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: system };

            // Act
            const lines = occt.operations.hiddenLines({ shape: marker(), frame: TOP_VIEW });

            // Assert
            expect(centreOfShape(lines.visible)).toEqual([3, 0, 7]);
        });
    });

    describe("text wires under the coordinate system switch", () => {
        const depthOfText = (): number[] => {
            const wires = occt.shapes.wire.textWires({ text: "F", height: 10 });
            const box = occt.operations.boundingBoxOfShape({ shape: occt.shapes.compound.makeCompound({ shapes: wires }) });
            return rounded([box.min[2], box.max[2]]);
        };

        it.each([
            ["up along +Z with no coordinate system", undefined, [0, 10]],
            ["up along +Z in a left-handed system", leftHanded, [0, 10]],
            ["up along -Z in a right-handed system", rightHanded, [-10, 0]],
        ])("should write a letter %s, where it reads the right way round from above", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };

            // Act
            const depth = depthOfText();

            // Assert
            expect(depth).toEqual(expected);
        });
    });

    describe("the mesh of a shape, asked for a Z-up consumer or as built", () => {
        const trianglesOf = (adjustYtoZ: boolean): Point[][] => occt.shapeFacesToPolygonPoints({ shape: marker(), precision: 0.01, adjustYtoZ, reversedPoints: false });
        const volumeOf = (triangles: Point[][]): number => Math.round(occHelper.base.mesh.signedVolume({ mesh: triangles as Inputs.Base.Mesh3 }) * 1e6) / 1e6;

        it.each([
            ["swapped with no coordinate system", undefined, [3, 7, 5]],
            ["swapped in a left-handed system", leftHanded, [3, 7, 5]],
            ["turned a quarter about X in a right-handed system", rightHanded, [3, -7, 5]],
        ])("should give a Z-up mesh %s, its triangles facing out", (_name, system, expected) => {
            // Arrange
            occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };

            // Act
            const triangles = trianglesOf(true);

            // Assert
            expect(centreOf(triangles.flat())).toEqual(expected);
            expect(volumeOf(triangles)).toBe(0.24);
        });

        it.each([
            ["no coordinate system", undefined],
            ["a left-handed system", leftHanded],
            ["a right-handed system", rightHanded],
        ])("should give the mesh as built in %s when not asked to turn it", (_name, system) => {
            // Arrange
            occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };

            // Act
            const triangles = trianglesOf(false);

            // Assert
            expect(centreOf(triangles.flat())).toEqual([3, 5, 7]);
            expect(volumeOf(triangles)).toBe(0.24);
        });

        it("should give a decomposed mesh its edges and points turned with its faces in a right-handed system", () => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const mesh = occt.shapeToMesh({ shape: marker(), precision: 0.01, adjustYtoZ: true });

            // Assert
            const pointsOfFaces = mesh.faceList.flatMap(face => Array.from({ length: face.vertexCoord.length / 3 }, (_point, at) => Array.from(face.vertexCoord.slice(at * 3, at * 3 + 3))));
            const pointsOfEdges: Point[] = mesh.edgeList.flatMap(edge => edge.vertexCoord);
            expect(centreOf(pointsOfFaces)).toEqual([3, -7, 5]);
            expect(centreOf(pointsOfEdges)).toEqual([3, -7, 5]);
        });

        it("should measure draft angles against the pull in the model's own frame when it turns the mesh in a right-handed system", () => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const mesh = occt.shapeToMesh({ shape: marker(), precision: 0.01, adjustYtoZ: true, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.draftAngle, draftDirection: [0, 1, 0] });

            // Assert
            const anglesFromTheNormals = mesh.faceList.map(face => Array.from({ length: face.normalCoord.length / 3 }, (_normal, at) => Math.round(Math.asin(face.normalCoord[at * 3 + 2]!) * 180 / Math.PI) + 0));
            expect(mesh.faceList.map(face => face.analysisValues!.map(value => Math.round(value) + 0))).toEqual(anglesFromTheNormals);
        });

        it("should leave a draft direction alone that no analysis reads when it turns the mesh in a right-handed system", () => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const mesh = occt.shapeToMesh({ shape: marker(), precision: 0.01, adjustYtoZ: true, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.none, draftDirection: loose<Inputs.Base.Vector3>(5) });

            // Assert
            const pointsOfFaces = mesh.faceList.flatMap(face => Array.from({ length: face.vertexCoord.length / 3 }, (_point, at) => Array.from(face.vertexCoord.slice(at * 3, at * 3 + 3))));
            expect(centreOf(pointsOfFaces)).toEqual([3, -7, 5]);
        });

        it("should refuse a draft direction that is no direction when it turns the mesh in a right-handed system", () => {
            // Arrange
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const meshing = (): unknown => occt.shapeToMesh({ shape: marker(), precision: 0.01, adjustYtoZ: true, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.draftAngle, draftDirection: loose<Inputs.Base.Vector3>(5) });

            // Assert
            expect(meshing).toThrow(InputError);
            expect(meshing).toThrow("`draftDirection` is not a direction: it needs three finite numbers.");
        });
    });

    describe("the settings of the kernel", () => {
        it("should take a setting assigned on the service and map by it", () => {
            // Arrange
            occt.settings = { coordinateSystem: rightHanded };

            // Act
            const loaded = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", adjustZtoY: true });

            // Assert
            expect(occt.settings).toEqual({ coordinateSystem: "rightHanded" });
            expect(centreOfShape(loaded)).toEqual([3, 7, -5]);
        });

        it("should refuse a name that is no setting and keep the settings it had", () => {
            // Arrange
            occt.settings = { coordinateSystem: leftHanded };

            // Act
            const assign = (): void => { occt.settings = { handedness: "right" } as never; };

            // Assert
            expect(assign).toThrow("`handedness` is not a setting");
            expect(occt.settings).toEqual({ coordinateSystem: "leftHanded" });
        });

        it("should hand back settings that cannot be changed past their check", () => {
            // Arrange
            occt.settings = { coordinateSystem: rightHanded };

            // Act
            const misspelt = (): void => { Object.assign(occt.settings, { coordinateSystem: "righthanded" }); };

            // Assert
            expect(misspelt).toThrow(TypeError);
            expect(occt.settings).toEqual({ coordinateSystem: "rightHanded" });
        });
    });

    describe("drawings on the ground", () => {
        it("should lay a DXF drawing's y along +Z", () => {
            // Act
            const loaded = occt.io.loadDxf({ dxf: squareDrawing(3, 5) });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 0, 5]);
        });

        it("should lay an SVG's downward y along -Z with flipY, its default", () => {
            // Arrange
            const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"3\" y=\"5\" width=\"1\" height=\"0.5\"/></svg>";

            // Act
            const loaded = occt.svg.loadSVG({ svg, keepOrigin: true });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3.5, 0, -5.25]);
        });

        it("should lay an SVG's downward y along +Z without flipY", () => {
            // Arrange
            const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect x=\"3\" y=\"5\" width=\"1\" height=\"0.5\"/></svg>";

            // Act
            const loaded = occt.svg.loadSVG({ svg, keepOrigin: true, flipY: false });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3.5, 0, 5.25]);
        });

        it("should lay a top view's hidden lines with the view's y along +Z, front to back of the shape", () => {
            // Act
            const lines = occt.operations.hiddenLines({ shape: marker(), frame: TOP_VIEW });

            // Assert
            expect(centreOfShape(lines.visible)).toEqual([3, 0, -7]);
        });

        it("should draw a top view with its y along -Z, so reading it back lands front to back", () => {
            // Arrange
            const view = occt.io.saveShapeDxf({ shape: marker(), frame: TOP_VIEW, drawHidden: false, precision: 0.01, fileName: "top.dxf", tryDownload: false });

            // Act
            const loaded = occt.io.loadDxf({ dxf: view });

            // Assert
            expect(centreOfShape(loaded)).toEqual([3, 0, -7]);
        });
    });
});
