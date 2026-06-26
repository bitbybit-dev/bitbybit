/* eslint-disable @typescript-eslint/no-namespace */
// tslint:disable-next-line: no-namespace
export namespace BabylonTexture {

    export enum samplingModeEnum {
        nearest = "nearest",
        bilinear = "bilinear",
        trilinear = "trilinear"
    }

    export class TextureSimpleDto {
        constructor(name?: string, url?: string, invertY?: boolean, invertZ?: boolean, wAng?: number, uScale?: number, vScale?: number, uOffset?: number, vOffset?: number, samplingMode?: samplingModeEnum) {
            if (name !== undefined) { this.name = name; }
            if (url !== undefined) { this.url = url; }
            if (invertY !== undefined) { this.invertY = invertY; }
            if (invertZ !== undefined) { this.invertZ = invertZ; }
            if (wAng !== undefined) { this.wAng = wAng; }
            if (uScale !== undefined) { this.uScale = uScale; }
            if (vScale !== undefined) { this.vScale = vScale; }
            if (uOffset !== undefined) { this.uOffset = uOffset; }
            if (vOffset !== undefined) { this.vOffset = vOffset; }
            if (samplingMode !== undefined) { this.samplingMode = samplingMode; }
        }
        /**
         * Name of the material
         * @default Custom Texture
         */
        name = "Custom Texture";
        /**
         * Url of the texture
         * @default undefined
         */
        url: string;
        /**
         * Invert texture on Y direction
         * @default false
         */
        invertY = false;
        /**
         * Invert texture on Z direction
         * @default false
         */
        invertZ = false;
        /**
         * W angle of the texture
         * @default 0
         */
        wAng = 0;
        /**
         * U scale of the texture
         * @default 1
         */
        uScale = 1;
        /**
         * V scale of the texture
         * @default 1
         */
        vScale = 1;
        /**
         * U offset of the texture
         * @default 0
         */
        uOffset = 0;
        /**
         * V offset of the texture
         * @default 0
         */
        vOffset = 0;
        /**
         * The sampling mode of the texture
         * @default nearest
         */
        samplingMode = BabylonTexture.samplingModeEnum.nearest;
    }

    export class TextureImageDto {
        constructor(name?: string, url?: string, hasAlpha?: boolean, invertY?: boolean, samplingMode?: samplingModeEnum) {
            if (name !== undefined) { this.name = name; }
            if (url !== undefined) { this.url = url; }
            if (hasAlpha !== undefined) { this.hasAlpha = hasAlpha; }
            if (invertY !== undefined) { this.invertY = invertY; }
            if (samplingMode !== undefined) { this.samplingMode = samplingMode; }
        }
        /**
         * Name of the texture
         * @default Image Texture
         */
        name = "Image Texture";
        /**
         * Url of the image. Use a publicly accessible url, a data url, or an object url created from an uploaded asset file.
         * @default undefined
         */
        url: string;
        /**
         * Treat the image alpha channel as transparency. Recommended true for decal and projection images.
         * @default true
         */
        hasAlpha = true;
        /**
         * Invert texture on Y direction
         * @default false
         */
        invertY = false;
        /**
         * The sampling mode of the texture
         * @default trilinear
         */
        samplingMode = BabylonTexture.samplingModeEnum.trilinear;
    }

}
