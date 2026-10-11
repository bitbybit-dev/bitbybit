import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { parameterValues, textOf } from "./values";
import { DesignProblem } from "./problems";

type Part = Models.OCCT.DesignPartDocument;
type Assembly = Models.OCCT.DesignAssemblyDocument;

const BLOCK_ID = "44444444-4444-4444-8444-444444444444";
const RACK_ID = "55555555-5555-4555-8555-555555555555";

const FINISHES = [{ value: "steel" }, { value: "aluminium" }];

const block = (part: Partial<Models.OCCT.DesignPart>, parameters: NonNullable<Part["parameters"]> = {}): Part => ({
    schemaVersion: 1,
    id: BLOCK_ID,
    parameters: { heavy: true, finish: { type: "choice", value: { expr: "if(heavy, 'steel', 'aluminium')" }, options: FINISHES }, ...parameters },
    materials: [{ id: "steel", density: 7850 }, { id: "aluminium", density: 2700 }],
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "close" }] },
        { id: "block", type: "extrude", profile: "base", distance: 10 },
    ],
    parts: [{ id: "block", body: "block", ...part }],
});

const problemOf = (run: () => unknown): DesignProblem => {
    try {
        run();
    } catch (error) {
        if (error instanceof DesignProblem) {
            return error;
        }
        throw error;
    }
    throw new Error("expected a problem");
};

