import { resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { ifcDtoRegistry } from "./dto-registry";
import { IFCService } from "./ifc-service";

const methodAt = (root: object, path: string): unknown => path.split(".").reduce<unknown>((owner, segment) => (owner === null || owner === undefined ? undefined : Reflect.get(owner, segment)), root);

describe("the IFC operation registry", () => {
    const ifc = new IFCService();

    it("should name a method for every listed path", () => {
        // Act
        const missing = Object.keys(ifcDtoRegistry).filter((path) => typeof methodAt(ifc, path) !== "function");

        // Assert
        expect(missing).toEqual([]);
    });

    it("should list every public method of every service", () => {
        // Act
        const services = Object.entries(ifc).flatMap(([name, service]: [string, object]) => Object.getOwnPropertyNames(Object.getPrototypeOf(service))
            .filter((method) => method !== "constructor")
            .map((method) => `${name}.${method}`));

        // Assert
        expect(services.filter((path) => !(path in ifcDtoRegistry))).toEqual([]);
    });

    it("should list only DTO classes that construct with no arguments", () => {
        // Act
        const built = Object.values(ifcDtoRegistry).flatMap((entry) => (entry.dto ? [new entry.dto()] : []));

        // Assert
        expect(built.every((dto) => typeof dto === "object")).toBe(true);
    });

    it("should find nothing wrong with the defaults of the DTO each operation takes", () => {
        // Act
        const issues = Object.entries(ifcDtoRegistry).flatMap(([path, entry]) => (entry.dto ? validateInputs(ifcDtoRegistry, path, new entry.dto()) : [])
            .filter((found) => found.code !== "required")
            .map((found) => `${path} ${found.property} ${found.code}`));

        // Assert
        expect(issues).toEqual([]);
    });

    it("should report a wall height at its exclusive minimum and a transparency above its maximum", () => {
        // Act
        const wall = validateInputs(ifcDtoRegistry, "walls.add", resolveInputs(ifcDtoRegistry, "walls.add", { model: {}, storey: "ground", start: [0, 0], end: [1, 0], height: 0 }));
        const material = validateInputs(ifcDtoRegistry, "materials.add", resolveInputs(ifcDtoRegistry, "materials.add", { model: {}, transparency: 2 }));

        // Assert
        expect(wall.map((issue) => `${issue.property} ${issue.code}`)).toEqual(["height minimum"]);
        expect(material.map((issue) => `${issue.property} ${issue.code}`)).toEqual(["transparency maximum"]);
    });

    it("should report a wall start of three coordinates where two are needed", () => {
        // Act
        const issues = validateInputs(ifcDtoRegistry, "walls.add", resolveInputs(ifcDtoRegistry, "walls.add", { model: {}, storey: "ground", start: [0, 0, 0], end: [1, 0] }));

        // Assert
        expect(issues.map((issue) => `${issue.property} ${issue.code}`)).toEqual(["start arity"]);
    });
});
