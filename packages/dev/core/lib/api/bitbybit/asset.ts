
import * as Inputs from "../inputs";
import { AssetManager } from "../../asset-manager";

export class Asset {
    public assetManager: AssetManager;
    constructor() {
        this.assetManager = new AssetManager();
    }

    /**
     * Gets the asset file
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     * @group get
     * @shortname cloud file
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File> {
        return this.assetManager.getAsset(inputs.fileName);
    }

    /**
     * Gets the text from asset file stored in your cloud account.
     * @param inputs asset name to get from project assets
     * @returns Text of asset
     * @group get
     * @shortname text file
     */
    async getTextFile(inputs: Inputs.Asset.GetAssetDto): Promise<string> {
        const file = await this.assetManager.getAsset(inputs.fileName);
        return await file.text();
    }

    /**
     * Gets the local asset file stored in your browser.
     * @param inputs asset name to get from local assets
     * @returns Blob of asset
     * @group get
     * @shortname local file
     */
    getLocalFile(inputs: Inputs.Asset.GetAssetDto): Promise<File | File[]> {
        return this.assetManager.getLocalAsset(inputs.fileName);
    }

    /**
     * Gets the text from asset file stored in your browser.
     * @param inputs asset name to get from local assets
     * @returns Text of asset or array of texts
     * @group get
     * @shortname local text file
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
     * Fetches the blob from the given url, must be CORS enabled accessible endpoint
     * @param inputs url of the asset
     * @returns Blob
     * @group fetch
     * @shortname fetch blob
     */
    async fetchBlob(inputs: Inputs.Asset.FetchDto): Promise<Blob> {
        const res = await fetch(inputs.url);
        return res.blob();
    }

    /**
     * Fetches the file from the given url, must be CORS enabled accessible endpoint
     * @param inputs url of the asset
     * @returns File
     * @group fetch
     * @shortname fetch file
     */
    async fetchFile(inputs: Inputs.Asset.FetchDto): Promise<File> {
        const res = await fetch(inputs.url);
        const blob = await res.blob();
        return new File([blob], inputs.url.split("/").pop().split("?")[0]);
    }

    /**
     * Fetches the json from the given url, must be CORS enabled accessible endpoint
     * @param inputs url of the asset
     * @returns JSON
     * @group fetch
     * @shortname fetch json
     */
    async fetchJSON(inputs: Inputs.Asset.FetchDto): Promise<any> {
        const res = await fetch(inputs.url);
        return res.json();
    }

    /**
     * Fetches the json from the given url, must be CORS enabled accessible endpoint
     * @param inputs url of the asset
     * @returns Text
     * @group fetch
     * @shortname fetch text
     */
    async fetchText(inputs: Inputs.Asset.FetchDto): Promise<string> {
        const res = await fetch(inputs.url);
        return res.text();
    }

    /**
     * Gets and creates the url string path to your file stored in your memory.
     * @param File or a blob
     * @returns URL string of a file
     * @group create
     * @shortname object url
     */
    createObjectURL(inputs: Inputs.Asset.FileDto): string {
        return URL.createObjectURL(inputs.file);
    }

    /**
     * Gets and creates the url string paths to your files stored in your memory.
     * @param Files or a blobs
     * @returns URL strings for given files
     * @group create
     * @shortname object urls
     */
    createObjectURLs(inputs: Inputs.Asset.FilesDto): string[] {
        return inputs.files.map(f => URL.createObjectURL(f));
    }

    /**
     * Downloads a file with the given content, extension, and content type.
     * @param inputs file name, content, extension, and content type
     * @group download
     * @shortname download file
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
     * Converts a File or Blob to an ArrayBuffer.
     * @param inputs file or blob to convert
     * @returns ArrayBuffer
     * @group convert
     * @shortname to array buffer
     */
    async toArrayBuffer(inputs: Inputs.Asset.FileDto): Promise<ArrayBuffer> {
        return await inputs.file.arrayBuffer();
    }

    /**
     * Converts a File or Blob to a Uint8Array.
     * @param inputs file or blob to convert
     * @returns Uint8Array
     * @group convert
     * @shortname to uint8 array
     */
    async toUint8Array(inputs: Inputs.Asset.FileDto): Promise<Uint8Array> {
        const buffer = await inputs.file.arrayBuffer();
        return new Uint8Array(buffer);
    }

    /**
     * Converts a Blob to a File.
     * @param inputs blob, file name, and optional MIME type
     * @returns File
     * @group convert
     * @shortname blob to file
     */
    blobToFile(inputs: Inputs.Asset.BlobToFileDto): File {
        const type = inputs.mimeType ?? inputs.blob.type;
        return new File([inputs.blob], inputs.fileName, { type });
    }

    /**
     * Converts a File to a Blob.
     * @param inputs file to convert
     * @returns Blob
     * @group convert
     * @shortname file to blob
     */
    fileToBlob(inputs: Inputs.Asset.FileDto): Blob {
        return inputs.file.slice(0, inputs.file.size, inputs.file.type);
    }

    /**
     * Converts an ArrayBuffer to a Uint8Array.
     * @param inputs ArrayBuffer to convert
     * @returns Uint8Array
     * @group convert
     * @shortname array buffer to uint8 array
     */
    arrayBufferToUint8Array(inputs: Inputs.Asset.ArrayBufferToUint8ArrayDto): Uint8Array {
        return new Uint8Array(inputs.arrayBuffer);
    }

    /**
     * Converts a Uint8Array to an ArrayBuffer.
     * @param inputs Uint8Array to convert
     * @returns ArrayBuffer
     * @group convert
     * @shortname uint8 array to array buffer
     */
    uint8ArrayToArrayBuffer(inputs: Inputs.Asset.Uint8ArrayToArrayBufferDto): ArrayBuffer {
        return inputs.uint8Array.buffer.slice(
            inputs.uint8Array.byteOffset,
            inputs.uint8Array.byteOffset + inputs.uint8Array.byteLength
        ) as ArrayBuffer;
    }

}
