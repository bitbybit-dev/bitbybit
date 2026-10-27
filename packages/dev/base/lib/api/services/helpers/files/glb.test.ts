import { describe, expect, it } from "vitest";
import { glbWithRootScale } from "./glb";

const encoder = new TextEncoder();

function glbOf(json: object, bin: readonly number[] = []): Uint8Array {
    const text = encoder.encode(JSON.stringify(json));
    const jsonLength = Math.ceil(text.length / 4) * 4;
    const binLength = Math.ceil(bin.length / 4) * 4;
    const total = 12 + 8 + jsonLength + (bin.length > 0 ? 8 + binLength : 0);
    const bytes = new Uint8Array(total);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x46546c67, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, total, true);
    view.setUint32(12, jsonLength, true);
    view.setUint32(16, 0x4e4f534a, true);
    bytes.set(text, 20);
    bytes.fill(0x20, 20 + text.length, 20 + jsonLength);
    if (bin.length > 0) {
        view.setUint32(20 + jsonLength, binLength, true);
        view.setUint32(24 + jsonLength, 0x004e4942, true);
        bytes.set(bin, 28 + jsonLength);
    }
    return bytes;
}

function jsonOf(glb: Uint8Array): { scene?: number; scenes: { nodes: number[] }[]; nodes: { name?: string; scale?: number[]; children?: number[] }[] } {
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    return JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + view.getUint32(12, true))));
}

describe("glb", () => {
    it("should put every root of a scene under one node scaled evenly, leaving the nodes and the binary chunk as they were", () => {
        // Arrange
        const glb = glbOf({ asset: { version: "2.0" }, scene: 0, scenes: [{ nodes: [0, 2] }], nodes: [{ name: "a", children: [1] }, { name: "b", translation: [1, 2, 3] }, { name: "c" }] }, [1, 2, 3, 4, 5, 6, 7, 8]);

        // Act
        const scaled = glbWithRootScale(glb, 0.001);
        const json = jsonOf(scaled);

        // Assert
        expect(json.scenes).toEqual([{ nodes: [3] }]);
        expect(json.nodes[3]).toEqual({ name: "unit scale", scale: [0.001, 0.001, 0.001], children: [0, 2] });
        expect(json.nodes.slice(0, 3)).toEqual(jsonOf(glb).nodes);
        expect(Array.from(scaled.subarray(scaled.length - 16))).toEqual(Array.from(glb.subarray(glb.length - 16)));
        expect(new DataView(scaled.buffer).getUint32(8, true)).toBe(scaled.length);
        expect(scaled.length % 4).toBe(0);
    });

    it("should wrap the parentless nodes of a file without scenes into the scene it then shows", () => {
        // Arrange
        const glb = glbOf({ asset: { version: "2.0" }, nodes: [{ children: [1] }, {}, {}] });

        // Act
        const json = jsonOf(glbWithRootScale(glb, 0.0254));

        // Assert
        expect(json.scene).toBe(0);
        expect(json.scenes).toEqual([{ nodes: [3] }]);
        expect(json.nodes[3]!.children).toEqual([0, 2]);
    });

    it("should hand back the same bytes at a scale of one", () => {
        // Arrange
        const glb = glbOf({ asset: { version: "2.0" }, scenes: [{ nodes: [0] }], nodes: [{}] });

        // Act
        const scaled = glbWithRootScale(glb, 1);

        // Assert
        expect(scaled).toBe(glb);
    });

    it("should refuse a scale that is not a positive number, data that is not a glb and JSON that is not glTF", () => {
        // Arrange
        const glb = glbOf({ scenes: [{ nodes: [0] }], nodes: [{}] });
        const shared = glbOf({ scenes: [{ nodes: [0] }, { nodes: [0] }], nodes: [{}] });
        const broken = glbOf({ scenes: [{ nodes: ["first"] }], nodes: [{}] });

        // Act & Assert
        [0, -1, Number.NaN, Infinity].forEach(scale => expect(() => glbWithRootScale(glb, scale)).toThrow("finite number above zero"));
        expect(() => glbWithRootScale(encoder.encode("{\"asset\":{}}"), 0.001)).toThrow("not a version 2 glb");
        expect(() => glbWithRootScale(shared, 0.001)).toThrow("share root nodes");
        expect(() => glbWithRootScale(broken, 0.001)).toThrow("not glTF");
    });

    it("should leave a glb with no nodes as it is, and a scene with none empty, as glTF allows no empty list of children", () => {
        // Arrange
        const empty = glbOf({ asset: { version: "2.0" }, scenes: [{ nodes: [] }] });
        const mixed = glbOf({ asset: { version: "2.0" }, scenes: [{ nodes: [0] }, { nodes: [] }], nodes: [{ name: "part" }] });

        // Act
        const scaledEmpty = jsonOf(glbWithRootScale(empty, 0.0254));
        const scaledMixed = jsonOf(glbWithRootScale(mixed, 0.0254));

        // Assert
        expect(scaledEmpty).toEqual({ asset: { version: "2.0" }, scenes: [{ nodes: [] }] });
        expect(scaledMixed.scenes).toEqual([{ nodes: [1] }, { nodes: [] }]);
        expect(scaledMixed.nodes[1]).toEqual({ name: "unit scale", scale: [0.0254, 0.0254, 0.0254], children: [0] });
    });
});
