import type { GltfJson, GltfNode } from "../helper-types";
import {
    GLB_ALIGNMENT, GLB_CHUNK_HEADER_SIZE, GLB_CHUNK_TYPE_AT, GLB_HEADER_SIZE, GLB_JSON_CHUNK, GLB_JSON_PADDING, GLB_LENGTH_AT, GLB_MAGIC, GLB_SCALE_NODE_NAME, GLB_VERSION, GLB_VERSION_AT,
} from "./glb.constants";

function rootsOf(nodes: readonly GltfNode[]): number[] {
    const children = new Set(nodes.flatMap(node => node.children ?? []));
    return nodes.map((_, index) => index).filter(index => !children.has(index));
}

const isIndexList = (value: unknown): boolean => value === undefined || (Array.isArray(value) && value.every(index => Number.isInteger(index) && index >= 0));

function checkedJson(parsed: unknown): GltfJson {
    const json = parsed as GltfJson | null;
    const objects = (value: unknown): boolean => value === undefined || (Array.isArray(value) && value.every(item => typeof item === "object" && item !== null));
    if (typeof json !== "object" || json === null || !objects(json.nodes) || !objects(json.scenes)
        || !(json.nodes ?? []).every(node => isIndexList(node.children)) || !(json.scenes ?? []).every(scene => isIndexList(scene.nodes))) {
        throw new Error("The glb's JSON is not glTF: its nodes or scenes are not lists of objects with index lists");
    }
    return json;
}

function scaledJson(json: GltfJson, scale: number): GltfJson {
    const nodes: GltfNode[] = [...(json.nodes ?? [])];
    const scenes = json.scenes !== undefined && json.scenes.length > 0 ? json.scenes : [{ nodes: rootsOf(nodes) }];
    const placed = scenes.flatMap(scene => scene.nodes ?? []);
    if (new Set(placed).size !== placed.length) {
        throw new Error("The glb's scenes share root nodes, so no one node can scale each scene alone");
    }
    const wrapped = scenes.map(scene => {
        nodes.push({ name: GLB_SCALE_NODE_NAME, scale: [scale, scale, scale], children: [...(scene.nodes ?? [])] });
        return { ...scene, nodes: [nodes.length - 1] };
    });
    return { ...json, scene: json.scene ?? 0, scenes: wrapped, nodes };
}

export function glbWithRootScale(glb: Uint8Array, scale: number): Uint8Array {
    if (!(scale > 0) || !Number.isFinite(scale)) {
        throw new Error(`The glb's scale is ${String(scale)}; it has to be a finite number above zero`);
    }
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
    if (glb.byteLength < GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE || view.getUint32(0, true) !== GLB_MAGIC || view.getUint32(GLB_VERSION_AT, true) !== GLB_VERSION) {
        throw new Error("The data is not a version 2 glb: its header is missing");
    }
    const jsonLength = view.getUint32(GLB_HEADER_SIZE, true);
    const jsonEnd = GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + jsonLength;
    if (view.getUint32(GLB_HEADER_SIZE + GLB_CHUNK_TYPE_AT, true) !== GLB_JSON_CHUNK || jsonEnd > glb.byteLength) {
        throw new Error("The glb's first chunk is not its JSON, or runs past the end of the file");
    }
    if (scale === 1) {
        return glb;
    }
    const json = checkedJson(JSON.parse(new TextDecoder().decode(glb.subarray(GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE, jsonEnd))));
    const text = new TextEncoder().encode(JSON.stringify(scaledJson(json, scale)));
    const padded = Math.ceil(text.length / GLB_ALIGNMENT) * GLB_ALIGNMENT;
    const rest = glb.subarray(jsonEnd);
    const result = new Uint8Array(GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + padded + rest.length);
    const out = new DataView(result.buffer);
    out.setUint32(0, GLB_MAGIC, true);
    out.setUint32(GLB_VERSION_AT, GLB_VERSION, true);
    out.setUint32(GLB_LENGTH_AT, result.length, true);
    out.setUint32(GLB_HEADER_SIZE, padded, true);
    out.setUint32(GLB_HEADER_SIZE + GLB_CHUNK_TYPE_AT, GLB_JSON_CHUNK, true);
    result.set(text, GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE);
    result.fill(GLB_JSON_PADDING, GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + text.length, GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + padded);
    result.set(rest, GLB_HEADER_SIZE + GLB_CHUNK_HEADER_SIZE + padded);
    return result;
}
