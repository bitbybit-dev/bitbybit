
import * as Inputs from "../inputs";
import { AssetManager } from "../../asset-manager";

/**
 * Files in and out of a script: assets the running application stores under a name, files fetched
 * from a URL, downloads, and conversions between File, Blob, ArrayBuffer and Uint8Array. The
 * application supplies the lookups through `assetManager`, so what an asset name resolves to
 * depends on where the script runs; fetching needs an endpoint that allows cross-origin requests.
 */
export class Asset {
    public assetManager: AssetManager;
    constructor() {
        this.assetManager = new AssetManager();
    }

    /**
     * Loads a named asset of the running application as a File, through the lookup the application
     * supplies in `assetManager.getAsset`.
     *
     * Which store the name is looked up in depends on the application; a missing asset rejects the
     * promise.
     * @param inputs - The asset's file name
     * @returns The asset as a File
     * @group get
     * @shortname cloud file
     * @example
     * ```typescript
     * const file = await bitbybit.asset.getFile({ fileName: "part.step" });
     * const shape = await bitbybit.occt.io.loadSTEPorIGES({ assetFile: file, adjustZtoY: true });
     * ```
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File> {
        return this.assetManager.getAsset(inputs.fileName);
    }

    /**
     * Loads a named asset of the running application and reads it as text, for JSON, CSV or other
     * text files stored as assets.
     * @param inputs - The asset's file name
     * @returns The asset's content as text
     * @group get
     * @shortname text file
     * @example
     * ```typescript
     * const csv = await bitbybit.asset.getTextFile({ fileName: "points.csv" });
     * const rows = bitbybit.csv.parseToArray({ csv, rowSeparator: "\n", columnSeparator: "," });
     * ```
     */
    async getTextFile(inputs: Inputs.Asset.GetAssetDto): Promise<string> {
        const file = await this.assetManager.getAsset(inputs.fileName);
        return await file.text();
    }

    /**
     * Loads a named local asset, one kept in the browser rather than on a server, through the
     * lookup the application supplies in `assetManager.getLocalAsset`.
     *
     * A name that resolves to several files gives a list.
     * @param inputs - The asset's file name
     * @returns The asset as a File, or a list of Files when the name holds several
     * @group get
     * @shortname local file
     * @example
     * ```typescript
     * const file = await bitbybit.asset.getLocalFile({ fileName: "part.step" });
     * ```
     */
    getLocalFile(inputs: Inputs.Asset.GetAssetDto): Promise<File | File[]> {
        return this.assetManager.getLocalAsset(inputs.fileName);
    }

    /**
     * Loads a named local asset, one kept in the browser rather than on a server, and reads it as
     * text; a name that resolves to several files gives a list of texts.
     * @param inputs - The asset's file name
     * @returns The content as text, or a list of texts when the name holds several files
     * @group get
     * @shortname local text file
     * @example
     * ```typescript
     * const text = await bitbybit.asset.getLocalTextFile({ fileName: "settings.json" });
     * ```
     */
    async getLocalTextFile(inputs: Inputs.Asset.GetAssetDto): Promise<string | string[]> {
        const files = await this.getLocalFile(inputs);
        if (Array.isArray(files)) {
            return await Promise.all(files.map(f => f.text()));
        } else {
            return await files.text();
        }
    }

    /**
     * Downloads the content at a URL as a Blob, raw bytes without a file name; the server must
     * allow cross-origin requests.
     * @param inputs - The URL to fetch
     * @returns The response body as a Blob
     * @group fetch
     * @shortname fetch blob
     * @example
     * ```typescript
     * const blob = await bitbybit.asset.fetchBlob({ url: "https://example.com/models/part.glb" });
     * ```
     */
    async fetchBlob(inputs: Inputs.Asset.FetchDto): Promise<Blob> {
        const res = await fetch(inputs.url);
        return res.blob();
    }

    /**
     * Downloads the content at a URL as a File named after the last part of the URL, without its
     * query string; the server must allow cross-origin requests.
     * @param inputs - The URL to fetch
     * @returns The response body as a File
     * @group fetch
     * @shortname fetch file
     * @example
     * ```typescript
     * const file = await bitbybit.asset.fetchFile({ url: "https://example.com/models/part.step" });
     * const shape = await bitbybit.occt.io.loadSTEPorIGES({ assetFile: file, adjustZtoY: true });
     * ```
     */
    async fetchFile(inputs: Inputs.Asset.FetchDto): Promise<File> {
        const res = await fetch(inputs.url);
        const blob = await res.blob();
        return new File([blob], inputs.url.split("/").pop()!.split("?")[0]!);
    }

    /**
     * Downloads the content at a URL and parses it as JSON; the server must allow cross-origin
     * requests and the body must be valid JSON.
     * @param inputs - The URL to fetch
     * @returns The parsed JSON value
     * @group fetch
     * @shortname fetch json
     * @example
     * ```typescript
     * const settings = await bitbybit.asset.fetchJSON({ url: "https://example.com/data/settings.json" });
     * ```
     */
    async fetchJSON(inputs: Inputs.Asset.FetchDto): Promise<any> {
        const res = await fetch(inputs.url);
        return res.json();
    }

    /**
     * Downloads the content at a URL as plain text; the server must allow cross-origin requests.
     * @param inputs - The URL to fetch
     * @returns The response body as text
     * @group fetch
     * @shortname fetch text
     * @example
     * ```typescript
     * const csv = await bitbybit.asset.fetchText({ url: "https://example.com/data/points.csv" });
     * ```
     */
    async fetchText(inputs: Inputs.Asset.FetchDto): Promise<string> {
        const res = await fetch(inputs.url);
        return res.text();
    }

