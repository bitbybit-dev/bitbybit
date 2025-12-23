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
}
