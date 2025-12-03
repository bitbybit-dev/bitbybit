/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

export namespace BabylonScene {

    export class SceneBackgroundColourDto {
        /**
         * Provide options without default values
         */
        constructor(colour?: string) {
            if (colour !== undefined) { this.colour = colour; }
        }
        /**
         * Hex colour string for the scene background colour
         * @default #ffffff
         */
        colour: Base.Color = "#ffffff";
    }
    export class SceneDto {
        /**
         * Provide scene
         */
        constructor(scene?: BABYLON.Scene) {
            if (scene !== undefined) { this.scene = scene; }
        }
        /**
         * The babylonjs scene
         * @default undefined
         */
        scene: BABYLON.Scene;
    }
    export class EnablePhysicsDto {
        constructor(vector?: Base.Vector3) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The gravity vector
         * @default [0, -9.81, 0]
         */
        vector: Base.Vector3 = [0, -9.81, 0];
    }
    export class PointLightDto {
        constructor(position?: Base.Point3, intensity?: number, diffuse?: Base.Color, specular?: Base.Color, radius?: number, shadowGeneratorMapSize?: number, enableShadows?: boolean, shadowDarkness?: number, shadowUsePercentageCloserFiltering?: boolean, shadowContactHardeningLightSizeUVRatio?: number, shadowBias?: number, shadowNormalBias?: number, shadowMaxZ?: number, shadowMinZ?: number, shadowRefreshRate?: number) {
            if (position !== undefined) { this.position = position; }
            if (intensity !== undefined) { this.intensity = intensity; }
            if (diffuse !== undefined) { this.diffuse = diffuse; }
            if (specular !== undefined) { this.specular = specular; }
            if (radius !== undefined) { this.radius = radius; }
            if (shadowGeneratorMapSize !== undefined) { this.shadowGeneratorMapSize = shadowGeneratorMapSize; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
            if (shadowDarkness !== undefined) { this.shadowDarkness = shadowDarkness; }
            if (shadowUsePercentageCloserFiltering !== undefined) { this.shadowUsePercentageCloserFiltering = shadowUsePercentageCloserFiltering; }
            if (shadowContactHardeningLightSizeUVRatio !== undefined) { this.shadowContactHardeningLightSizeUVRatio = shadowContactHardeningLightSizeUVRatio; }
            if (shadowBias !== undefined) { this.shadowBias = shadowBias; }
            if (shadowNormalBias !== undefined) { this.shadowNormalBias = shadowNormalBias; }
            if (shadowMaxZ !== undefined) { this.shadowMaxZ = shadowMaxZ; }
            if (shadowMinZ !== undefined) { this.shadowMinZ = shadowMinZ; }
            if (shadowRefreshRate !== undefined) { this.shadowRefreshRate = shadowRefreshRate; }
        }
        /**
         * Position of the point light
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Intensity of the point light, value between 0 and 1
         * @default 2000
         * @minimum 0
         * @maximum Infinity
         * @step 500
         */
        intensity = 2000;
        /**
         * Diffuse colour of the point light
         * @default #ffffff
         */
        diffuse: Base.Color = "#ffffff";
        /**
         * Specular colour of the point light
         * @default #ffffff
         */
        specular: Base.Color = "#ffffff";
        /**
         * Radius of the sphere mesh representing the light bulb. If 0 light gets created without the mesh
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 0.1;
        /**
         * The map size for shadow generator texture if shadows are enabled
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize? = 1024;
        /**
         * Enables shadows
         * @default true
         */
        enableShadows? = true;
        /**
         * Shadow darkness
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness? = 0;

        /**
         * Use percentage closer filtering
         * @default true
         */
        shadowUsePercentageCloserFiltering = true;
        /**
         * Shadow contact hardening light size UV ratio - only applies if usePercentageCloserFiltering is true
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        shadowContactHardeningLightSizeUVRatio = 0.2;
        /**
         * Shadow bias
         * @default 0.0001
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        shadowBias = 0.0001;
        /**
         * Shadow normal bias
         * @default 0.002
         * @minimum 0
         * @maximum Infinity
         * @step 0.0001
         */
        shadowNormalBias = 0.002;
        /**
         * Shadow max Z
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMaxZ = 1000;
        /**
        * Shadow min Z
        * @default 0.1
        * @minimum 0
        * @maximum Infinity
        * @step 50
        */
        shadowMinZ = 0.1;
        /**
         * Shadow refresh rate
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowRefreshRate = 1;
    }
    export class ActiveCameraDto {
        constructor(camera?: BABYLON.Camera) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * Camera to activate
         * @default undefined
         */
        camera: BABYLON.Camera;
    }
    export class UseRightHandedSystemDto {
        constructor(use?: boolean) {
            if (use !== undefined) { this.use = use; }
        }
        /** Indicates to use right handed system
         * @default true
         */
        use = true;
    }
    export class DirectionalLightDto {
        constructor(direction?: Base.Vector3, intensity?: number, diffuse?: Base.Color, specular?: Base.Color, shadowGeneratorMapSize?: number, enableShadows?: boolean, shadowDarkness?: number, shadowUsePercentageCloserFiltering?: boolean, shadowContactHardeningLightSizeUVRatio?: number, shadowBias?: number, shadowNormalBias?: number, shadowMaxZ?: number, shadowMinZ?: number, shadowRefreshRate?: number) {
            if (direction !== undefined) { this.direction = direction; }
            if (intensity !== undefined) { this.intensity = intensity; }
            if (diffuse !== undefined) { this.diffuse = diffuse; }
            if (specular !== undefined) { this.specular = specular; }
            if (shadowGeneratorMapSize !== undefined) { this.shadowGeneratorMapSize = shadowGeneratorMapSize; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
            if (shadowDarkness !== undefined) { this.shadowDarkness = shadowDarkness; }
            if (shadowUsePercentageCloserFiltering !== undefined) { this.shadowUsePercentageCloserFiltering = shadowUsePercentageCloserFiltering; }
            if (shadowContactHardeningLightSizeUVRatio !== undefined) { this.shadowContactHardeningLightSizeUVRatio = shadowContactHardeningLightSizeUVRatio; }
            if (shadowBias !== undefined) { this.shadowBias = shadowBias; }
            if (shadowNormalBias !== undefined) { this.shadowNormalBias = shadowNormalBias; }
            if (shadowMaxZ !== undefined) { this.shadowMaxZ = shadowMaxZ; }
            if (shadowMinZ !== undefined) { this.shadowMinZ = shadowMinZ; }
            if (shadowRefreshRate !== undefined) { this.shadowRefreshRate = shadowRefreshRate; }
        }
        /**
         * Direction of the directional light
         * @default [-100, -100, -100]
         */
        direction: Base.Vector3 = [-100, -100, -100];
        /**
         * Intensity of the point light, value between 0 and 1
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        intensity = 0.5;
        /**
         * Diffuse colour of the point light
         * @default #ffffff
         */
        diffuse: Base.Color = "#ffffff";
        /**
         * Specular colour of the point light
         * @default #ffffff
         */
        specular: Base.Color = "#ffffff";
        /**
         * The map size for shadow generator texture if shadows are enabled
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize? = 1024;
        /**
         * Enables shadows
         * @default true
         */
        enableShadows? = true;
        /**
         * Shadow darkness
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness? = 0;
        /**
         * Use percentage closer filtering
         * @default true
         */
        shadowUsePercentageCloserFiltering = true;
        /**
         * Shadow contact hardening light size UV ratio - only applies if usePercentageCloserFiltering is true
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        shadowContactHardeningLightSizeUVRatio = 0.2;
        /**
         * Shadow bias
         * @default 0.0001
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        shadowBias = 0.0001;
        /**
         * Shadow normal bias
         * @default 0.002
         * @minimum 0
         * @maximum Infinity
         * @step 0.0001
         */
        shadowNormalBias = 0.002;
        /**
         * Shadow max Z
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMaxZ = 1000;
        /**
        * Shadow min Z
        * @default 0
        * @minimum 0
        * @maximum Infinity
        * @step 50
        */
        shadowMinZ = 0;
        /**
         * Shadow refresh rate
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowRefreshRate = 1;
    }
    export class CameraConfigurationDto {
        constructor(position?: Base.Point3, lookAt?: Base.Point3, lowerRadiusLimit?: number, upperRadiusLimit?: number, lowerAlphaLimit?: number, upperAlphaLimit?: number, lowerBetaLimit?: number, upperBetaLimit?: number, angularSensibilityX?: number, angularSensibilityY?: number, maxZ?: number, panningSensibility?: number, wheelPrecision?: number) {
            if (position !== undefined) { this.position = position; }
            if (lookAt !== undefined) { this.lookAt = lookAt; }
            if (lowerRadiusLimit !== undefined) { this.lowerRadiusLimit = lowerRadiusLimit; }
            if (upperRadiusLimit !== undefined) { this.upperRadiusLimit = upperRadiusLimit; }
            if (lowerAlphaLimit !== undefined) { this.lowerAlphaLimit = lowerAlphaLimit; }
            if (upperAlphaLimit !== undefined) { this.upperAlphaLimit = upperAlphaLimit; }
            if (lowerBetaLimit !== undefined) { this.lowerBetaLimit = lowerBetaLimit; }
            if (upperBetaLimit !== undefined) { this.upperBetaLimit = upperBetaLimit; }
            if (angularSensibilityX !== undefined) { this.angularSensibilityX = angularSensibilityX; }
            if (angularSensibilityY !== undefined) { this.angularSensibilityY = angularSensibilityY; }
            if (maxZ !== undefined) { this.maxZ = maxZ; }
            if (panningSensibility !== undefined) { this.panningSensibility = panningSensibility; }
            if (wheelPrecision !== undefined) { this.wheelPrecision = wheelPrecision; }
        }
        /**
         * Position of the point light
         * @default [10, 10, 10]
         * 
         */
        position: Base.Point3 = [10, 10, 10];
        /**
         * Look at
         */
        lookAt: Base.Point3 = [0, 0, 0];
        /**
         * Lower radius limit - how close can the camera be to the target
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        lowerRadiusLimit;
        /**
         * Upper radius limit - how far can the camera be from the target
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        upperRadiusLimit;
        /**
         * Lower alpha limit - camera rotation along the longitudinal (horizontal) axis in degrees.
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        lowerAlphaLimit;
        /**
         * Upper alpha limit - camera rotation along the longitudinal (horizontal) axis in degrees.
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        upperAlphaLimit;
        /**
         * Lower beta limit - camera rotation along the latitudinal (vertical) axis in degrees. This is counted from the top down, where 0 is looking from top straight down.
         * @default 1
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        lowerBetaLimit = 1;
        /**
         * Upper beta limit - camera rotation along the longitudinal (vertical) axis in degrees. This is counted from the top down, where 180 is looking from bottom straight up.
         * @default 179
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        upperBetaLimit = 179;
        /**
         * Angular sensibility along x (horizontal) axis of the camera. The lower this number, the faster the camera will move.
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityX = 1000;
        /**
         * Angular sensibility along y (vertical) axis of the camera. The lower this number, the faster the camera will move.
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityY = 1000;
        /**
         * Change how far the camera can see
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        maxZ = 1000;
        /**
         * Panning sensibility. If large units are used for the model, this number needs to get smaller
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        panningSensibility = 1000;
        /**
         * Zoom precision of the wheel. If large units are used, this number needs to get smaller
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        wheelPrecision = 3;
    }
    export class SkyboxDto {
        constructor(skybox?: Base.skyboxEnum, size?: number, blur?: number, environmentIntensity?: number, hideSkybox?: boolean) {
            if (skybox !== undefined) { this.skybox = skybox; }
            if (size !== undefined) { this.size = size; }
            if (blur !== undefined) { this.blur = blur; }
            if (environmentIntensity !== undefined) { this.environmentIntensity = environmentIntensity; }
            if (hideSkybox !== undefined) { this.hideSkybox = hideSkybox; }
        }
        /**
         * Skybox type
         * @default clearSky
         */
        skybox: Base.skyboxEnum = Base.skyboxEnum.clearSky;
        /**
         * Skybox size
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        size = 1000;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        blur = 0.1;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.7
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        environmentIntensity = 0.7;
        /**
         * Hides the skybox mesh but keeps the environment texture
         * @default false
         */
        hideSkybox?: boolean = false;
    }

