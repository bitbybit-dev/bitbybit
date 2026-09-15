/* eslint-disable @typescript-eslint/no-namespace */
// tslint:disable-next-line: no-namespace
/**
 * Parameters for textures: the image source, UV scaling and offset, wrapping mode, and the sampling
 * settings that decide how a texture is filtered.
 */
export namespace BabylonTexture {

    /**
     * How a texture is filtered when magnified or minified - nearest keeps pixels crisp and blocky,
     * the linear and trilinear modes smooth them, and the mipmap variants trade sharpness for stability
     * in the distance.
     */
    export enum samplingModeEnum {
        nearest = "nearest",
        bilinear = "bilinear",
        trilinear = "trilinear"
    }

    /**
     * Feeds `babylon.texture.createSimple`: the image address of a texture for material slots, how
     * it tiles, shifts and turns over the surface, and how it is filtered.
     */
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
         * Name the texture is known by in the scene
         * @default Custom Texture
         */
        name = "Custom Texture";
        /**
         * Address of the image; for an uploaded file, make an object URL with
         * `asset.createObjectURL` first
         * @default undefined
         */
        url!: string;
        /**
         * When true, the image is flipped top to bottom; use it when a texture appears upside down
         * @default false
         */
        invertY = false;
        /**
         * When true, the image is flipped along the third texture axis, which matters for volume
         * textures only
         * @default false
         */
        invertZ = false;
        /**
         * How far the image is turned over the surface, in radians
         * @default 0
         */
        wAng = 0;
        /**
         * How many times the image repeats across the surface horizontally; 2 tiles it twice
         * @default 1
         */
        uScale = 1;
        /**
         * How many times the image repeats across the surface vertically; 2 tiles it twice
         * @default 1
         */
        vScale = 1;
        /**
         * How far the image is shifted horizontally, as a fraction of its width
         * @default 0
         */
        uOffset = 0;
        /**
         * How far the image is shifted vertically, as a fraction of its height
         * @default 0
         */
        vOffset = 0;
        /**
         * How pixels are read when the image is scaled: nearest keeps hard pixels, bilinear and
         * trilinear blend them
         * @default nearest
         */
        samplingMode = BabylonTexture.samplingModeEnum.nearest;
    }

    /**
     * Feeds `babylon.texture.createImage`: the address of an image for decals and projections, with
     * its transparency kept and no tiling.
     */
    export class TextureImageDto {
        constructor(name?: string, url?: string, hasAlpha?: boolean, invertY?: boolean, samplingMode?: samplingModeEnum) {
            if (name !== undefined) { this.name = name; }
            if (url !== undefined) { this.url = url; }
            if (hasAlpha !== undefined) { this.hasAlpha = hasAlpha; }
            if (invertY !== undefined) { this.invertY = invertY; }
            if (samplingMode !== undefined) { this.samplingMode = samplingMode; }
        }
        /**
         * Name the texture is known by in the scene
         * @default Image Texture
         */
        name = "Image Texture";
        /**
         * Address of the image: a public URL, a data URL or an object URL made from an uploaded
         * file
         * @default undefined
         */
        url!: string;
        /**
         * When true, transparent pixels of the image stay transparent, which cut-out decals need
         * @default true
         */
        hasAlpha = true;
        /**
         * When true, the image is flipped top to bottom; use it when a decal appears upside down
         * @default false
         */
        invertY = false;
        /**
         * How pixels are read when the image is scaled: nearest keeps hard pixels, bilinear and
         * trilinear blend them
         * @default trilinear
         */
        samplingMode = BabylonTexture.samplingModeEnum.trilinear;
    }

}
