/* eslint-disable @typescript-eslint/no-namespace */

export namespace BabylonGaussianSplatting {


    export class CreateGaussianSplattingMeshDto {
        constructor(url?: string) {
            if (url !== undefined) { this.url = url; }
        }
        /**
         * Babylon Mesh that needs to be updated
         */
        url: string;
    }

}
