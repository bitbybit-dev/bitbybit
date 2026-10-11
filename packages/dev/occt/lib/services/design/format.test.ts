import { describe, it, expect } from "vitest";
import type { DesignFormat } from "./format";
import { DESIGN_FORMAT, lowestMinor, versionProblem } from "./format";

const RELEASED: DesignFormat = { released: true, major: 1, minor: 2 };

describe("design document format versions", () => {
    it("should read only schemaVersion 1 while the format is experimental", () => {
        // Act
        const problems = [1, "1.0", 2, 0, "1", undefined].map(value => versionProblem(value, { released: false, major: 1, minor: 0 }));

        // Assert
        expect(problems).toEqual([
            undefined,
            "schemaVersion \"1.0\" is a released format; this runner reads the experimental format, schemaVersion 1",
            "schemaVersion 2 is newer than this runner reads: it reads schemaVersion 1",
            "this runner reads schemaVersion 1",
            "this runner reads schemaVersion 1",
            "this runner reads schemaVersion 1",
        ]);
    });

    it("should be experimental today, at format 1.0", () => {
        // Assert
        expect(DESIGN_FORMAT).toEqual({ released: false, major: 1, minor: 0 });
        expect(versionProblem(1)).toBeUndefined();
    });

    it("should read every minor of its major up to its own once released", () => {
        // Act
        const problems = ["1.0", "1.1", "1.2"].map(value => versionProblem(value, RELEASED));

        // Assert
        expect(problems).toEqual([undefined, undefined, undefined]);
    });

    it("should refuse a newer minor, another major and the experimental format by name once released", () => {
        // Act
        const problems = ["1.3", "2.0", "0.9", 1].map(value => versionProblem(value, RELEASED));

        // Assert
        expect(problems).toEqual([
            "schemaVersion \"1.3\" is newer than this runner reads: it reads up to \"1.2\"; a newer package reads it",
            "schemaVersion \"2.0\" is format 2; this runner reads format 1",
            "schemaVersion \"0.9\" is format 0; this runner reads format 1",
            "schemaVersion 1 is the experimental format, which is not migrated: write the document again in format \"1.2\"",
        ]);
    });

    it.each(["1", "1.02", "01.0", "1.0.0", " 1.0", 1.5, null])("should refuse %j as a released version that is not major.minor text", (value) => {
        // Act
        const problem = versionProblem(value, RELEASED);

        // Assert
        expect(problem).toBe("schemaVersion is the format version as \"major.minor\" text, such as \"1.2\"");
    });

    it("should stamp the lowest minor whose additions a document uses", () => {
        // Arrange
        const additions = [
            { minor: 1, uses: (document: Readonly<Record<string, unknown>>): boolean => "loops" in document },
            { minor: 3, uses: (document: Readonly<Record<string, unknown>>): boolean => "replicate" in document },
        ];

        // Act
        const minors = [{}, { loops: [] }, { replicate: {} }, { loops: [], replicate: {} }].map(document => lowestMinor(document, additions));

        // Assert
        expect(minors).toEqual([0, 1, 3, 3]);
    });
});
