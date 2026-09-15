/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for loading and managing external files - 3D models, textures, fonts and arbitrary data -
 * from the project's asset store or from a URL. Carries the file name or URL, the expected type, and
 * the options that control caching and how the loaded content is handed on to the kernels or renderer.
 */
export namespace Asset {
    /**
     * Feeds `asset.getFile`, `asset.getTextFile`, `asset.getLocalFile` and `asset.getLocalTextFile`
     * with the name of the asset to load; the running application decides what store the name is
     * looked up in.
     */
    export class GetAssetDto {
        constructor(fileName?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * Name of the asset as the running application knows it, extension included
         * @default undefined
         */
        fileName!: string;
    }
    /**
     * Feeds the `asset.fetch` methods with the URL to download from; the server must allow
     * cross-origin requests for the download to succeed.
     */
    export class FetchDto {
        constructor(url?: string) {
            if (url !== undefined) { this.url = url; }
        }
        /**
         * Full address of the resource to download, on a server that allows cross-origin requests
         * @default undefined
         */
        url!: string;
    }
    /**
     * Feeds the `asset` conversions that take one File or Blob: `createObjectURL`, `toArrayBuffer`,
     * `toUint8Array` and `fileToBlob`.
     */
    export class FileDto {
        constructor(file?: File | Blob) {
            if (file !== undefined) { this.file = file; }
        }
        /**
         * The File or Blob to convert; it is read, never changed
         * @default undefined
         */
        file!: File | Blob;
    }
    /**
     * Feeds `asset.createObjectURLs` with several Files or Blobs, one URL each in the same order.
     */
    export class FilesDto {
        constructor(files?: (File | Blob)[]) {
            if (files !== undefined) { this.files = files; }
        }
        /**
         * The Files or Blobs to convert, in the order the results come back
         * @default undefined
         */
        files!: (File | Blob)[];
    }
    /**
     * A model file to load into the scene, as the renderer packages' `io.loadAssetIntoScene` takes
     * it, and whether it starts hidden; the file's extension decides the loader.
     */
    export class AssetFileDto {
        constructor(assetFile?: File, hidden?: boolean) {
            if (assetFile !== undefined) { this.assetFile = assetFile; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * The model file to load, such as a glTF or glb; its name gives the format
         * @default undefined
         */
        assetFile!: File;
        /**
         * When true, the loaded model is added to the scene invisible, to be shown later
         * @default false
         */
        hidden = false;
    }
    /**
     * A model file to load into the scene by address, as the renderer packages'
     * `io.loadAssetIntoSceneFromRootUrl` takes it: the folder URL, the file name inside it and
     * whether it starts hidden.
     */
    export class AssetFileByUrlDto {
        constructor(assetFile?: string, rootUrl?: string, hidden?: boolean) {
            if (assetFile !== undefined) { this.assetFile = assetFile; }
            if (rootUrl !== undefined) { this.rootUrl = rootUrl; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * Name of the model file inside `rootUrl`, extension included
         * @default undefined
         */
        assetFile!: string;
        /**
         * Address of the folder the file is in, ending with a slash; textures next to the model are
         * resolved from it too
         * @default undefined
         */
        rootUrl!: string;
        /**
         * When true, the loaded model is added to the scene invisible, to be shown later
         * @default false
         */
        hidden = false;
    }
    /**
     * Feeds `asset.download`: what to write into the downloaded file, what to call it and which
     * content type to declare.
     */
    export class DownloadDto {
        constructor(fileName?: string, content?: string | Blob, extension?: string, contentType?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
            if (content !== undefined) { this.content = content; }
            if (extension !== undefined) { this.extension = extension; }
            if (contentType !== undefined) { this.contentType = contentType; }
        }
        /**
         * Name the browser saves the file under, without the extension, which is added
         * @default undefined
         */
        fileName!: string;
        /**
         * What the file holds: text, which is wrapped in a Blob of `contentType`, or a Blob saved
         * as it is
         * @default undefined
         */
        content!: string | Blob;
        /**
         * Extension added to the file name after a dot, such as `txt`, `csv` or `json`
         * @default txt
         */
        extension = "txt";
        /**
         * MIME type declared for text content, such as `text/plain` or `application/json`
         * @default text/plain
         */
        contentType = "text/plain";
    }
    /**
     * A glb model held as bytes to load into the scene, as the renderer packages'
     * `io.loadGlbFromArrayBuffer` takes it, for instance the output of the STEP to glTF converters.
     */
    export class AssetGlbDataDto {
        constructor(glbData?: Uint8Array, fileName?: string, hidden?: boolean) {
            if (glbData !== undefined) { this.glbData = glbData; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (hidden !== undefined) { this.hidden = hidden; }
        }
        /**
         * The whole glb file as bytes, such as what `occt.io.convertStepToGltf` gives back
         * @default undefined
         */
        glbData!: Uint8Array;
        /**
         * Name given to the loaded model, used to tell it apart from others; it does not have to
         * match a real file
         * @default model.glb
         */
        fileName = "model.glb";
        /**
         * When true, the loaded model is added to the scene invisible, to be shown later
         * @default false
         */
        hidden = false;
    }
    /**
     * Feeds `asset.blobToFile`: the Blob to wrap, the name the File gets and, when the Blob's own
     * type is not right, the MIME type to declare.
     */
    export class BlobToFileDto {
        constructor(blob?: Blob, fileName?: string, mimeType?: string) {
            if (blob !== undefined) { this.blob = blob; }
            if (fileName !== undefined) { this.fileName = fileName; }
            if (mimeType !== undefined) { this.mimeType = mimeType; }
        }
        /**
         * The bytes the File is made from; they are shared, not copied
         * @default undefined
         */
        blob!: Blob;
        /**
         * Name the File carries, extension included
         * @default file
         */
        fileName = "file";
        /**
         * MIME type declared on the File, such as `model/gltf-binary`; left out, the Blob's own
         * type is kept
         * @default undefined
         * @optional true
         */
        mimeType?: string | undefined;
    }
    /**
     * Feeds `asset.arrayBufferToUint8Array` with the buffer to view as bytes.
     */
    export class ArrayBufferToUint8ArrayDto {
        constructor(arrayBuffer?: ArrayBuffer) {
            if (arrayBuffer !== undefined) { this.arrayBuffer = arrayBuffer; }
        }
        /**
         * The raw bytes to view as a Uint8Array; no copy is made
         * @default undefined
         */
        arrayBuffer!: ArrayBuffer;
    }
    /**
     * Feeds `asset.uint8ArrayToArrayBuffer` with the byte array to copy into its own buffer.
     */
    export class Uint8ArrayToArrayBufferDto {
        constructor(uint8Array?: Uint8Array) {
            if (uint8Array !== undefined) { this.uint8Array = uint8Array; }
        }
        /**
         * The bytes to copy; only the part this array covers is copied
         * @default undefined
         */
        uint8Array!: Uint8Array;
    }
}
