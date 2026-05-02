import { describe, it, expect } from "vitest";
import { BitbybitApiError } from "./errors.js";

describe("BitbybitApiError", () => {
    it("sets all properties from constructor options", () => {
        // Arrange
        const opts = {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            statusCode: 400,
            details: { field: "name" },
            requestId: "req-123",
        };

        // Act
        const error = new BitbybitApiError(opts);

        // Assert
        expect(error.code).toBe("VALIDATION_ERROR");
        expect(error.message).toBe("Invalid input");
        expect(error.statusCode).toBe(400);
        expect(error.details).toStrictEqual({ field: "name" });
        expect(error.requestId).toBe("req-123");
    });

    it("extends Error", () => {
        // Act
        const error = new BitbybitApiError({ code: "TEST", message: "test", statusCode: 500 });

        // Assert
        expect(error).toBeInstanceOf(Error);
    });

    it("has name set to BitbybitApiError", () => {
        // Act
        const error = new BitbybitApiError({ code: "TEST", message: "test", statusCode: 500 });

        // Assert
        expect(error.name).toBe("BitbybitApiError");
    });

    it("leaves details undefined when not provided", () => {
        // Act
        const error = new BitbybitApiError({ code: "TEST", message: "test", statusCode: 500 });

        // Assert
        expect(error.details).toBe(undefined);
    });

    it("leaves requestId undefined when not provided", () => {
        // Act
        const error = new BitbybitApiError({ code: "TEST", message: "test", statusCode: 500 });

        // Assert
        expect(error.requestId).toBe(undefined);
    });
});
