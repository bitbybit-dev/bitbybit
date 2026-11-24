import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { InputError, prepareKernelCall, resolveDto } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../api/dto-registry";
import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

const { keep, zUpToYUp, yUpToZUp } = Inputs.Base.upAxisConversionEnum;
const { rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = number[];

const AS_BUILT: Point = [3, 5, 7];
const SWAPPED: Point = [3, 7, 5];
const TURNED_TO_Z_UP: Point = [3, -7, 5];
const TURNED_TO_Y_UP: Point = [3, 7, -5];

const rounded = (point: Point): Point => point.map(value => Math.round(value * 1e4) / 1e4 + 0);
const inTriples = (flat: readonly number[]): Point[] => Array.from({ length: flat.length / 3 }, (_point, at) => flat.slice(at * 3, at * 3 + 3));
const centreOf = (points: Point[]): Point => rounded([0, 1, 2].map(axis => {
    const values = points.map(point => point[axis]!);
    return (Math.min(...values) + Math.max(...values)) / 2;
}));
const gltfBounds = (glb: Uint8Array): unknown => {
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    const length = view.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + length))) as { accessors: { min?: number[], max?: number[] }[] };
    return json.accessors.map(accessor => [accessor.min, accessor.max]);
};
const meshCentre = (mesh: Inputs.OCCT.DecomposedMeshDto): Point => centreOf(mesh.faceList.flatMap(face => inTriples(face.vertexCoord)));

