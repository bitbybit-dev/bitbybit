/**
 * The lookups behind `asset`: the running application assigns `getAsset`, `getLocalAsset`, `fetch`
 * and `downloadFile` here, so asset names resolve to whatever store the application keeps and
 * downloads go through its own file handling. On its own, without an application filling it in,
 * every lookup is undefined.
 */

export class AssetManager {
    getAsset!: (fileName: string) => Promise<File>;
    getLocalAsset!: (fileName: string) => Promise<File | File[]>;
    fetch!: (url: string) => Promise<any>;
    downloadFile!: (blob: Blob, fileName: string, extension: string, contentType: string) => void;
}
