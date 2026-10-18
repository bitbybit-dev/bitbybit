import { describe, expect, it } from "vitest";
import { diamondKnurlMesh } from "./knurl-mesh";

const spec = (length: number) => ({ crest: 5, root: 4.6, grooves: 31, twist: Math.tan(Math.PI / 6) / 5, length, outside: 5.5 });

const edgeUses = (indices: number[]): Map<string, number> => {
    const uses = new Map<string, number>();
    for (let index = 0; index < indices.length; index += 3) {
        const corners = [indices[index]!, indices[index + 1]!, indices[index + 2]!];
        corners.forEach((corner, at) => {
            const next = corners[(at + 1) % 3]!;
            const key = corner < next ? `${String(corner)}:${String(next)}` : `${String(next)}:${String(corner)}`;
            uses.set(key, (uses.get(key) ?? 0) + 1);
        });
    }
    return uses;
};

describe("diamondKnurlMesh", () => {
    it.each([
        ["a length clipped between rows", 10],
        ["a length of whole rows", 6 * Math.PI / (31 * Math.tan(Math.PI / 6) / 5)],
        ["a length shorter than a row", 0.3],
    ])("should close its mesh for %s: every edge shared by two triangles", (_, length) => {
        // Act
        const mesh = diamondKnurlMesh(spec(length));

        // Assert
        expect(mesh.indices.length % 3).toBe(0);
        expect([...edgeUses(mesh.indices).values()].every(uses => uses === 2)).toBe(true);
    });

    it("should keep every vertex between the chords of the roots and the wall, from z 0 to the length", () => {
        // Act
        const mesh = diamondKnurlMesh(spec(10));

        // Assert
        const radii: number[] = [];
        const heights: number[] = [];
        for (let index = 0; index < mesh.positions.length; index += 3) {
            radii.push(Math.hypot(mesh.positions[index]!, mesh.positions[index + 1]!));
            heights.push(mesh.positions[index + 2]!);
        }
        expect(Math.min(...radii)).toBeGreaterThanOrEqual(4.6 * Math.cos(Math.PI / 62) - 1e-9);
        expect(Math.max(...radii)).toBeCloseTo(5.5 / Math.cos(Math.PI / 62), 9);
        expect(Math.min(...heights)).toBe(0);
        expect(Math.max(...heights)).toBeCloseTo(10, 12);
    });

    it("should put the apexes on the crests and the corners on the roots, rows of 62 a row apart", () => {
        // Act
        const mesh = diamondKnurlMesh(spec(10));

        // Assert
        const step = Math.PI / (31 * Math.tan(Math.PI / 6) / 5);
        const firstRow: number[] = [];
        for (let index = 0; index < mesh.positions.length; index += 3) {
            if (mesh.positions[index + 2] === 0) {
                firstRow.push(Math.hypot(mesh.positions[index]!, mesh.positions[index + 1]!));
            }
        }
        expect(firstRow.filter(radius => Math.abs(radius - 5) < 1e-9)).toHaveLength(31);
        expect(firstRow.filter(radius => Math.abs(radius - 4.6) < 1e-9)).toHaveLength(31);
        const secondRow = mesh.positions.filter((_, index) => index % 3 === 2 && Math.abs(mesh.positions[index]! - step) < 1e-9);
        expect(secondRow).toHaveLength(62);
    });
});