describe("OCCT up axis: each operation turns by upAxis", () => {
    let occt: OCCTService;
    let occHelper: OccHelper;
    let kernel: BitbybitOcctModule;
    const documents: Handle_TDocStd_Document[] = [];

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
        while (documents.length) {
            documents.pop()!.delete();
        }
    });

    const marker = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 1, length: 0.6, height: 0.4, center: [3, 5, 7] });
    const shapeCentre = (shape: TopoDS_Shape): Point => meshCentre(occt.shapeToMesh({ shape, precision: 0.01 }));
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
    const stepAsBuilt = (): string => occt.io.saveShapeSTEP({ shape: marker(), fileName: "marker.step", upAxis: keep, tryDownload: false });
    const stlAsBuilt = (): string | Uint8Array => occt.io.saveShapeStl({ shape: marker(), fileName: "marker.stl", precision: 0.01, upAxis: keep, tryDownload: false });
    const objPoints = (obj: string): Point[] => [...obj.matchAll(/^v\s+(\S+)\s+(\S+)\s+(\S+)/gm)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);
    const plyPoints = (ply: string): Point[] => {
        const lines = ply.split(/\r?\n/);
        const count = Number(lines.find(line => line.startsWith("element vertex"))!.split(/\s+/)[2]);
        const start = lines.indexOf("end_header") + 1;
        return lines.slice(start, start + count).map(line => line.trim().split(/\s+/).slice(0, 3).map(Number));
    };
    const stlPoints = (stl: string | Uint8Array): Point[] => [...String(stl).matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].map(match => [Number(match[1]), Number(match[2]), Number(match[3])]);
    const refusedUpAxis = (act: () => unknown): void => {
        expect(act).toThrow(InputError);
        expect(act).toThrow("`upAxis`");
    };

    describe("meshing a shape", () => {
        it.each([
            ["keep", keep, AS_BUILT],
            ["yUpToZUp", yUpToZUp, SWAPPED],
        ] as const)("should mesh a shape with upAxis %s", (_name, upAxis, expected) => {
            // Act
            const mesh = occt.shapeToMesh({ shape: marker(), precision: 0.01, upAxis });
            const [ofList] = occt.shapesToMeshes({ shapes: [marker()], precision: 0.01, upAxis });
            const triangles = occt.shapeFacesToPolygonPoints({ shape: marker(), precision: 0.01, upAxis, reversedPoints: false });

            // Assert
            expect(meshCentre(mesh)).toEqual(expected);
            expect(meshCentre(ofList!)).toEqual(expected);
            expect(centreOf(triangles.flat())).toEqual(expected);
        });

        it("should refuse zUpToYUp, which a shape is never meshed with", () => {
            // Assert
            refusedUpAxis(() => occt.shapeToMesh({ shape: marker(), upAxis: zUpToYUp }));
            refusedUpAxis(() => occt.shapesToMeshes({ shapes: [marker()], upAxis: zUpToYUp }));
            refusedUpAxis(() => occt.shapeFacesToPolygonPoints({ shape: marker(), upAxis: zUpToYUp }));
        });
    });

    describe("meshing a document", () => {
        it.each([
            ["keep", keep, AS_BUILT],
            ["zUpToYUp", zUpToYUp, TURNED_TO_Y_UP],
            ["yUpToZUp", yUpToZUp, TURNED_TO_Z_UP],
        ] as const)("should mesh a document with upAxis %s in a right-handed system", (_name, upAxis, expected) => {
            // Arrange
            const document = documentOf(marker());
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const mesh = occt.docToMesh({ document, precision: 0.01, upAxis });
            const [ofList] = occt.docToMeshes({ document, precision: 0.01, upAxis });

            // Assert
            expect(meshCentre(mesh)).toEqual(expected);
            expect(meshCentre(ofList!)).toEqual(expected);
        });

        it("should still turn a document with the deprecated adjustYtoZ, and refuse it beside an upAxis it contradicts", () => {
            // Arrange
            const document = documentOf(marker());
            occHelper.base.settings = { coordinateSystem: rightHanded };

            // Act
            const byFlag = occt.docToMesh({ document, precision: 0.01, adjustYtoZ: true });
            const contradicted = (): unknown => occt.docToMesh({ document, precision: 0.01, upAxis: zUpToYUp, adjustYtoZ: true });

            // Assert
            expect(meshCentre(byFlag)).toEqual(TURNED_TO_Z_UP);
            expect(contradicted).toThrow(InputError);
            expect(contradicted).toThrow("`adjustYtoZ`");
            expect(contradicted).toThrow("`upAxis`");
        });
    });

    describe("writing files", () => {
        it.each([
            ["keep", keep, AS_BUILT],
            ["yUpToZUp", yUpToZUp, SWAPPED],
        ] as const)("should write STEP, STL, OBJ and PLY files with upAxis %s", (_name, upAxis, expected) => {
            // Act
            const step = occt.io.saveShapeSTEP({ shape: marker(), fileName: "marker.step", upAxis, tryDownload: false });
            const stl = occt.io.saveShapeStl({ shape: marker(), fileName: "marker.stl", precision: 0.01, upAxis, tryDownload: false });
            const obj = occt.io.saveShapeObj({ shape: marker(), fileName: "marker.obj", upAxis, tryDownload: false });
            const ply = occt.io.saveShapePly({ shape: marker(), fileName: "marker.ply", upAxis, tryDownload: false });

            // Assert
            expect(shapeCentre(occt.io.loadSTEPorIGES({ filetext: step, fileName: "marker.step", upAxis: keep })!)).toEqual(expected);
            expect(centreOf(stlPoints(stl))).toEqual(expected);
            expect(centreOf(objPoints(obj.obj))).toEqual(expected);
            expect(centreOf(plyPoints(ply))).toEqual(expected);
        });

        it("should refuse zUpToYUp, which no file is written with", () => {
            // Assert
            refusedUpAxis(() => occt.io.saveShapeSTEP({ shape: marker(), upAxis: zUpToYUp, tryDownload: false }));
            refusedUpAxis(() => occt.io.saveShapeStl({ shape: marker(), upAxis: zUpToYUp, tryDownload: false }));
            refusedUpAxis(() => occt.io.saveShapeObj({ shape: marker(), upAxis: zUpToYUp, tryDownload: false }));
            refusedUpAxis(() => occt.io.saveShapePly({ shape: marker(), upAxis: zUpToYUp, tryDownload: false }));
        });
    });

    describe("reading files", () => {
        it.each([
            ["keep", keep, AS_BUILT],
            ["zUpToYUp", zUpToYUp, SWAPPED],
        ] as const)("should read STEP and STL files with upAxis %s", (_name, upAxis, expected) => {
            // Act
            const fromStep = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", upAxis });
            const fromStl = occt.io.loadStl({ stlData: stlAsBuilt(), asFaces: true, upAxis });

            // Assert
            expect(shapeCentre(fromStep!)).toEqual(expected);
            expect(shapeCentre(fromStl)).toEqual(expected);
        });

        it("should read with the default zUpToYUp, and keep the file's axes with the deprecated adjustZtoY false", () => {
            // Act
            const byDefault = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step" });
            const byFlag = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", adjustZtoY: false });

            // Assert
            expect(shapeCentre(byDefault!)).toEqual(SWAPPED);
            expect(shapeCentre(byFlag!)).toEqual(AS_BUILT);
        });

        it("should refuse yUpToZUp, which no file is read with", () => {
            // Assert
            refusedUpAxis(() => occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", upAxis: yUpToZUp }));
            refusedUpAxis(() => occt.io.loadStl({ stlData: stlAsBuilt(), upAxis: yUpToZUp }));
            refusedUpAxis(() => occt.io.convertStepToGltfAdvanced({ stepData: stepAsBuilt(), upAxis: yUpToZUp }));
        });

        it("should convert a STEP file to glTF with Z turned into Y only under zUpToYUp", () => {
            // Act
            const kept = occt.io.convertStepToGltfAdvanced({ stepData: stepAsBuilt(), upAxis: keep });
            const turned = occt.io.convertStepToGltfAdvanced({ stepData: stepAsBuilt(), upAxis: zUpToYUp });
            const byFlag = occt.io.convertStepToGltfAdvanced({ stepData: stepAsBuilt(), adjustZtoY: true });

            // Assert
            expect(gltfBounds(turned)).not.toEqual(gltfBounds(kept));
            expect(gltfBounds(byFlag)).toEqual(gltfBounds(turned));
        });
    });

    it("should refuse a turn a method cannot make before it meshes, writes or reads anything", () => {
        // Arrange
        const shape = marker();
        const document = documentOf(marker());
        const mesher = kernel.BRepMesh_IncrementalMesh;
        let meshed = 0;
        Reflect.set(kernel, "BRepMesh_IncrementalMesh", new Proxy(mesher, {
            construct(target, args): object {
                meshed += 1;
                return Reflect.construct(target, args) as object;
            },
        }));
        const annotations = vi.spyOn(kernel, "DocumentAnnotationsJson");
        let annotated: number | undefined;

        // Act
        try {
            refusedUpAxis(() => occt.io.saveShapeStl({ shape, fileName: "marker.stl", upAxis: zUpToYUp, tryDownload: false }));
            refusedUpAxis(() => occt.assembly.query.getDocumentAnnotations({ document, upAxis: "Y" as Inputs.Base.upAxisConversionEnum }));
        } finally {
            Reflect.set(kernel, "BRepMesh_IncrementalMesh", mesher);
            annotated = annotations.mock.calls.length;
            annotations.mockRestore();
        }

        // Assert
        expect([meshed, annotated]).toEqual([0, 0]);
    });

    describe("the deprecated flags beside upAxis", () => {
        it("should read the old example of each released method, which spells a flag at its old default beside the axis it chooses, as that axis", () => {
            // Act
            const positional = occt.io.saveShapeSTEP(new Inputs.OCCT.SaveStepDto(marker(), "marker.step", false, false, Inputs.Base.unitOfLengthEnum.millimetre, yUpToZUp));
            const polygons = occt.shapeFacesToPolygonPoints({ shape: marker(), precision: 0.01, upAxis: yUpToZUp, adjustYtoZ: false, reversedPoints: false });
            const read = occt.io.loadSTEPorIGES({ filetext: stepAsBuilt(), fileName: "marker.step", upAxis: keep, adjustZtoY: true });

            // Assert
            expect(shapeCentre(occt.io.loadSTEPorIGES({ filetext: positional, fileName: "marker.step", upAxis: keep })!)).toEqual(SWAPPED);
            expect(centreOf(polygons.flat())).toEqual(SWAPPED);
            expect(shapeCentre(read!)).toEqual(AS_BUILT);
        });

        type Released = readonly [path: string, dto: new () => object, flag: "adjustYtoZ" | "adjustZtoY"];
        const RELEASED: readonly Released[] = [
            ["shapeToMesh", Inputs.OCCT.ShapeToMeshDto, "adjustYtoZ"],
            ["shapeFacesToPolygonPoints", Inputs.OCCT.ShapeFacesToPolygonPointsDto, "adjustYtoZ"],
            ["shapesToMeshes", Inputs.OCCT.ShapesToMeshesDto, "adjustYtoZ"],
            ["io.saveShapeSTEP", Inputs.OCCT.SaveStepDto, "adjustYtoZ"],
            ["io.saveShapeStl", Inputs.OCCT.SaveStlDto, "adjustYtoZ"],
            ["io.saveShapeObj", Inputs.OCCT.SaveObjDto, "adjustYtoZ"],
            ["io.saveShapePly", Inputs.OCCT.SavePlyDto, "adjustYtoZ"],
            ["io.loadSTEPorIGES", Inputs.OCCT.LoadStepOrIgesDto, "adjustZtoY"],
            ["io.loadStl", Inputs.OCCT.LoadStlDto, "adjustZtoY"],
            ["io.convertStepToGltfAdvanced", Inputs.OCCT.ConvertStepToGltfAdvancedDto, "adjustZtoY"],
            ["io.convertStepToGltfAdvancedWithDraco", Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto, "adjustZtoY"],
            ["recipes.build", Inputs.OCCT.BuildRecipeDto, "adjustZtoY"],
        ];
        const TURNS = [keep, zUpToYUp, yUpToZUp] as const;

        it.each(RELEASED)("should resolve %s alike on the service and the worker: a flag at its old default decides nothing, the other value wins over upAxis at its default and is refused beside another chosen turn", (path, dto, flag) => {
            // Arrange
            const turn = flag === "adjustYtoZ" ? yUpToZUp : zUpToYUp;
            const axis = (new dto() as { upAxis?: Inputs.Base.upAxisConversionEnum }).upAxis!;
            const oldDefault = turn === axis;
            const asked = oldDefault ? keep : turn;
            const resolvedBy = (given: Record<string, unknown>): string[] => [
                (): unknown => (resolveDto(dto, given) as { upAxis: unknown }).upAxis,
                (): unknown => (resolveDto(dto, prepareKernelCall("OCCT", occtDtoRegistry, path, given).inputs as Record<string, unknown>) as { upAxis: unknown }).upAxis,
            ].map(read => {
                try {
                    return String(read());
                } catch (error) {
                    return error instanceof InputError ? `refused ${String(error.property)}` : String(error);
                }
            });

            // Act
            const atOldDefault = TURNS.map(upAxis => resolvedBy({ upAxis, [flag]: oldDefault }));
            const otherwise = TURNS.map(upAxis => resolvedBy({ upAxis, [flag]: !oldDefault }));
            const alone = [resolvedBy({ [flag]: oldDefault }), resolvedBy({ [flag]: !oldDefault })];

            // Assert
            expect(atOldDefault).toEqual(TURNS.map(upAxis => [upAxis, upAxis]));
            expect(otherwise).toEqual(TURNS.map(upAxis => upAxis === axis || upAxis === asked ? [asked, asked] : [`refused ${flag}`, `refused ${flag}`]));
            expect(alone).toEqual([[axis, axis], [asked, asked]]);
        });
    });
});
