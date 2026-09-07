import { describe, it, expect } from "vitest";
import { uniqueName } from "./unique-name";

const PREFIX = "BabylonMesh";
const SAMPLE_SIZE = 100;
// The shape a glTF importer must not be able to read as a duplicate counter: a dot, then digits.
const A_SESSION_AND_COUNTER = /^BabylonMesh-[0-9a-z]{8}-\d+$/;
const A_DUPLICATE_COUNTER_SUFFIX = /\.\d+$/;

describe("uniqueName", () => {
    it("should never repeat a name", () => {
        // Act
        const names = Array.from({ length: SAMPLE_SIZE }, () => uniqueName(PREFIX));

        // Assert
        expect(new Set(names).size).toBe(SAMPLE_SIZE);
    });

    it("should keep the prefix and add a session part and a counter after it", () => {
        // Act
        const name = uniqueName(PREFIX);

        // Assert
        expect(name).toMatch(A_SESSION_AND_COUNTER);
    });

    it("should produce no name an importer could read as a duplicate counter", () => {
        // Act
        const names = Array.from({ length: SAMPLE_SIZE }, () => uniqueName(PREFIX));

        // Assert
        expect(names.filter((name) => name.includes("."))).toEqual([]);
        expect(names.filter((name) => A_DUPLICATE_COUNTER_SUFFIX.test(name))).toEqual([]);
    });

    it("should carry one session part shared by every name in this context", () => {
        // Act
        const sessions = Array.from({ length: SAMPLE_SIZE }, () => uniqueName(PREFIX).split("-")[1]);

        // Assert
        expect(new Set(sessions).size).toBe(1);
    });

    it("should not collide with a name minted by another session", () => {
        // Arrange - what an imported model, or another tab, would carry: the same prefix and
        // counter, a different session part.
        const ours = uniqueName(PREFIX);
        const [prefix, , count] = ours.split("-");
        const theirs = `${prefix}-00000000-${count}`;

        // Assert
        expect(ours).not.toBe(theirs);
    });

    it("should keep names distinct across different prefixes", () => {
        // Act
        const first = uniqueName("node");
        const second = uniqueName("root");

        // Assert
        expect(first.startsWith("node-")).toBe(true);
        expect(second.startsWith("root-")).toBe(true);
        expect(first).not.toBe(second);
    });
});