    /**
     * Makes a temporary URL for a File or Blob held in memory, so it can be handed to anything that
     * loads from a URL, such as a texture or a model loader.
     *
     * The URL lives as long as the page does.
     * @param inputs - The File or Blob
     * @returns The temporary URL
     * @group create
     * @shortname object url
     * @example
     * ```typescript
     * const url = bitbybit.asset.createObjectURL({ file });
     * ```
     */
    createObjectURL(inputs: Inputs.Asset.FileDto): string {
        return URL.createObjectURL(inputs.file);
    }

    /**
     * Makes a temporary URL for each File or Blob in a list, in the same order, as
     * `createObjectURL` does for one.
     * @param inputs - The Files or Blobs
     * @returns One temporary URL per file, in the same order
     * @group create
     * @shortname object urls
     * @example
     * ```typescript
     * const urls = bitbybit.asset.createObjectURLs({ files: [fileA, fileB] });
     * ```
     */
    createObjectURLs(inputs: Inputs.Asset.FilesDto): string[] {
        return inputs.files.map(f => URL.createObjectURL(f));
    }

    /**
     * Starts a browser download of the given content as a file named `fileName` plus the
     * `extension`.
     *
     * Text content is wrapped in a Blob of the `contentType`; a Blob is downloaded as it is.
     * @param inputs - The file name, the content, the extension and the content type
     * @group download
     * @shortname download file
     * @example
     * ```typescript
     * bitbybit.asset.download({ fileName: "points", content: "x,y,z\n1,2,3", extension: "csv", contentType: "text/csv" });
     * ```
     */
    download(inputs: Inputs.Asset.DownloadDto): void {
        let blob: Blob;
        
        if (typeof inputs.content === "string") {
            blob = new Blob([inputs.content], { type: inputs.contentType });
        } else {
            blob = inputs.content;
        }
        
        this.assetManager.downloadFile(blob, inputs.fileName, inputs.extension, inputs.contentType);
    }

    /**
     * Reads all the bytes of a File or Blob into an ArrayBuffer, the form binary loaders and the
     * STEP converters take.
     * @param inputs - The File or Blob to read
     * @returns The bytes as an ArrayBuffer
     * @group convert
     * @shortname to array buffer
     * @example
     * ```typescript
     * const buffer = await bitbybit.asset.toArrayBuffer({ file });
     * ```
     */
    async toArrayBuffer(inputs: Inputs.Asset.FileDto): Promise<ArrayBuffer> {
        return await inputs.file.arrayBuffer();
    }

    /**
     * Reads all the bytes of a File or Blob into a Uint8Array, a byte array that can be indexed and
     * sliced.
     * @param inputs - The File or Blob to read
     * @returns The bytes as a Uint8Array
     * @group convert
     * @shortname to uint8 array
     * @example
     * ```typescript
     * const bytes = await bitbybit.asset.toUint8Array({ file });
     * ```
     */
    async toUint8Array(inputs: Inputs.Asset.FileDto): Promise<Uint8Array> {
        const buffer = await inputs.file.arrayBuffer();
        return new Uint8Array(buffer);
    }

    /**
     * Wraps a Blob in a File with a name and a MIME type, which loaders that want a file name need;
     * the Blob's own type is kept when `mimeType` is left out.
     * @param inputs - The Blob, the file name and the optional MIME type
     * @returns The File
     * @group convert
     * @shortname blob to file
     * @example
     * ```typescript
     * const file = bitbybit.asset.blobToFile({ blob, fileName: "part.step", mimeType: "application/step" });
     * ```
     */
    blobToFile(inputs: Inputs.Asset.BlobToFileDto): File {
        const type = inputs.mimeType ?? inputs.blob.type;
        return new File([inputs.blob], inputs.fileName, { type });
    }

    /**
     * Copies the bytes of a File into a plain Blob of the same type, dropping the name; a Blob
     * given in comes back as a copy.
     * @param inputs - The File or Blob to copy
     * @returns The Blob
     * @group convert
     * @shortname file to blob
     * @example
     * ```typescript
     * const blob = bitbybit.asset.fileToBlob({ file });
     * ```
     */
    fileToBlob(inputs: Inputs.Asset.FileDto): Blob {
        return inputs.file.slice(0, inputs.file.size, inputs.file.type);
    }

    /**
     * Views the bytes of an ArrayBuffer as a Uint8Array; no bytes are copied, both share the same
     * memory.
     * @param inputs - The ArrayBuffer to view
     * @returns The Uint8Array over the same bytes
     * @group convert
     * @shortname array buffer to uint8 array
     * @example
     * ```typescript
     * const bytes = bitbybit.asset.arrayBufferToUint8Array({ arrayBuffer });
     * ```
     */
    arrayBufferToUint8Array(inputs: Inputs.Asset.ArrayBufferToUint8ArrayDto): Uint8Array {
        return new Uint8Array(inputs.arrayBuffer);
    }

    /**
     * Copies exactly the bytes a Uint8Array covers into a new ArrayBuffer, so a view over part of a
     * larger buffer gives only its own part.
     * @param inputs - The Uint8Array to copy
     * @returns The new ArrayBuffer
     * @group convert
     * @shortname uint8 array to array buffer
     * @example
     * ```typescript
     * const buffer = bitbybit.asset.uint8ArrayToArrayBuffer({ uint8Array: bytes });
     * ```
     */
    uint8ArrayToArrayBuffer(inputs: Inputs.Asset.Uint8ArrayToArrayBufferDto): ArrayBuffer {
        return inputs.uint8Array.buffer.slice(
            inputs.uint8Array.byteOffset,
            inputs.uint8Array.byteOffset + inputs.uint8Array.byteLength
        ) as ArrayBuffer;
    }

}
