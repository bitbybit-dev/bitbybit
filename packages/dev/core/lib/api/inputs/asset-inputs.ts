/* eslint-disable @typescript-eslint/no-namespace */

export namespace Asset {
    export class GetAssetDto {
        constructor(fileName?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * The fileName associated with the projects asset
         * @default undefined
         */
        fileName: string;
    }
    export class FetchDto {
        constructor(url?: string) {
            if (url !== undefined) { this.url = url; }
        }
        /**
         * The url to fetch from
         * @default undefined
         */
        url: string;
    }
    export class FileDto {
        constructor(file?: File | Blob) {
            if (file !== undefined) { this.file = file; }
        }
        /**
         * Asset file that was loaded
         * @default undefined
         */
        file: File | Blob;
    }
    export class FilesDto {
        constructor(files?: (File | Blob)[]) {
            if (files !== undefined) { this.files = files; }
        }
        /**
         * Asset file that was loaded
         * @default undefined
         */
        files: (File | Blob)[];
    }
    export class AssetFileDto {
        constructor(assetFile?: File, hidden?: boolean) {
            if (assetFile !== undefined) { this.assetFile = assetFile; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * Asset file that was loaded
         * @default undefined
         */
        assetFile: File;
        /**
         * Import the asset hidden
         * @default false
         */
        hidden = false;
    }
    export class AssetFileByUrlDto {
        constructor(assetFile?: string, rootUrl?: string, hidden?: boolean) {
            if (assetFile !== undefined) { this.assetFile = assetFile; }
            if (rootUrl !== undefined) { this.rootUrl = rootUrl; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * Asset file name
         * @default undefined
         */
        assetFile: string;
        /**
         * Root url
         * @default undefined
         */
        rootUrl: string;
        /**
         * Import the asset hidden
         * @default false
         */
        hidden = false;
    }
    export class DownloadDto {
        constructor(fileName?: string, content?: string | Blob, extension?: string, contentType?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
            if (content !== undefined) { this.content = content; }
            if (extension !== undefined) { this.extension = extension; }
            if (contentType !== undefined) { this.contentType = contentType; }
        }
        /**
         * The file name for the downloaded file
         * @default undefined
         */
        fileName: string;
        /**
         * The content to download (string or Blob)
         * @default undefined
         */
        content: string | Blob;
        /**
         * The file extension (without dot)
         * @default txt
         */
        extension = "txt";
        /**
         * The content type for the file
         * @default text/plain
         */
        contentType = "text/plain";
    }
    export class AssetGlbDataDto {
        constructor(glbData?: Uint8Array, fileName?: string, hidden?: boolean) {
            if (glbData !== undefined) { this.glbData = glbData; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * GLB binary data as Uint8Array (e.g., from OCCT convertStepToGltf)
         * @default undefined
         */
        glbData: Uint8Array;
        /**
         * Optional file name for the GLB (used for identification)
         * @default model.glb
         */
        fileName = "model.glb";
        /**
         * Import the asset hidden
         * @default false
         */
        hidden = false;
    }
    export class BlobToFileDto {
        constructor(blob?: Blob, fileName?: string, mimeType?: string) {
            if (blob !== undefined) { this.blob = blob; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (mimeType !== undefined) { this.mimeType = mimeType; }
        }
        /**
         * The blob to convert to a file
         * @default undefined
         */
        blob: Blob;
        /**
         * The file name for the resulting file
         * @default file
         */
        fileName = "file";
        /**
         * The MIME type for the file (optional, will use blob's type if not specified)
         * @default undefined
         * @optional true
         */
        mimeType?: string;
    }
    export class ArrayBufferToUint8ArrayDto {
        constructor(arrayBuffer?: ArrayBuffer) {
            if (arrayBuffer !== undefined) { this.arrayBuffer = arrayBuffer; }
        }
        /**
         * The ArrayBuffer to convert to Uint8Array
         * @default undefined
         */
        arrayBuffer: ArrayBuffer;
    }
    export class Uint8ArrayToArrayBufferDto {
        constructor(uint8Array?: Uint8Array) {
            if (uint8Array !== undefined) { this.uint8Array = uint8Array; }
        }
        /**
         * The Uint8Array to convert to ArrayBuffer
         * @default undefined
         */
        uint8Array: Uint8Array;
    }
}
