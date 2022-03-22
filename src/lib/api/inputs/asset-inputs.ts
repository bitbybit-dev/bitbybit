
// tslint:disable-next-line: no-namespace
export namespace Asset {
    export class GetAssetDto {
        /**
         * Provide options without default values
         */
        constructor(fileName?: string) {
            this.fileName = fileName;
        }
        /**
         * The fileName associated with the projects asset
         */
        fileName: string;
    }
    export class AssetFileDto {
        constructor(assetFile?: File) {
            this.assetFile = assetFile;
        }
        assetFile: File;
    }
}
