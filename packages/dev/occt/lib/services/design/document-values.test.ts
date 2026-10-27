import { describe, expect, it } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";
import { designNumber, designParameterValues } from "./document-values";

const linkage: Models.OCCT.DesignAssemblyDocument = {
    schemaVersion: 1,
    kind: "assembly",
    parameters: { crank: 30, radius: 20, rod: { value: "radius * 4" } },
    configurations: [{ id: "top", values: { crank: 0 } }],
    components: [],
};

const thrownBy = (action: () => unknown): InputError => {
    try {
        action();
    } catch (error) {
        expect(error).toBeInstanceOf(InputError);
        return error as InputError;
    }
    throw new Error("expected an InputError, but nothing was thrown");
};

describe("design values without a kernel", () => {
    it("should evaluate every parameter after those it reads, a configuration's values and overrides over the document's", () => {
        // Act
        const plain = designParameterValues(linkage);
        const configured = designParameterValues(linkage, "top");
        const dragged = designParameterValues(linkage, "top", { crank: 90 });

        // Assert
        expect(plain).toEqual({ configuration: "", crank: 30, radius: 20, rod: 80 });
        expect(configured["crank"]).toBe(0);
        expect(dragged["crank"]).toBe(90);
    });

    it("should read a joint's expression over them, as a slider's offset follows a crank", () => {
        // Arrange
        const values = designParameterValues(linkage, undefined, { crank: 90 });

        // Act
        const offset = designNumber("radius * cos(crank) + sqrt(rod ^ 2 - (radius * sin(crank)) ^ 2)", values);

        // Assert
        expect(offset).toBeCloseTo(Math.sqrt(80 * 80 - 20 * 20), 9);
        expect(designNumber(12, values)).toBe(12);
    });

    it("should throw an input error at the configuration a document lacks and at an override it has no parameter for", () => {
        // Act
        const missing = thrownBy(() => designParameterValues(linkage, "missing"));
        const unknown = thrownBy(() => designParameterValues(linkage, undefined, { stroke: 4 }));
        const belowItsMinimum = thrownBy(() => designParameterValues({ ...linkage, parameters: { crank: { value: 30, min: 0 } } }, undefined, { crank: -1 }));

        // Assert
        expect([missing.message, missing.property]).toEqual(["/configurations: \"missing\" is not a configuration of this document.", "configuration"]);
        expect([unknown.message, unknown.property]).toEqual(["/parameters/stroke: \"stroke\" is not a parameter of this document.", "overrides"]);
        expect([belowItsMinimum.message, belowItsMinimum.property]).toEqual(["/parameters/crank: \"crank\" is -1, below its minimum 0.", "overrides"]);
    });

    it("should throw an input error at the document for a parameter value it holds itself", () => {
        // Act
        const looped = thrownBy(() => designParameterValues({ ...linkage, parameters: { a: "b + 1", b: "a + 1" } }));

        // Assert
        expect(looped.property).toBe("document");
        expect(looped.message).toMatch(/^\/parameters\/[ab]: "[ab]" depends on itself\.$/);
    });

    it("should throw an input error on an expression that names no parameter or gives no number", () => {
        // Arrange
        const values = designParameterValues(linkage);

        // Act
        const unknown = thrownBy(() => designNumber("unknown + 1", values));
        const text = thrownBy(() => designNumber("'raw'", values));

        // Assert
        expect([unknown.message, unknown.property]).toEqual(["\"unknown\" is not a parameter.", "value"]);
        expect([text.message, text.property]).toEqual(["A number is expected, and the expression gives text.", "value"]);
    });
});
