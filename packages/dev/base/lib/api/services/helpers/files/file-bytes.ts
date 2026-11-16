export const bytesOfData = (data: unknown): Uint8Array | undefined => {
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
    return undefined;
};
