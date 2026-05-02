import { describe, it, expect } from "vitest";
import { validateRequestBody, getEndpointSchema, BitbybitValidationError } from "./validator.js";

describe("validateRequestBody", () => {
    it("passes for a valid ExecuteBody", () => {
        // Arrange
        const body = { operation: "occt.shapes.solid.createBox", params: { width: 10 } };

        // Act & Assert
        expect(() => validateRequestBody("ExecuteBody", body)).not.toThrow();
    });

    it("throws BitbybitValidationError when required field is missing", () => {
        // Arrange
        const body = { params: { width: 10 } };

        // Act
        const act = () => validateRequestBody("ExecuteBody", body);

        // Assert
        expect(act).toThrow(BitbybitValidationError);
    });

    it("includes schema name in error message", () => {
        // Arrange
        const body = { params: { width: 10 } };

        // Act
        let error: BitbybitValidationError | undefined;
        try {
            validateRequestBody("ExecuteBody", body);
        } catch (e) {
            error = e as BitbybitValidationError;
        }

        // Assert
        expect(error).toBeInstanceOf(BitbybitValidationError);
        expect(error!.message).toContain("ExecuteBody");
    });

    it("populates errors array with OutputUnit objects", () => {
        // Arrange
        const body = { params: { width: 10 } };

        // Act
        let error: BitbybitValidationError | undefined;
        try {
            validateRequestBody("ExecuteBody", body);
        } catch (e) {
            error = e as BitbybitValidationError;
        }

        // Assert
        expect(error!.errors.length).toBe(2);
        expect(error!.errors[0]).toMatchObject({
            keyword: expect.any(String),
            instanceLocation: expect.any(String),
            error: expect.any(String),
        });
    });

    it("rejects extra properties when additionalProperties is false", () => {
        // Arrange
        const body = { operation: "test", bogus: 123 };

        // Act
        const act = () => validateRequestBody("ExecuteBody", body);

        // Assert
        expect(act).toThrow(BitbybitValidationError);
    });

    it("rejects DragonCupBody when height exceeds maximum of 50", () => {
        // Arrange
        const body = { params: { height: 999 }, outputs: { formats: ["gltf"] } };

        // Act
        const act = () => validateRequestBody("DragonCupBody", body);

        // Assert
        expect(act).toThrow(BitbybitValidationError);
    });

    it("passes for a valid DragonCupBody", () => {
        // Arrange
        const body = { params: { height: 8 }, outputs: { formats: ["gltf"] } };

        // Act & Assert
        expect(() => validateRequestBody("DragonCupBody", body)).not.toThrow();
    });

    it("rejects FileUploadBody missing required contentType and bytes", () => {
        // Arrange
        const body = { filename: "test.step" };

        // Act
        let error: BitbybitValidationError | undefined;
        try {
            validateRequestBody("FileUploadBody", body);
        } catch (e) {
            error = e as BitbybitValidationError;
        }

        // Assert
        expect(error).toBeInstanceOf(BitbybitValidationError);
        expect(error!.message).toContain("contentType");
        expect(error!.message).toContain("bytes");
    });

    it("skips validation silently for unknown schema names", () => {
        // Arrange
        const body = { anything: true };

        // Act & Assert
        expect(() => validateRequestBody("NonExistentSchema", body)).not.toThrow();
    });

    it("passes for a valid PipelineBody", () => {
        // Arrange
        const body = {
            steps: [{ operation: "occt.shapes.solid.createBox", params: { width: 10 } }],
        };

        // Act & Assert
        expect(() => validateRequestBody("PipelineBody", body)).not.toThrow();
    });

    it("rejects PipelineBody with empty steps array", () => {
        // Arrange
        const body = { steps: [] };

        // Act
        const act = () => validateRequestBody("PipelineBody", body);

        // Assert
        expect(act).toThrow(BitbybitValidationError);
    });
});

describe("getEndpointSchema", () => {
    it("returns schema name for known static endpoint", () => {
        // Act
        const result = getEndpointSchema("cad.execute");

        // Assert
        expect(result).toBe("ExecuteBody");
    });

    it("returns schema name for cad.pipeline", () => {
        // Act
        const result = getEndpointSchema("cad.pipeline");

        // Assert
        expect(result).toBe("PipelineBody");
    });

    it("returns schema name for files.upload", () => {
        // Act
        const result = getEndpointSchema("files.upload");

        // Assert
        expect(result).toBe("FileUploadBody");
    });

    it("returns schema name for per-model endpoint", () => {
        // Act
        const result = getEndpointSchema("models.submit.dragon-cup");

        // Assert
        expect(result).toBe("DragonCupBody");
    });

    it("returns undefined for unknown endpoint key", () => {
        // Act
        const result = getEndpointSchema("unknown.endpoint");

        // Assert
        expect(result).toBe(undefined);
    });
});

describe("BitbybitValidationError", () => {
    it("has name set to BitbybitValidationError", () => {
        // Arrange
        const errors = [{ keyword: "required", keywordLocation: "", instanceLocation: "#", error: "missing field" }];

        // Act
        const error = new BitbybitValidationError("TestSchema", errors);

        // Assert
        expect(error.name).toBe("BitbybitValidationError");
    });

    it("extends Error", () => {
        // Arrange
        const errors = [{ keyword: "required", keywordLocation: "", instanceLocation: "#", error: "missing field" }];

        // Act
        const error = new BitbybitValidationError("TestSchema", errors);

        // Assert
        expect(error).toBeInstanceOf(Error);
    });

    it("stores errors array", () => {
        // Arrange
        const errors = [
            { keyword: "required", keywordLocation: "", instanceLocation: "#", error: "missing a" },
            { keyword: "type", keywordLocation: "", instanceLocation: "#/b", error: "wrong type" },
        ];

        // Act
        const error = new BitbybitValidationError("TestSchema", errors);

        // Assert
        expect(error.errors).toStrictEqual(errors);
    });
});