describe("text values in design documents", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    describe("parameters", () => {
        it("should compute a choice from an expression, in its own value, a configuration and an override", () => {
            // Arrange
            const parameters = { heavy: true, finish: { type: "choice", value: { expr: "if(heavy, 'steel', 'aluminium')" }, options: FINISHES } };
            const configurations = [{ id: "light", values: { heavy: false } }, { id: "named", values: { finish: { expr: "'steel'" } } }];

            // Act
            const own = parameterValues(parameters, configurations, {});
            const light = parameterValues(parameters, configurations, { configuration: "light" });
            const named = parameterValues(parameters, configurations, { configuration: "named", overrides: { heavy: false } });

            // Assert
            expect([own.get("finish"), light.get("finish"), named.get("finish")]).toEqual(["steel", "aluminium", "steel"]);
        });

        it("should refuse a computed choice outside its options and a computed text that is a number", () => {
            // Act
            const outside = problemOf(() => parameterValues({ finish: { type: "choice", value: { expr: "'brass'" }, options: FINISHES } }, undefined, {}));
            const number = problemOf(() => parameterValues({ code: { type: "text", value: { expr: "1 + 2" } } }, undefined, {}));

            // Assert
            expect(outside.message).toBe("\"finish\" is \"brass\", not one of the options: steel, aluminium");
            expect(number.message).toBe("\"code\" is a text parameter and its expression gives a number");
        });

        it("should read text as written, and compute it from { expr }", () => {
            // Arrange
            const values = new Map([["heavy", 1]]);

            // Act
            const written = textOf("if(heavy, 'a', 'b')", values, "/x");
            const computed = textOf({ expr: "if(heavy, 'a', 'b')" }, values, "/x");
            const number = problemOf(() => textOf({ expr: "heavy + 1" }, values, "/x"));
            const neither = problemOf(() => textOf(5, values, "/x"));

            // Assert
            expect([written, computed]).toEqual(["if(heavy, 'a', 'b')", "a"]);
            expect([number.path, number.message]).toEqual(["/x/expr", "text is expected, and the expression gives 2"]);
            expect(neither.message).toBe("text or { expr } is expected");
        });
    });

    describe("parts", () => {
        it("should choose a part's material and colours by expression", () => {
            // Arrange
            const document = block({ material: { expr: "finish" }, appearance: { color: { expr: "if(heavy, '#ff0000', '#00ff00')" }, edgeColor: { expr: "'#111111'" }, faces: [] } });

            // Act
            const heavy = occt.design.build({ document });
            const light = occt.design.build({ document, parameters: { heavy: false } });

            // Assert
            expect([heavy.parts[0]!.material?.id, heavy.parts[0]!.appearance?.color, heavy.parts[0]!.appearance?.edgeColor]).toEqual(["steel", "#ff0000", "#111111"]);
            expect([light.parts[0]!.material?.id, light.parts[0]!.appearance?.color]).toEqual(["aluminium", "#00ff00"]);
            expect(light.parts[0]!.mass).toBeCloseTo(1000 * 1e-9 * 2700, 9);
        });

        it("should report a computed material or colour the document does not have, and leave it out", () => {
            // Arrange
            const document = block({ material: { expr: "if(heavy, 'brass', 'steel')" }, appearance: { color: { expr: "'red'" }, faces: [] } });

            // Act
            const built = occt.design.build({ document });

            // Assert
            expect(built.issues).toEqual([
                { path: "/parts/0/material", message: "\"brass\" is not a material of this document" },
                { path: "/parts/0/appearance/color", message: "a colour is #rrggbb, not \"red\"" },
            ]);
            expect(built.parts[0]!.material).toBeUndefined();
        });

        it("should check the names in computed colours and materials before building", () => {
            // Arrange
            const material = block({ material: { expr: "kind" } });
            const colour = block({ appearance: { color: { expr: "tone" }, faces: [] } });
            const malformed: Part = JSON.parse(JSON.stringify(block({ appearance: { faces: [] } })).replace("\"faces\":[]", "\"emissive\":{\"expr\":5},\"faces\":[]"));

            // Act
            const issues = [material, colour, malformed].map(document => occt.design.validate({ document }));

            // Assert
            expect(issues).toEqual([
                [{ path: "/parts/0/material/expr", message: "\"kind\" is not a parameter of this document" }],
                [{ path: "/parts/0/appearance/color/expr", message: "\"tone\" is not a parameter of this document" }],
                [{ path: "/parts/0/appearance/emissive", message: "a colour is #rrggbb or { expr }" }],
            ]);
        });

        it("should write a computed material as code in TypeScript", () => {
            // Arrange
            const document = block({ material: { expr: "finish" } });

            // Act
            const code = occt.design.toTypeScript({ document });

            // Assert
            expect(code).toContain("const finish = (heavy ? \"steel\" : \"aluminium\");");
            expect(code.indexOf("const heavy = 1;")).toBeLessThan(code.indexOf("const finish = "));
            expect(code).toContain("material: finish,");
        });
    });

    describe("component sources", () => {
        const rack = (parameters: NonNullable<Models.OCCT.DesignComponentSource["parameters"]>): Assembly => ({
            schemaVersion: 1,
            kind: "assembly",
            id: RACK_ID,
            parameters: { tall: true },
            components: [{ id: "block", source: { document: BLOCK_ID, part: "block", parameters } }],
        });

        it("should give a choice parameter text as written, or as its expression computes it", () => {
            // Arrange
            const written = rack({ finish: "aluminium" });
            const computed = rack({ finish: { expr: "if(tall, 'steel', 'aluminium')" } });
            const document = block({ material: { expr: "finish" } });

            // Act
            const fromWritten = occt.design.build({ document: written, documents: [document] });
            const fromComputed = occt.design.build({ document: computed, documents: [document], parameters: { tall: false } });

            // Assert
            expect(fromWritten.parts[0]!.material?.id).toBe("aluminium");
            expect(fromComputed.parts[0]!.material?.id).toBe("aluminium");
            expect(fromComputed.parts[0]!.parameters).toEqual({ finish: "aluminium" });
        });

        it("should refuse { expr } for a number or boolean parameter and text a choice does not offer", () => {
            // Act
            const wrongForm = occt.design.validate({ document: rack({ heavy: { expr: "tall" } }), documents: [block({})] });
            const notOffered = occt.design.validate({ document: rack({ finish: "brass" }), documents: [block({})] });
            const notText = occt.design.validate({ document: rack({ finish: 3 }), documents: [block({})] });

            // Assert
            expect(wrongForm).toEqual([{ path: "/components/0/source/parameters/heavy", message: "\"heavy\" is a boolean parameter: give a number, a boolean or an expression, and keep { expr } for text" }]);
            expect(notOffered).toEqual([{ path: "/components/0/source/parameters/finish", message: "\"brass\" is not one of the options of \"finish\": steel, aluminium" }]);
            expect(notText).toEqual([{ path: "/components/0/source/parameters/finish", message: "\"finish\" is a choice parameter: give text, or { expr } to compute it" }]);
        });
    });
});
