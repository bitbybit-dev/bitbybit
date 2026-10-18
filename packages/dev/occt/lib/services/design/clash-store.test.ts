import { describe, it, expect } from "vitest";
import { ClashStore } from "./clash-store";
import type * as Models from "../../api/models";
import type { ClashPartMesh } from "../analysis/clash-types";
import { KEPT_MESH_BYTES, KEPT_PAIRS, KEPT_SOLIDS } from "./constants";

describe("the clash store", () => {
    const sized = (bytes: number): ClashPartMesh => ({ positions: new Float64Array(0), indices: { byteLength: bytes } as Uint32Array });
    const counting = (): { readonly make: () => ClashPartMesh; readonly made: () => number } => {
        let count = 0;
        return {
            make: (): ClashPartMesh => {
                count++;
                return sized(KEPT_MESH_BYTES * 0.4);
            },
            made: (): number => count,
        };
    };

    it("should keep meshes within its byte budget, dropping the one used longest ago", () => {
        // Arrange
        const store = new ClashStore();
        const first = counting();
        const second = counting();
        const third = counting();

        // Act
        store.mesh("first", first.make);
        store.mesh("second", second.make);
        store.mesh("first", first.make);
        store.mesh("third", third.make);
        store.mesh("first", first.make);
        store.mesh("second", second.make);

        // Assert
        expect([first.made(), second.made(), third.made()]).toEqual([1, 2, 1]);
    });

    it("should keep a mesh bigger than the whole budget until the next one arrives", () => {
        // Arrange
        const store = new ClashStore();
        let made = 0;
        const huge = (): ClashPartMesh => {
            made++;
            return sized(KEPT_MESH_BYTES * 2);
        };

        // Act
        store.mesh("huge", huge);
        store.mesh("huge", huge);
        store.mesh("small", () => sized(1));
        store.mesh("huge", huge);

        // Assert
        expect(made).toBe(2);
    });

    it("should keep exactly so many solid answers and measured pairs, dropping only the oldest", () => {
        // Arrange
        const store = new ClashStore();
        const keys = (most: number): string[] => Array.from({ length: most + 1 }, (_, index) => `part ${index}`);
        const touch: Models.OCCT.Clash[] = [{ indexA: 0, indexB: 1, distance: 0, volume: 0, pointA: [0, 0, 0], pointB: [0, 0, 0] }];

        // Act
        keys(KEPT_SOLIDS).forEach(key => store.meshable(key, () => true));
        keys(KEPT_PAIRS).forEach(key => store.pair(key, () => []));
        const second = [store.meshable("part 1", () => false), store.pair("part 1", () => touch).length];
        const oldest = [store.meshable("part 0", () => false), store.pair("part 0", () => touch).length];

        // Assert
        expect(second).toEqual([true, 0]);
        expect(oldest).toEqual([false, 1]);
    });

    it("should count an answer it gives again as new, so the one unused longest goes first", () => {
        // Arrange
        const store = new ClashStore();
        Array.from({ length: KEPT_SOLIDS }, (_, index) => store.meshable(`part ${index}`, () => true));

        // Act
        store.meshable("part 0", () => false);
        store.meshable("one more", () => true);
        const kept = store.meshable("part 0", () => false);
        const dropped = store.meshable("part 1", () => false);

        // Assert
        expect(kept).toBe(true);
        expect(dropped).toBe(false);
    });

    it("should forget everything it keeps when cleared", () => {
        // Arrange
        const store = new ClashStore();
        store.mesh("a", () => ({ positions: new Float64Array(3), indices: new Uint32Array(3) }));
        store.meshable("a", () => true);
        store.pair("a", () => []);

        // Act
        store.clear();

        // Assert
        expect(store.mesh("a", () => ({ positions: new Float64Array(6), indices: new Uint32Array(3) })).positions).toHaveLength(6);
        expect(store.meshable("a", () => false)).toBe(false);
        expect(store.pair("a", () => [{ indexA: 0, indexB: 1, distance: 0, volume: 0, pointA: [0, 0, 0], pointB: [0, 0, 0] }])).toHaveLength(1);
    });
});
