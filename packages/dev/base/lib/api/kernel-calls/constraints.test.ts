import { describe, it, expect } from "vitest";
import type { PropertyConstraint } from "./constraints";
import { constraintKinds as k } from "./constraints";

describe("constraintKinds", () => {
    it.each([
        ["number", k.number],
        ["boolean", k.boolean],
        ["string", k.string],
        ["color", k.color],
        ["point", k.point],
        ["point2", k.point2],
        ["point3", k.point3],
        ["vector2", k.vector2],
        ["vector3", k.vector3],
        ["opaque", k.opaque],
    ])("should spell %s as a constraint of that kind and nothing else", (kind, constraint) => {
        expect(constraint).toStrictEqual({ kind });
    });

    it("should spell a list with the constraint its items take", () => {
        // Act
        const list = k.list(k.point3);

        // Assert
        expect(list).toStrictEqual({ kind: "list", items: { kind: "point3" } });
        expect(list.items).toBe(k.point3);
    });

    it("should spell an enum with the values it accepts", () => {
        // Act
        const oneOf = k.oneOf(["top", "bottom"]);

        // Assert
        expect(oneOf).toStrictEqual({ kind: "oneOf", values: ["top", "bottom"] });
    });

    it("should mark a constraint required and keep the rest of it", () => {
        // Arrange
        const bounded: PropertyConstraint = { kind: "number", bounds: { min: 0 } };
        const listed = k.list(k.number);

        // Act
        const requiredBounded = k.required(bounded);
        const requiredList = k.required(listed);

        // Assert
        expect(requiredBounded).toStrictEqual({ kind: "number", bounds: { min: 0 }, required: true });
        expect(requiredList).toStrictEqual({ kind: "list", items: { kind: "number" }, required: true });
    });

    it("should mark a constraint optional and keep the rest of it", () => {
        // Arrange
        const bounded: PropertyConstraint = { kind: "number", bounds: { min: 0 } };

        // Act
        const optional = k.optional(bounded);
        const optionalOfRequired = k.optional(k.required(k.vector3));

        // Assert
        expect(optional).toStrictEqual({ kind: "number", bounds: { min: 0 }, required: false });
        expect(optionalOfRequired).toStrictEqual({ kind: "vector3", required: false });
        expect(bounded).toStrictEqual({ kind: "number", bounds: { min: 0 } });
    });

    it("should bound a constraint and keep the rest of it", () => {
        // Act
        const bounded = k.between(k.required(k.number), { min: 0, exclusiveMin: true });

        // Assert
        expect(bounded).toStrictEqual({ kind: "number", required: true, bounds: { min: 0, exclusiveMin: true } });
    });

    it("should leave the constraint it builds on unchanged", () => {
        // Act
        const required = k.required(k.number);
        const bounded = k.between(k.number, { max: 1 });

        // Assert
        expect(required).not.toBe(k.number);
        expect(bounded).not.toBe(k.number);
        expect(k.number).toStrictEqual({ kind: "number" });
    });
});
