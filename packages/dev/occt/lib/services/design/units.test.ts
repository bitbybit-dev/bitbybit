import { beforeAll, describe, it, expect } from "vitest";
import { runInNewContext } from "node:vm";
import * as ts from "typescript";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { BaseBitByBit } from "@bitbybit-dev/base";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { sha256 } from "./digest";
import { unitOfDocument } from "./helpers";

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Document = Models.OCCT.DesignPartDocument;

const INCH = Inputs.Base.unitOfLengthEnum.inch;

describe("units of length in design documents and assembly structures", () => {
    it("should name exactly the units base converts between, and read a document's unit as millimetres when it states none", () => {
        // Arrange
        const documentUnits: Same<NonNullable<Models.OCCT.DesignUnits["length"]>, `${Inputs.Base.unitOfLengthEnum}`> = true;
        const structureUnits: Same<NonNullable<Models.OCCT.AssemblyStructureDef<unknown>["lengthUnit"]>, `${Inputs.Base.unitOfLengthEnum}`> = true;

        // Act
        const read = [unitOfDocument({ units: { length: "in" } }), unitOfDocument({}), unitOfDocument({ units: {} })];

        // Assert
        expect([documentUnits, structureUnits]).toEqual([true, true]);
        expect(read).toEqual([Inputs.Base.unitOfLengthEnum.inch, Inputs.Base.unitOfLengthEnum.millimetre, Inputs.Base.unitOfLengthEnum.millimetre]);
    });
});

