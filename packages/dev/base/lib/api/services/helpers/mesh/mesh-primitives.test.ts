import { describe, expect, it } from "vitest";
import { signedVolumeOf } from "./mesh-measures";
import { frustum, icosphere } from "./mesh-primitives";

function edgeUses(indices: readonly number[]): Map<string, number> {
    const uses = new Map<string, number>();
    for (let at = 0; at < indices.length; at += 3) {
        const corners = [indices[at]!, indices[at + 1]!, indices[at + 2]!];
        corners.forEach((from, corner) => {
            const key = `${from}>${corners[(corner + 1) % 3]!}`;
            uses.set(key, (uses.get(key) ?? 0) + 1);
        });
    }
    return uses;
}

function isClosed(indices: readonly number[]): boolean {
    const uses = edgeUses(indices);
    return [...uses].every(([key, count]) => {
        const [from, to] = key.split(">");
        return count === 1 && uses.get(`${to}>${from}`) === 1;
    });
}

describe("icosphere", () => {
    it("should start from an icosahedron of twelve corners on the unit sphere, closed and facing out", () => {
        // Act
        const mesh = icosphere(0);

        // Assert
        expect([mesh.positions.length / 3, mesh.indices.length / 3]).toEqual([12, 20]);
        expect(isClosed(mesh.indices)).toBe(true);
        expect(signedVolumeOf(mesh.positions, mesh.indices)).toBeGreaterThan(2.5);
    });

    it("should split every face into four at each level, sharing the new corners, keeping them on the sphere and the volume just inside it", () => {
        // Act
        const mesh = icosphere(2);

        // Assert
        const lengths = Array.from({ length: mesh.positions.length / 3 }, (_, vertex) => Math.hypot(mesh.positions[vertex * 3]!, mesh.positions[vertex * 3 + 1]!, mesh.positions[vertex * 3 + 2]!));
        expect([mesh.positions.length / 3, mesh.indices.length / 3]).toEqual([162, 320]);
        expect(lengths.every((length) => Math.abs(length - 1) < 1e-12)).toBe(true);
        expect(isClosed(mesh.indices)).toBe(true);
        const share = signedVolumeOf(mesh.positions, mesh.indices) / (4 / 3 * Math.PI);
        expect(share).toBeGreaterThan(0.96);
        expect(share).toBeLessThan(1);
    });
});

describe("frustum", () => {
    it("should close a ring at the base and a narrower one at the top, facing out, with the volume of its prism", () => {
        // Act
        const mesh = frustum(4, 1, 0.5, 2);

        // Assert
        const area = (radius: number): number => 2 * radius * radius;
        const expected = 2 / 3 * (area(1) + area(0.5) + Math.sqrt(area(1) * area(0.5)));
        expect([mesh.positions.length / 3, mesh.indices.length / 3]).toEqual([10, 16]);
        expect(isClosed(mesh.indices)).toBe(true);
        expect(signedVolumeOf(mesh.positions, mesh.indices)).toBeCloseTo(expected, 12);
    });
});
