/**
 * This is a manager of assets.
 */

export class AssetManager {
    getAsset: (fileName: string) => Promise<File>;
    getLocalAsset: (fileName: string) => Promise<File | File[]>;
    fetch: (url: string) => Promise<any>;
    downloadFile: (blob: Blob, fileName: string, extension: string, contentType: string) => void;
}