describe("OCCT design: a document's unit reaches operations, imports and STEP files", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const operationPart = (operation: string, params: Record<string, unknown>, length: Models.OCCT.DesignUnits["length"] = "in"): Document => ({
        schemaVersion: 1,
        units: { length },
        features: [{ id: "part", type: "operation", operation, params }],
    });
    const sizeOf = (shape: TopoDS_Shape): number[] => occt.analysis.measure.tightBoundingBox({ shape }).size;
    const builtShape = (build: Models.OCCT.DesignBuildResult<TopoDS_Shape>): TopoDS_Shape => {
        expect(build.report.flatMap(entry => entry.status === "ok" ? [] : entry.messages)).toEqual([]);
        return build.parts[0]!.shape;
    };

    it("should make a standard part an operation names in its document's unit when the params leave the unit out", () => {
        // Act
        const ansi = builtShape(occt.design.build({ document: operationPart("occt.parts.mechanical.fasteners.ansi.hexNut", { size: "1/4" }, "mm") }));
        const iso = builtShape(occt.design.build({ document: operationPart("occt.parts.mechanical.fasteners.iso.hexNut", { size: "M8" }) }));
        const direct = [occt.parts.mechanical.fasteners.ansi.hexNut({ size: Inputs.Engineering.ansiThreadSizeEnum.in1_4, unit: Inputs.Base.unitOfLengthEnum.millimetre }), occt.parts.mechanical.fasteners.iso.hexNut({ size: Inputs.Engineering.isoThreadSizeEnum.m8, unit: INCH })];

        // Assert
        expect(sizeOf(ansi)).toEqual(sizeOf(direct[0]!).map(side => expect.closeTo(side, 9)));
        expect(sizeOf(iso)).toEqual(sizeOf(direct[1]!).map(side => expect.closeTo(side, 9)));
        direct.forEach(shape => { shape.delete(); });
    });

    it("should refuse an operation's unit that differs from its document's, written or computed", () => {
        // Arrange
        const written = operationPart("occt.parts.mechanical.fasteners.iso.hexNut", { size: "M8", unit: "mm" });
        const computed = { ...operationPart("occt.parts.mechanical.fasteners.iso.hexNut", { size: "M8", unit: { expr: "metric" } }), parameters: { metric: { type: "text" as const, value: "mm" } } };

        // Act
        const issues = occt.design.validate({ document: written }).map(issue => `${issue.path}: ${issue.message}`);
        const report = occt.design.build({ document: computed }).report.flatMap(entry => entry.messages);

        // Assert
        expect(issues).toEqual(["/features/0/params/unit: the unit is mm, and this document is in in: an operation builds in its document's unit, so leave unit out"]);
        expect(report).toEqual(["/features/0/params/unit: the unit is \"mm\", and this document is in in: an operation builds in its document's unit, so leave unit out"]);
    });

    it("should import a STEP file into an inch document at its true size, as inches", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 25.4, length: 50.8, height: 76.2, center: [0, 0, 0] });
        const step = occt.io.saveShapeSTEP({ shape: box, fileName: "box.step", tryDownload: false });
        box.delete();
        const bytes = new TextEncoder().encode(step);
        const document: Document = { schemaVersion: 1, units: { length: "in" }, assets: [{ id: "file", uri: "box.step", sha256: sha256(bytes) }], features: [{ id: "part", type: "import", asset: "file" }] };

        // Act
        const shape = builtShape(occt.design.build({ document, assets: { file: step } }));

        // Assert
        expect(sizeOf(shape)).toEqual([expect.closeTo(1, 6), expect.closeTo(3, 6), expect.closeTo(2, 6)]);
    });

    it("should turn a STEP file into inch documents, their shapes and placements scaled together", () => {
        // Arrange
        const part = occt.shapes.solid.createBox({ width: 25.4, length: 25.4, height: 25.4, center: [0, 0, 0] });
        const manager = occt.assembly.manager;
        const placed = manager.createPart({ id: "cube", shape: part, name: "Cube" });
        const node = manager.createInstanceNode({ id: "moved", partId: "cube", name: "Moved", translation: [254, 0, 0] });
        const document = manager.buildAssemblyDocument({ structure: manager.combineStructure({ parts: [placed], nodes: [node], clearDocument: false }) });
        const step = new TextDecoder().decode(manager.exportDocumentToStep({ document, fileName: "cube.step", author: "", organization: "", compress: false, tryDownload: false }));
        [document, part].forEach(handle => { handle.delete(); });

        // Act
        const imported = occt.design.fromStep({ step, name: "cube.step", unit: INCH });
        const root = imported.documents.find(each => each.id === imported.root)!;
        const shape = builtShape(occt.design.build({ document: root, documents: imported.documents, assets: { [imported.assets[0]!.id]: imported.assets[0]!.data } }));

        // Assert
        expect(imported.documents.map(each => each.units?.length)).toEqual(imported.documents.map(() => "in"));
        expect(sizeOf(shape)).toEqual([expect.closeTo(1, 6), expect.closeTo(1, 6), expect.closeTo(1, 6)]);
        expect(root.kind).toBe("assembly");
        expect(root.kind === "assembly" ? root.components.map(component => component.at?.origin) : []).toEqual([[expect.closeTo(10, 9), 0, 0]]);
    });

    it("should write the document's unit into the TypeScript of an operation that leaves it out, so the program builds the same", async () => {
        // Arrange
        const document = operationPart("occt.parts.mechanical.fasteners.iso.hexNut", { size: "M8" });
        const expected = sizeOf(builtShape(occt.design.build({ document })));

        // Act
        const code = occt.design.toTypeScript({ document });
        const program = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText.replace(/for \(const part of parts\) \{[\s\S]*?\}\n/, "");
        const parts = await (runInNewContext(`(async () => {\n${program}\nreturn parts;\n})()`, { bitbybit: { occt, math: new BaseBitByBit().math }, Bit: { Inputs } }) as Promise<{ shape: TopoDS_Shape }[]>);

        // Assert
        expect(code).toContain("occt.parts.mechanical.fasteners.iso.hexNut({ size: \"M8\", unit: \"in\" })");
        expect(sizeOf(parts[0]!.shape)).toEqual(expected.map(side => expect.closeTo(side, 9)));
        parts.forEach(each => { each.shape.delete(); });
    });
});
