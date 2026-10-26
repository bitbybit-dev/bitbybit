import { gzipSync } from "node:zlib";
import { beforeAll, describe, expect, it } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTSolid } from "./shapes";
import { OCCTIO } from "./io";
import { OCCTAssemblyManager } from "./assembly/manager";
import * as Inputs from "../api/inputs";
import { ledgerRun, namesOf } from "../__test__/kernel-ledger";

const U = Inputs.Base.unitOfLengthEnum;
const MILLIMETRE_UNIT = "#346 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );";
const INCH_UNIT = "#346 = ( CONVERSION_BASED_UNIT('INCH',#9001) LENGTH_UNIT() NAMED_UNIT(#9002) );\n#9001 = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(25.4),#9003);\n#9002 = DIMENSIONAL_EXPONENTS(1.,0.,0.,0.,0.,0.,0.);\n#9003 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );";

describe("OCCT io: units", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let io: OCCTIO;
    let solid: OCCTSolid;
    let manager: OCCTAssemblyManager;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        solid = new OCCTSolid(occt, occHelper);
        io = new OCCTIO(occt, occHelper);
        manager = new OCCTAssemblyManager(occt, occHelper);
    });

    const box = (): TopoDS_Shape => solid.createBox({ width: 1, length: 2, height: 3, center: [0.5, 1, 1.5] });
    const sizeOf = (shape: TopoDS_Shape | undefined): number[] => {
        if (shape === undefined) {
            throw new Error("expected the file to load");
        }
        try {
            const bounds = occHelper.operationsService.boundingBoxOfShape({ shape });
            return bounds.max.map((value, axis) => value - bounds.min[axis]!);
        } finally {
            shape.delete();
        }
    };
    const stepOf = (unit?: Inputs.Base.unitOfLengthEnum): string => {
        const shape = box();
        try {
            return io.saveShapeSTEP({ shape, fileName: "box.step", adjustYtoZ: false, tryDownload: false, ...(unit === undefined ? {} : { unit }) });
        } finally {
            shape.delete();
        }
    };
    const withoutStamp = (step: string): string => step.replace(/FILE_NAME\([^;]*;/, "FILE_NAME(...);").replace(/STEP translator ([\d.]+) \d+/g, "STEP translator $1 n");

    describe("saving STEP", () => {
        it("should write the same file with no unit as with millimetres", () => {
            // Act
            const files = [stepOf(), stepOf(U.millimetre)].map(withoutStamp);

            // Assert
            expect(files[1]).toBe(files[0]);
        });

        it("should write a shape modelled in inches in millimetres, so it reads back 25.4 times as large", () => {
            // Arrange
            const step = stepOf(U.inch);

            // Act
            const size = sizeOf(io.loadSTEPorIGES({ filetext: step, fileName: "box.step", adjustZtoY: false }));
            const unit = io.fileLengthUnit({ filetext: step, fileName: "box.step" });

            // Assert
            expect(size).toEqual([expect.closeTo(25.4, 5), expect.closeTo(76.2, 5), expect.closeTo(50.8, 5)]);
            expect(unit).toBe(U.millimetre);
        });

        it("should scale after turning Y up into Z up, and leave no kernel object behind", () => {
            // Arrange
            const shape = box();

            // Act
            const run = ledgerRun(occt, () => io.saveShapeSTEP({ shape, fileName: "box.step", adjustYtoZ: true, tryDownload: false, unit: U.centimetre }));
            const size = sizeOf(io.loadSTEPorIGES({ filetext: run.result!, fileName: "box.step", adjustZtoY: false }));
            shape.delete();

            // Assert
            expect(namesOf(run.leaked)).toEqual([]);
            expect(size).toEqual([expect.closeTo(10, 5), expect.closeTo(20, 5), expect.closeTo(30, 5)]);
        });

        it("should refuse a unit it does not know before it builds anything", () => {
            // Arrange
            const shape = box();

            // Act
            const run = ledgerRun(occt, () => io.saveShapeSTEP({ shape, fileName: "box.step", unit: "ft" as Inputs.Base.unitOfLengthEnum }));
            shape.delete();

            // Assert
            expect(run.thrown).toMatchObject({ property: "unit" });
            expect(run.made).toBe(0);
        });
    });

    describe("saving SVG", () => {
        const FRONT = { origin: [0, 0, 0] as Inputs.Base.Point3, normal: [0, 0, 1] as Inputs.Base.Vector3, direction: [1, 0, 0] as Inputs.Base.Vector3 };
        const svgOf = (unit?: Inputs.Base.unitOfLengthEnum): string => {
            const shape = box();
            try {
                return io.saveShapeSvg({ shape, frame: FRONT, precision: 0.01, tryDownload: false, ...(unit === undefined ? {} : { unit }) });
            } finally {
                shape.delete();
            }
        };
        const sizeAttributes = (svg: string): string[] => /<svg [^>]*width="([^"]+)" height="([^"]+)"/.exec(svg)?.slice(1) ?? [];

        it("should state the drawing's true size in the unit it is modelled in, its margins included", () => {
            // Act
            const sizes = [U.millimetre, U.centimetre, U.inch, U.metre].map(unit => sizeAttributes(svgOf(unit)));

            // Assert
            expect(sizes).toEqual([["1.15mm", "3.15mm"], ["1.15cm", "3.15cm"], ["1.15in", "3.15in"], ["115cm", "315cm"]]);
        });

        it("should write no size without a unit and otherwise the same drawing", () => {
            // Act
            const plain = svgOf();
            const inches = svgOf(U.inch);

            // Assert
            expect(sizeAttributes(plain)).toEqual([]);
            expect(inches.replace(' width="1.15in" height="3.15in"', "")).toBe(plain);
        });

        it("should refuse a unit it does not know", () => {
            // Act & Assert
            expect(() => svgOf("ft" as Inputs.Base.unitOfLengthEnum)).toThrow("`unit`");
        });
    });

    describe("loading STEP and IGES", () => {
        it("should bring a millimetre file in at the unit asked for", () => {
            // Arrange
            const step = stepOf();

            // Act
            const sizes = [U.millimetre, U.centimetre, U.metre, U.inch].map(unit => sizeOf(io.loadSTEPorIGES({ filetext: step, fileName: "box.step", adjustZtoY: false, unit })));

            // Assert
            expect(sizes.map(size => size[1])).toEqual([expect.closeTo(3, 5), expect.closeTo(0.3, 5), expect.closeTo(0.003, 5), expect.closeTo(3 / 25.4, 5)]);
        });

        it("should read a file written in inches, telling its unit, at its true size or in inches", () => {
            // Arrange
            const step = stepOf().replace(MILLIMETRE_UNIT, INCH_UNIT);

            // Act
            const unit = io.fileLengthUnit({ filetext: step, fileName: "box.step" });
            const millimetres = sizeOf(io.loadSTEPorIGES({ filetext: step, fileName: "box.step", adjustZtoY: false }));
            const inches = sizeOf(io.loadSTEPorIGES({ filetext: step, fileName: "box.step", adjustZtoY: false, unit: U.inch }));

            // Assert
            expect(step).toContain("CONVERSION_BASED_UNIT('INCH'");
            expect(unit).toBe(U.inch);
            expect(millimetres).toEqual([expect.closeTo(25.4, 5), expect.closeTo(76.2, 5), expect.closeTo(50.8, 5)]);
            expect(inches).toEqual([expect.closeTo(1, 5), expect.closeTo(3, 5), expect.closeTo(2, 5)]);
        });

        it("should tell the unit of a compressed STEP file and load it in the unit asked for", () => {
            // Arrange
            const compressed = gzipSync(stepOf().replace(MILLIMETRE_UNIT, INCH_UNIT));
            const filetext = compressed.buffer.slice(compressed.byteOffset, compressed.byteOffset + compressed.byteLength);

            // Act
            const unit = io.fileLengthUnit({ filetext, fileName: "box.stpz" });
            const inches = sizeOf(io.loadSTEPorIGES({ filetext, fileName: "box.stpz", adjustZtoY: false, unit: U.inch }));

            // Assert
            expect(unit).toBe(U.inch);
            expect(inches[1]).toBeCloseTo(3, 5);
        });

        it("should refuse a file name that is neither STEP nor IGES when telling a unit", () => {
            // Act & Assert
            expect(() => io.fileLengthUnit({ filetext: stepOf(), fileName: "box.stl" })).toThrow("`fileName`");
        });
    });

    describe("saving glTF", () => {
        const sceneOf = (glb: Uint8Array): { scenes: { nodes: number[] }[]; nodes: { name?: string; scale?: number[]; children?: number[] }[] } => {
            const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
            return JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + view.getUint32(12, true))));
        };
        const documentGlbs = (unit?: Inputs.Base.unitOfLengthEnum): Uint8Array[] => {
            const shape = box();
            const part = manager.createPart({ id: "box", shape, name: "Box" });
            const document = manager.buildAssemblyDocument({ structure: manager.combineStructure({ parts: [part], nodes: [], clearDocument: false }) });
            try {
                const options = { document, meshDeflection: 0.1, ...(unit === undefined ? {} : { unit }) };
                return [manager.exportDocumentToGltf(options), manager.exportDocumentToGltfWithDraco({ ...options, useDraco: false })];
            } finally {
                document.delete();
                shape.delete();
            }
        };

        it("should write a document in inches in metres, one node over the scene scaling it, the meshes as they were", () => {
            // Act
            const plain = documentGlbs().map(sceneOf);
            const metres = documentGlbs(U.inch).map(sceneOf);

            // Assert
            metres.forEach((scene, index) => {
                const root = scene.nodes[scene.scenes[0]!.nodes[0]!]!;
                expect(scene.scenes[0]!.nodes).toHaveLength(1);
                expect(root).toEqual({ name: "unit scale", scale: [0.0254, 0.0254, 0.0254], children: plain[index]!.scenes[0]!.nodes });
                expect(scene.nodes.slice(0, -1)).toEqual(plain[index]!.nodes);
            });
        });

        it("should write the same file without a unit as before, and with metres", () => {
            // Act
            const [plain, metres] = [documentGlbs(), documentGlbs(U.metre)];

            // Assert
            expect(sceneOf(metres[0]!)).toEqual(sceneOf(plain[0]!));
            expect(sceneOf(plain[0]!).nodes.some(node => node.name === "unit scale")).toBe(false);
        });
    });
});
