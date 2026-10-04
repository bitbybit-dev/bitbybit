import { describe, it, expect, beforeAll } from "vitest";
import { runInNewContext } from "node:vm";
import * as ts from "typescript";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { sha256 } from "./digest";
import { evaluateExpression, parseExpression } from "./expressions";
import { MathHelper, expressionCode, mathHelperDeclarations, mathHelperUses } from "./typescript-export";

type Document = Models.OCCT.DesignPartDocument;
type Drawn = { shape: TopoDS_Shape; properties: Record<string, unknown> };

const rectangle = (id: string, width: number | string, depth: number | string, on: Models.OCCT.DesignSketchPlacement, start: [number, number] = [0, 0]): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on,
    start,
    pen: [
        { type: "hLine", id: "bottom", length: width },
        { type: "vLine", id: "right", length: depth },
        { type: "hLine", id: "top", length: typeof width === "number" ? -width : `-(${width})` },
        { type: "close", id: "left" },
    ],
});

const javascriptOf = (code: string): string => {
    const output = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
    if ((output.diagnostics ?? []).length > 0) {
        throw new Error(ts.flattenDiagnosticMessageText(output.diagnostics![0]!.messageText, "\n"));
    }
    return output.outputText;
};

describe("design documents as TypeScript", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const volume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });

    const execute = async (code: string, assets: Record<string, unknown> = {}): Promise<Drawn[]> => {
        const drawn: TopoDS_Shape[] = [];
        const program = javascriptOf(code)
            .replace("const assets = {};", "const assets = injectedAssets;")
            .replace(/for \(const part of parts\) \{[\s\S]*?\}\n/, "");
        const bitbybit = { occt, draw: { drawAnyAsync: ({ entity }: { entity: TopoDS_Shape }): Promise<number> => Promise.resolve(drawn.push(entity)) } };
        return runInNewContext(`(async () => {\n${program}\nreturn parts;\n})()`, { bitbybit, Bit: { Inputs }, injectedAssets: assets }) as Promise<Drawn[]>;
    };

    describe("expressions", () => {
        it("should write every operator and function so TypeScript computes what the document does", () => {
            // Arrange
            const values = new Map<string, number | string>([["a", 3], ["b", -2], ["c", 0.5], ["finish", "raw"], ["flag", 1]]);
            const names = new Map([...values.keys()].map(name => [name, name]));
            const expressions = [
                "a + b * c", "(a + b) * c", "a - (b - c)", "a / (b / c)", "-a ^ 2", "(-a) ^ 2", "a ^ c ^ 2", "2 ^ -1", "--a", "-(-a)",
                "a > b && b < c || !flag", "!(a > b)", "a == 3", "finish == 'raw'", "finish != 'black'", "if(a > 2, a, b)", "if(flag, 'x', 'y')",
                "sin(30) + cos(60) + tan(45)", "asin(c) + acos(c) + atan(1)", "atan2(1, -1)", "min(a, b) + max(a, b)", "abs(b) + sqrt(4)",
                "round(c) + floor(-c) + ceil(c)", "pi * 2", "a - -b", "a * -b", "1 - (2 - 3) - 4", "a / b / c",
                "(a && b) * 10", "(0 || b) * 10", "(a > 1) == 1", "if((a > 1) == 1, 10, 20)", "!a + 1", "(a < b) + (a > b) * 2", "flag == 1",
                "a > b", "a && b", "!(a > b) * 5", "if(a && !b, 'x', 'y')", "min(a > b, 7)",
                "floor(tan(45))", "round(-2.5) + round(2.5)", "sin(390) + cos(-90) + sin(10)", "asin(-0.5) + acos(-1) + asin(0)", "tau + e + true - false", "min(a, b, c) + max(c)",
            ];
            const helpers = new Map<MathHelper, string>();
            const helper = (kind: MathHelper): string => {
                const uses = mathHelperUses(kind);
                if (uses !== undefined) {
                    helper(uses);
                }
                helpers.set(kind, `${kind}Helper`);
                return `${kind}Helper`;
            };

            // Act
            const results = expressions.map(text => {
                const code = expressionCode(parseExpression(text), names, helper).text;
                const declarations = ts.transpile(mathHelperDeclarations(helpers).join("\n"));
                const computed = runInNewContext(`${declarations}\n(${code})`, { ...Object.fromEntries(values), Math }) as number | string | boolean;
                return [computed, code];
            });

            // Assert
            expect(expressionCode(parseExpression("if(a > 1 && !(b < 2), 1, 2)"), names, helper).text).toBe("(a > 1 && !(b < 2) ? 1 : 2)");
            results.forEach(([computed, code], index) => {
                const expected = evaluateExpression(parseExpression(expressions[index]!), values);
                expect(computed, `${expressions[index]} as ${code}`).toBe(expected);
            });
        });
    });

    describe("programs", () => {
        it("should write parameters as constants in the order they need, and build the same plate", async () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                meta: { name: "Plate" },
                parameters: { area: "width * depth", depth: "width / 2", width: 40, height: { value: 10, min: 1 } },
                features: [
                    rectangle("base", "width", "depth", { plane: "XY" }),
                    { id: "plate", type: "extrude", profile: "base", distance: "height" },
                    { id: "round", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
                ],
            };

            // Act
            const code = occt.design.toTypeScript({ document, parameters: { width: 30 } });
            const parts = await execute(code);

            // Assert
            expect(code).toContain("// Generated by occt.design.toTypeScript from \"Plate\".");
            expect(code.indexOf("const width = 30;")).toBeLessThan(code.indexOf("const depth = width / 2;"));
            expect(code.indexOf("const depth = width / 2;")).toBeLessThan(code.indexOf("const area = width * depth;"));
            expect(code).toContain("let plate = await occt.operations.extrude({ shape: base, direction: [0, 0, height] });");
            expect(code).toMatch(/plate = await occt\.fillets\.filletEdges\(\{ shape: plate, radius: 2, indexes: \[\d+, \d+, \d+, \d+\] \}\);/);
            expect(parts).toHaveLength(1);
            expect(volume(parts[0]!.shape)).toBeCloseTo(volume(occt.design.build({ document, parameters: { width: 30 } }).parts[0]!.shape), 6);
        });

        it("should declare the maths helpers before the constants that call them, and build the same plate", async () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                parameters: { angle: 30, rise: "20 * tan(angle + 15) + round(-2.5)" },
                features: [
                    rectangle("base", "rise", 20, { plane: "XY" }),
                    { id: "plate", type: "extrude", profile: "base", distance: 10 },
                ],
            };

            // Act
            const code = occt.design.toTypeScript({ document });
            const parts = await execute(code);

            // Assert
            expect(code.indexOf("const sinDegrees = ")).toBeLessThan(code.indexOf("const cosDegrees = "));
            expect(code.indexOf("const cosDegrees = ")).toBeLessThan(code.indexOf("const tanDegrees = "));
            expect(code.indexOf("const roundHalfAway = ")).toBeLessThan(code.indexOf("const rise = "));
            expect(code).toContain("const rise = 20 * tanDegrees(angle + 15) + roundHalfAway(-2.5);");
            expect(volume(parts[0]!.shape)).toBeCloseTo(17 * 20 * 10, 6);
        });

        it("should write the chosen configuration, leave suppressed features out and write property templates", async () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                parameters: { width: 40, soft: true, finish: { type: "choice", value: "raw", options: [{ value: "raw" }, { value: "black" }] } },
                configurations: [{ id: "L", values: { width: 80, soft: false } }],
                features: [
                    rectangle("base", "width", 20, { plane: "XY" }),
                    { id: "plate", type: "extrude", profile: "base", distance: 10 },
                    { id: "round", type: "fillet", body: "plate", radius: 2, suppressed: "!soft", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
                ],
                parts: [{ id: "plate", name: "Plate", body: "plate", properties: { partNumber: "PL-{width}-{configuration}-{finish}", note: "`{{x}}` ${{y}}", stocked: true, area: { expr: "width * 20" } } }],
            };

            // Act
            const code = occt.design.toTypeScript({ document, configuration: "L", parameters: { finish: "black" } });
            const parts = await execute(code);

            // Assert
            expect(code).toContain("const configuration = \"L\";");
            expect(code).toContain("const finish = \"black\";");
            expect(code).toContain("// \"round\" is suppressed with these values.");
            expect(parts[0]!.properties).toEqual({ partNumber: "PL-80-L-black", note: "`{x}` ${y}", stocked: true, area: 1600 });
            expect(volume(parts[0]!.shape)).toBeCloseTo(80 * 20 * 10, 6);
        });

        it("should write a boolean parameter as 1 or 0 and template numbers as the document does, so the program builds what the build does", async () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                parameters: { flag: true, width: 10 },
                features: [rectangle("base", "width", 10, { plane: "XY" }), { id: "plate", type: "extrude", profile: "base", distance: "if(flag == 1, 1, 2)" }],
                parts: [{ id: "plate", body: "plate", properties: { code: "PL-{width / 3}-{width > 5}", wide: { expr: "width > 5" } } }],
            };

            // Act
            const built = occt.design.build({ document });
            const parts = await execute(occt.design.toTypeScript({ document }));

            // Assert
            expect(volume(parts[0]!.shape)).toBeCloseTo(volume(built.parts[0]!.shape), 6);
            expect(parts[0]!.properties).toEqual(built.parts[0]!.properties);
            expect(built.parts[0]!.properties).toEqual({ code: "PL-3.33333333333-1", wide: 1 });
        });

        it("should keep line breaks in the document's name and asset addresses inside the comments they are written to", async () => {
            // Arrange
            const brep = occt.io.saveShapeBrep({ shape: occt.shapes.solid.createBox({ width: 4, length: 4, height: 2, center: [0, 1, 0] }), tryDownload: false, withTriangulation: false });
            const breaks = ["\n", "\r", "\u2028", "\u2029"];
            const document: Document = {
                schemaVersion: 1,
                meta: { name: breaks.map((separator, index) => `Bracket${separator}globalThis.fromName${index} = 1; //`).join("") },
                assets: [{ id: "file", uri: breaks.map((separator, index) => `a.brep${separator}globalThis.fromUri${index} = 1; //`).join(""), mediaType: "x", sha256: sha256(new TextEncoder().encode(brep)) }],
                features: [{ id: "part", type: "import", asset: "file", format: "brep" }],
            };
            const sandbox: Record<string, unknown> = { bitbybit: { occt, draw: { drawAnyAsync: (): Promise<number> => Promise.resolve(0) } }, Bit: { Inputs }, injectedAssets: { file: brep } };

            // Act
            const code = occt.design.toTypeScript({ document, assets: { file: brep } });
            const program = javascriptOf(code).replace("const assets = {};", "const assets = injectedAssets;");
            await (runInNewContext(`(async () => {\n${program}\n})()`, sandbox) as Promise<void>);

            // Assert
            expect(code.split(/\r\n|[\n\r\u2028\u2029]/).filter(line => line.includes("globalThis")).every(line => line.trimStart().startsWith("//"))).toBe(true);
            expect(Object.keys(sandbox).filter(key => key.startsWith("from"))).toEqual([]);
        });

        it("should write every feature type so the program builds parts of the same volume as the document", async () => {
            // Arrange
            const brep = occt.io.saveShapeBrep({ shape: occt.shapes.solid.createBox({ width: 4, length: 4, height: 2, center: [100, 1, 0] }), tryDownload: false, withTriangulation: false });
            const document: Document = {
                schemaVersion: 1,
                parameters: { size: 40, gap: "size / 4" },
                assets: [{ id: "block", uri: "files/block.brep", sha256: sha256(new TextEncoder().encode(brep)) }],
                features: [
                    rectangle("base", "size", 20, { plane: "XY" }),
                    { id: "plate", type: "extrude", profile: "base", distance: 10 },
                    rectangle("slot", 4, 4, { face: { of: "plate", role: "end" } }, [-2, -2]),
                    { id: "cut", type: "extrude", profile: "slot", distance: -12, body: "plate", join: "cut" },
                    rectangle("square", 6, 6, { face: { of: "plate", role: "end" } }, [5, -3]),
                    { id: "lug", type: "boss", profile: "square", body: "plate", distance: 3 },
                    rectangle("dent", 4, 4, { face: { of: "plate", role: "end" } }, [-15, -2]),
                    { id: "dip", type: "pocket", profile: "dent", body: "plate", until: { of: "plate", role: "start" } },
                    { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "start" }, at: [["gap", 5]], diameter: 2, counterbore: { diameter: 4, depth: 1 } },
                    { id: "edge", type: "chamfer", body: "plate", distance: 0.5, edges: { between: [{ of: "plate", role: "start" }, { of: "plate", role: "side", from: "base.bottom" }], count: 1 } },
                    rectangle("ring", 2, 3, { plane: "XZ", offset: 30 }, [5, 0]),
                    { id: "wheel", type: "revolve", profile: "ring", axis: { origin: [1, 30, 0], direction: [0, 0, 1] }, angle: 120 },
                    rectangle("profile", 2, 1, { frame: { origin: [0, -20, 0], normal: [0, 1, 0], direction: [1, 0, 0] } }, [-1, -0.5]),
                    { id: "spine", type: "sketch", on: { frame: { origin: [0, -20, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }, closed: false, pen: [{ type: "vLine", id: "run", length: 10 }] },
                    { id: "bar", type: "sweep", profile: "profile", path: "spine" },
                    rectangle("low", 4, 4, { plane: "XY", offset: 50 }, [-2, -2]),
                    rectangle("high", 2, 2, { plane: "XY", offset: 55 }, [-1, -1]),
                    { id: "frustum", type: "loft", profiles: ["low", "high"] },
                    { id: "row", type: "linearPattern", body: "frustum", direction: [1, 0, 0], spacing: 10, count: 3 },
                    rectangle("tooth", 1, 1, { plane: "XY", offset: -30 }, [5, -0.5]),
                    { id: "teeth", type: "extrude", profile: "tooth", distance: 1 },
                    { id: "crown", type: "polarPattern", body: "teeth", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: 4, angle: 180 },
                    { id: "flip", type: "mirror", body: "teeth", plane: { origin: [0, 0, 0], normal: [1, 0, 0] } },
                    rectangle("cupBase", 10, 10, { plane: "XY", offset: -60 }),
                    { id: "cup", type: "extrude", profile: "cupBase", distance: 6 },
                    { id: "hollow", type: "shell", body: "cup", thickness: 1, open: { of: "cup", role: "end", count: 1 } },
                    { id: "cube", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: { expr: "gap" }, length: 2, height: 2, center: [0, 0, 80] } },
                    { id: "lift", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "cube" }, translation: [0, 0, { expr: "gap" }] }, body: "cube" },
                    { id: "other", type: "extrude", profile: "cupBase", distance: 2 },
                    { id: "merged", type: "boolean", operation: "difference", body: "cup", tools: ["other"] },
                    { id: "imported", type: "import", asset: "block" },
                ],
            };

            // Act
            const built = occt.design.build({ document, assets: { block: brep } });
            const code = occt.design.toTypeScript({ document, assets: { block: brep } });
            const parts = await execute(code, { block: brep });

            // Assert
            expect(built.report.filter(entry => entry.status !== "ok")).toEqual([]);
            expect(parts.map(part => part.properties)).toEqual(built.parts.map(() => ({})));
            expect(parts.map(part => volume(part.shape))).toEqual(built.parts.map(part => expect.closeTo(volume(part.shape), 4)));
            expect(code).toContain("const assets: Record<string, string | Uint8Array | ArrayBuffer> = {};");
        });

        it("should refuse a document that does not build or has problems", () => {
            // Arrange
            const failing: Document = {
                schemaVersion: 1,
                features: [rectangle("base", 4, 4, { plane: "XY" }), { id: "plate", type: "extrude", profile: "base", distance: 1 }, { id: "huge", type: "fillet", body: "plate", radius: 50, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }],
            };

            // Act
            const notBuilt = (): unknown => occt.design.toTypeScript({ document: failing });
            const broken = (): unknown => occt.design.toTypeScript({ document: { schemaVersion: 1, features: [{ id: "plate", type: "extrude", profile: "none", distance: 1 }] } });
            const badOverride = (): unknown => occt.design.toTypeScript({ document: failing, parameters: { nope: 1 } });

            // Assert
            expect(notBuilt).toThrow(InputError);
            expect(notBuilt).toThrow(/^The design document does not build with these values, so it has no code: "huge": /);
            expect(broken).toThrow("The design document has a problem: /features/0/profile:");
            expect(badOverride).toThrow("/parameters/nope: \"nope\" is not a parameter of this document.");
        });
    });
});
