import { InputError } from "@bitbybit-dev/base";
import type { Handle_TDocStd_Document } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

/** The smallest mesh deflection the kernel's mesh exports take, in model units. */
export const SMALLEST_MESH_DEFLECTION = 1e-7;

/**
 * The bytes of a file a caller handed in: text as its UTF-8 bytes, an ArrayBuffer or a typed array as
 * the bytes it holds. A File or Blob is refused: reading one takes a promise, so the worker layer
 * reads it before the call reaches the kernel.
 */
export function bytesOfFile(data: unknown, property: string): Uint8Array {
    if (typeof data === "string") {
        return new TextEncoder().encode(data);
    }
    if (data instanceof Uint8Array) {
        return data;
    }
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    throw new InputError(`\`${property}\` is not text or bytes: a File or Blob is read by the worker layer before the call reaches the kernel.`, property);
}

/** The text of a file a caller handed in: text as it is, bytes read as UTF-8. */
export function textOfFile(data: unknown, property: string): string {
    return typeof data === "string" ? data : new TextDecoder().decode(bytesOfFile(data, property));
}

/**
 * The name an OBJ export writes its material library under: the file name without its extension.
 * Refused as the kernel refuses it - empty, `.`, `..`, or holding a slash, a backslash, a space or a
 * control character - because the `.obj` names its library in a single `mtllib` line.
 */
export function objNameOf(fileName: unknown, property: string): string {
    const text = typeof fileName === "string" ? fileName : "";
    const name = /^(.+)\.[^.]*$/.exec(text)?.[1] ?? text;
    const unfit = [...name].some(character => character === "/" || character === "\\" || character.charCodeAt(0) <= 0x20 || character.charCodeAt(0) === 0x7f);
    if (name === "" || name === "." || name === ".." || unfit) {
        throw new InputError(`\`${property}\` must be a file name without spaces or slashes, since the OBJ file names its material library after it; it is ${JSON.stringify(fileName)}.`, property);
    }
    return name;
}

/** A document the caller handed in, refused when it is missing or empty, as a load that failed can leave it. */
export function checkedDocument(document: unknown, property: string): Handle_TDocStd_Document {
    const candidate = document as { IsNull?: unknown } | null | undefined;
    if (candidate === null || candidate === undefined || typeof candidate.IsNull !== "function" || (document as Handle_TDocStd_Document).IsNull()) {
        throw new InputError(`\`${property}\` is missing or empty, as a load or a build that failed can leave it.`, property);
    }
    return document as Handle_TDocStd_Document;
}
