/* eslint-disable @typescript-eslint/no-namespace */

// tslint:disable-next-line: no-namespace
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