    export class SkyboxCustomTextureDto {
        constructor(textureUrl?: string, textureSize?: number, size?: number, blur?: number, environmentIntensity?: number, hideSkybox?: boolean) {
            if (textureUrl !== undefined) { this.textureUrl = textureUrl; }
            if (textureSize !== undefined) { this.textureSize = textureSize; }
            if (size !== undefined) { this.size = size; }
            if (blur !== undefined) { this.blur = blur; }
            if (environmentIntensity !== undefined) { this.environmentIntensity = environmentIntensity; }
            if (hideSkybox !== undefined) { this.hideSkybox = hideSkybox; }
        } 
        /**
         * Skybox texture URL pointing to .hdr, .env or root of the cubemap images
         * @default undefined
         * @optional true
         */
        textureUrl?: string;
        /**
         * Skybox texture size (only applies to custom URL texture)
         * @default 512
         * @optional true
         */
        textureSize?: number = 512;
        /**
         * Skybox size
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        size = 1000;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        blur = 0.1;
        /**
         * Identifies if skybox texture should affect scene environment
         * @default 0.7
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        environmentIntensity = 0.7;
        /**
         * Hides the skybox mesh but keeps the environment texture
         * @default false
         */
        hideSkybox?: boolean = false;
    }

    export class PointerDto {
        statement_update: () => void;
    }
    export class FogDto {
        constructor(mode?: Base.fogModeEnum, color?: Base.Color, density?: number, start?: number, end?: number) {
            if (mode !== undefined) { this.mode = mode; }
            if (color !== undefined) { this.color = color; }
            if (density !== undefined) { this.density = density; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Fog mode
         * @default none
         */
        mode: Base.fogModeEnum;
        /**
         * Fog color
         * @default #ffffff
         */
        color: Base.Color = "#ffffff";
        /**
         * Fog density
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density = 0.1;
        /**
         * Fog start
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        start: number;
        /**
         * Fog end
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        end: number;
    }
    export class SceneCanvasCSSBackgroundImageDto {
        /**
         * Provide options without default values
         */
        constructor(cssBackgroundImage?: string) {
            if (cssBackgroundImage !== undefined) { this.cssBackgroundImage = cssBackgroundImage; }
        }
        /**
         * CSS background image string
         * @default linear-gradient(to top, #1a1c1f 0%, #93aacd 100%)
         */
        cssBackgroundImage = "linear-gradient(to top, #1a1c1f 0%, #93aacd 100%)";
    }

    export class SceneTwoColorLinearGradientDto {
        constructor(colorFrom?: Base.Color, colorTo?: Base.Color, direction?: Base.gradientDirectionEnum, stopFrom?: number, stopTo?: number) {
            if (colorFrom !== undefined) { this.colorFrom = colorFrom; }
            if (colorTo !== undefined) { this.colorTo = colorTo; }
            if (direction !== undefined) { this.direction = direction; }
            if (stopFrom !== undefined) { this.stopFrom = stopFrom; }
            if (stopTo !== undefined) { this.stopTo = stopTo; }
        }
        /**
         * Starting color in hex format
         * @default #1a1c1f
         */
        colorFrom: Base.Color = "#1a1c1f";
        /**
         * Ending color in hex format
         * @default #93aacd
         */
        colorTo: Base.Color = "#93aacd";
        /**
         * Gradient direction
         * @default toBottom
         */
        direction: Base.gradientDirectionEnum = Base.gradientDirectionEnum.toBottom;
        /**
         * Starting color stop percentage
         * @default 0
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopFrom = 0;
        /**
         * Ending color stop percentage
         * @default 100
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopTo = 100;
    }

    export class SceneTwoColorRadialGradientDto {
        constructor(colorFrom?: Base.Color, colorTo?: Base.Color, position?: Base.gradientPositionEnum, stopFrom?: number, stopTo?: number, shape?: Base.gradientShapeEnum) {
            if (colorFrom !== undefined) { this.colorFrom = colorFrom; }
            if (colorTo !== undefined) { this.colorTo = colorTo; }
            if (position !== undefined) { this.position = position; }
            if (stopFrom !== undefined) { this.stopFrom = stopFrom; }
            if (stopTo !== undefined) { this.stopTo = stopTo; }
            if (shape !== undefined) { this.shape = shape; }
        }
        /**
         * Starting color in hex format
         * @default #1a1c1f
         */
        colorFrom: Base.Color = "#1a1c1f";
        /**
         * Ending color in hex format
         * @default #93aacd
         */
        colorTo: Base.Color = "#93aacd";
        /**
         * Gradient position
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * Starting color stop percentage
         * @default 0
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopFrom = 0;
        /**
         * Ending color stop percentage
         * @default 100
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopTo = 100;
        /**
         * Gradient shape
         * @default circle
         */
        shape: Base.gradientShapeEnum = Base.gradientShapeEnum.circle;
    }

    export class SceneMultiColorLinearGradientDto {
        constructor(colors?: Base.Color[], stops?: number[], direction?: Base.gradientDirectionEnum) {
            if (colors !== undefined) { this.colors = colors; }
            if (stops !== undefined) { this.stops = stops; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Array of colors in hex format
         * @default ["#1a1c1f", "#93aacd"]
         */
        colors: Base.Color[] = ["#1a1c1f", "#93aacd"];
        /**
         * Array of stop percentages for each color
         * @default [0, 100]
         */
        stops: number[] = [0, 100];
        /**
         * Gradient direction
         * @default toTop
         */
        direction: Base.gradientDirectionEnum = Base.gradientDirectionEnum.toTop;
    }

    export class SceneMultiColorRadialGradientDto {
        constructor(colors?: Base.Color[], stops?: number[], position?: Base.gradientPositionEnum, shape?: Base.gradientShapeEnum) {
            if (colors !== undefined) { this.colors = colors; }
            if (stops !== undefined) { this.stops = stops; }
            if (position !== undefined) { this.position = position; }
            if (shape !== undefined) { this.shape = shape; }
        }
        /**
         * Array of colors in hex format
         * @default ["#1a1c1f", "#93aacd"]
         */
        colors: Base.Color[] = ["#1a1c1f", "#93aacd"];
        /**
         * Array of stop percentages for each color
         * @default [0, 100]
         */
        stops: number[] = [0, 100];
        /**
         * Gradient position
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * Gradient shape
         * @default circle
         */
        shape: Base.gradientShapeEnum = Base.gradientShapeEnum.circle;
    }

    export class SceneCanvasBackgroundImageDto {
        constructor(imageUrl?: string, repeat?: Base.backgroundRepeatEnum, size?: Base.backgroundSizeEnum, position?: Base.gradientPositionEnum, attachment?: Base.backgroundAttachmentEnum, origin?: Base.backgroundOriginClipEnum, clip?: Base.backgroundOriginClipEnum) {
            if (imageUrl !== undefined) { this.imageUrl = imageUrl; }
            if (repeat !== undefined) { this.repeat = repeat; }
            if (size !== undefined) { this.size = size; }
            if (position !== undefined) { this.position = position; }
            if (attachment !== undefined) { this.attachment = attachment; }
            if (origin !== undefined) { this.origin = origin; }
            if (clip !== undefined) { this.clip = clip; }
        }
        /**
         * URL of the background image
         * @default undefined
         */
        imageUrl?: string;
        /**
         * How the background image should repeat
         * @default noRepeat
         */
        repeat: Base.backgroundRepeatEnum = Base.backgroundRepeatEnum.noRepeat;
        /**
         * Size of the background image (enum values or specific values like '100px 50px')
         * @default cover
         */
        size: Base.backgroundSizeEnum = Base.backgroundSizeEnum.cover;
        /**
         * Position of the background image (enum values or specific values like '50% 50%')
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * Background attachment
         * @default scroll
         */
        attachment: Base.backgroundAttachmentEnum = Base.backgroundAttachmentEnum.scroll;
        /**
         * Background origin
         * @default paddingBox
         */
        origin: Base.backgroundOriginClipEnum = Base.backgroundOriginClipEnum.paddingBox;
        /**
         * Background clip
         * @default borderBox
         */
        clip: Base.backgroundOriginClipEnum = Base.backgroundOriginClipEnum.borderBox;
    }
}
