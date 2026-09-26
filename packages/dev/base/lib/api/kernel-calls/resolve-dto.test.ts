import { describe, it, expect } from "vitest";
import { resolveDto, resolveInputs, isRegisteredOperation, DtoRegistry } from "./resolve-dto";

class LabelDto {
    text = "label";
    size = 12;
}

class BoxDto {
    shape!: object;
    width = 1;
    center: number[] = [0, 0, 0];
    tag?: string | undefined;
    label?: LabelDto | undefined;
}

const registry: DtoRegistry = {
    "shapes.solid.createBox": { dto: BoxDto, nested: { label: LabelDto } },
    "transforms.identityTransform": {},
};

describe("resolveDto", () => {
    it("should fill every default a caller left out", () => {
        // Act
        const resolved = resolveDto(BoxDto, { width: 5 });

        // Assert
        expect(resolved).toEqual({ width: 5, center: [0, 0, 0] });
    });

    it("should keep the default when a caller passes undefined for it", () => {
        // Act
        const resolved = resolveDto(BoxDto, { width: undefined });

        // Assert
        expect(resolved.width).toBe(1);
    });

    it("should carry over the properties that have no default", () => {
        // Arrange
        const shape = { id: "s" };

        // Act
        const resolved = resolveDto(BoxDto, { shape, tag: "a" });

        // Assert
        expect(resolved.shape).toBe(shape);
        expect(resolved.tag).toBe("a");
    });

    it("should give the defaults alone to a caller that passed nothing", () => {
        // Act
        const resolved = resolveDto(BoxDto, undefined);

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0] });
    });

    it("should build a new object and leave the caller's untouched", () => {
        // Arrange
        const inputs = { width: 5 };

        // Act
        const resolved = resolveDto(BoxDto, inputs);

        // Assert
        expect(resolved).not.toBe(inputs);
        expect(inputs).toEqual({ width: 5 });
    });

    it("should return a plain object rather than an instance of the DTO class", () => {
        // Act
        const resolved = resolveDto(BoxDto, { width: 5 });

        // Assert
        expect(Object.getPrototypeOf(resolved)).toBe(Object.prototype);
    });

    it("should hand every call its own copy of a list default", () => {
        // Act
        const first = resolveDto(BoxDto, {});
        const second = resolveDto(BoxDto, {});

        // Assert
        expect(first.center).not.toBe(second.center);
    });

    it("should apply the defaults of a DTO held by a nested property", () => {
        // Act
        const resolved = resolveDto(BoxDto, { label: { text: "top" } }, { label: LabelDto });

        // Assert
        expect(resolved.label).toEqual({ text: "top", size: 12 });
    });

    it("should leave a nested property the caller did not pass unset", () => {
        // Act
        const resolved = resolveDto(BoxDto, {}, { label: LabelDto });

        // Assert
        expect(resolved.label).toBeUndefined();
    });

    it("should ignore inputs that are not an object", () => {
        // Act
        const resolved = resolveDto(BoxDto, [1, 2]);

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0] });
    });

    it("should give the defaults alone to a caller that passed null", () => {
        // Act
        const resolved = resolveDto(BoxDto, null);

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0] });
    });

    it("should give a property the caller set to null its default when the DTO has one", () => {
        // Act
        const resolved = resolveDto(BoxDto, { width: null, center: null });

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0] });
    });

    it("should carry null over a property the DTO has no default for", () => {
        // Act
        const resolved = resolveDto(BoxDto, { shape: null, tag: null, extra: null });

        // Assert
        expect(resolved).toEqual({ shape: null, width: 1, center: [0, 0, 0], tag: null, extra: null });
    });

    it("should give a property of a nested DTO the caller set to null its default", () => {
        // Act
        const resolved = resolveDto(BoxDto, { label: { text: null } }, { label: LabelDto });

        // Assert
        expect(resolved.label).toEqual({ text: "label", size: 12 });
    });

    it("should carry null over a property named like a member every object inherits, which is no default", () => {
        // Act
        const resolved = resolveDto(BoxDto, { constructor: null });

        // Assert
        expect(Object.getOwnPropertyDescriptor(resolved, "constructor")?.value).toBeNull();
    });

    it("should carry over a property the DTO does not declare", () => {
        // Act
        const resolved = resolveDto(BoxDto, { widht: 5 });

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0], widht: 5 });
    });

    it("should return a plain copy when the caller passes an instance of the DTO", () => {
        // Arrange
        const instance = new BoxDto();
        instance.width = 3;

        // Act
        const resolved = resolveDto(BoxDto, instance);

        // Assert
        expect(resolved).not.toBe(instance);
        expect(Object.getPrototypeOf(resolved)).toBe(Object.prototype);
        expect(resolved.width).toBe(3);
    });

    it.each([
        ["text", "top"],
        ["null", null],
        ["a list", ["top"]],
    ])("should keep a nested property holding %s as the caller gave it", (_what, label) => {
        // Act
        const resolved = resolveDto(BoxDto, { label }, { label: LabelDto });

        // Assert
        expect(resolved.label).toBe(label);
    });

    it("should resolve a nested DTO into a new object and leave the caller's nested object untouched", () => {
        // Arrange
        const label = { text: "top" };

        // Act
        const resolved = resolveDto(BoxDto, { label }, { label: LabelDto });

        // Assert
        expect(resolved.label).not.toBe(label);
        expect(Object.getPrototypeOf(resolved.label)).toBe(Object.prototype);
        expect(label).toStrictEqual({ text: "top" });
    });
});

describe("resolveInputs", () => {
    it("should resolve the inputs of a listed operation against its DTO", () => {
        // Act
        const resolved = resolveInputs(registry, "shapes.solid.createBox", { label: {} });

        // Assert
        expect(resolved).toEqual({ width: 1, center: [0, 0, 0], label: { text: "label", size: 12 } });
    });

    it("should hand a listed operation a new object and leave the caller's inputs untouched", () => {
        // Arrange
        const inputs = { width: 5 };

        // Act
        const resolved = resolveInputs(registry, "shapes.solid.createBox", inputs);

        // Assert
        expect(resolved).not.toBe(inputs);
        expect(resolved).toEqual({ width: 5, center: [0, 0, 0] });
        expect(inputs).toStrictEqual({ width: 5 });
    });

    it("should pass the inputs of an operation that takes no DTO through as they are", () => {
        // Arrange
        const inputs = {};

        // Act
        const resolved = resolveInputs(registry, "transforms.identityTransform", inputs);

        // Assert
        expect(resolved).toBe(inputs);
    });

    it("should pass the inputs of an unlisted operation through as they are", () => {
        // Arrange
        const inputs = { anything: 1 };

        // Act
        const resolved = resolveInputs(registry, "plugins.advanced.anything", inputs);

        // Assert
        expect(resolved).toBe(inputs);
    });

    it("should not mistake an inherited object member for a listed operation", () => {
        // Arrange
        const inputs = { anything: 1 };

        // Act
        const resolved = resolveInputs(registry, "toString", inputs);

        // Assert
        expect(resolved).toBe(inputs);
    });
});

describe("isRegisteredOperation", () => {
    it("should report a listed path as registered", () => {
        expect(isRegisteredOperation(registry, "transforms.identityTransform")).toBe(true);
    });

    it("should report a path the registry does not list as unregistered", () => {
        expect(isRegisteredOperation(registry, "__proto__")).toBe(false);
    });
});
