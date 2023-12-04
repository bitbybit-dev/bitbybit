/* eslint-disable @typescript-eslint/no-namespace */

export namespace Asset {
    export class GetAssetDto {
        constructor(fileName?: string) {
            this.fileName = fileName;
        }
        /**
         * The fileName associated with the projects asset
         * @default undefined
         */
        fileName: string;
    }
    export class FileDto {
        constructor(file?: File | Blob) {
            this.file ??= file;
        }
        /**
         * Asset file that was loaded
         * @default undefined
         */
        file: File | Blob;
    }
    export class FilesDto {
        constructor(files?: (File | Blob)[]) {
            this.files ??= files;
        }
        /**
         * Asset file that was loaded
         * @default undefined
         */
        files: (File | Blob)[];
    }
    export class AssetFileDto {
        constructor(assetFile?: File) {
            this.assetFile = assetFile;
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
}
