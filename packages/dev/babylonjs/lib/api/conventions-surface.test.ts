import { describe, expect, it } from "vitest";
import { CONVENTIONS_SURFACE } from "@bitbybit-dev/core";
import { BitByBitBase } from "./bitbybit-base";

describe("the operations a conventions level changes, on the root object", () => {
    const bitbybit = new BitByBitBase();
    const reached = (entry: string): unknown => entry.split(".").filter((name) => name !== "").reduce<unknown>((holder, name) => (typeof holder === "object" && holder !== null ? Reflect.get(holder, name) : undefined), bitbybit);

    it("should name only services and methods a script can reach", () => {
        // Act
        const unreachable = CONVENTIONS_SURFACE.filter((entry) => typeof reached(entry) !== (entry.endsWith(".") ? "object" : "function"));

        // Assert
        expect(unreachable).toEqual([]);
    });

    it("should hold every method of the engine's file service that reads or writes a model file", () => {
        // Act
        const io = Object.getOwnPropertyNames(Object.getPrototypeOf(bitbybit.babylon.io) as object).filter((name) => /Stl$|^loadAssetInto/.test(name) && name !== "downloadStl");

        // Assert
        expect(io.filter((name) => !CONVENTIONS_SURFACE.includes(`babylon.io.${name}`))).toEqual([]);
        expect(io.length).toBeGreaterThan(0);
    });
});
