/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/**
 * Parameters for the scene itself: background and clear color, fog, environment and skybox settings,
 * active camera, and the scene-level options that affect everything drawn into it.
 */
export namespace BabylonScene {

    /**
     * Feeds `babylon.scene.backgroundColour` with the one plain color to fill the background with.
     */
    export class SceneBackgroundColourDto {
        /**
         * Provide options without default values
         */
        constructor(colour?: string) {
            if (colour !== undefined) { this.colour = colour; }
        }
        /**
         * Hex color the whole background is painted in
         * @default #ffffff
         */
        colour: Base.Color = "#ffffff";
    }
    /**
     * Feeds `babylon.scene.setAndAttachScene` with the scene this library should draw into from
     * then on.
     */
    export class SceneDto {
        /**
         * Provide scene
         */
        constructor(scene?: BABYLON.Scene) {
            if (scene !== undefined) { this.scene = scene; }
        }
        /**
         * The scene to draw into; it gets the shadow bookkeeping and root node this library expects
         * @default undefined
         */
        scene!: BABYLON.Scene;
    }
    /**
     * Feeds `babylon.scene.enablePhysics` with the gravity that bodies fall under.
     */
    export class EnablePhysicsDto {
        constructor(vector?: Base.Vector3) {
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The gravity as a vector, `[0, -9.81, 0]` being Earth's pull downward along Y
         * @default [0, -9.81, 0]
         */
        vector: Base.Vector3 = [0, -9.81, 0];
    }
    /**
     * Feeds `babylon.scene.drawPointLight`: where the bulb sits, its colors and brightness, the
     * size of its visible sphere and the shadow settings.
     */
    export class PointLightDto {
        constructor(position?: Base.Point3, intensity?: number, diffuse?: Base.Color, specular?: Base.Color, radius?: number, shadowGeneratorMapSize?: number, enableShadows?: boolean, shadowDarkness?: number, transparencyShadow?: boolean, shadowUsePercentageCloserFiltering?: boolean, shadowContactHardeningLightSizeUVRatio?: number, shadowBias?: number, shadowNormalBias?: number, shadowMaxZ?: number, shadowMinZ?: number, shadowRefreshRate?: number) {
            if (position !== undefined) { this.position = position; }
            if (intensity !== undefined) { this.intensity = intensity; }
            if (diffuse !== undefined) { this.diffuse = diffuse; }
            if (specular !== undefined) { this.specular = specular; }
            if (radius !== undefined) { this.radius = radius; }
            if (shadowGeneratorMapSize !== undefined) { this.shadowGeneratorMapSize = shadowGeneratorMapSize; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
            if (shadowDarkness !== undefined) { this.shadowDarkness = shadowDarkness; }
            if (transparencyShadow !== undefined) { this.transparencyShadow = transparencyShadow; }
            if (shadowUsePercentageCloserFiltering !== undefined) { this.shadowUsePercentageCloserFiltering = shadowUsePercentageCloserFiltering; }
            if (shadowContactHardeningLightSizeUVRatio !== undefined) { this.shadowContactHardeningLightSizeUVRatio = shadowContactHardeningLightSizeUVRatio; }
            if (shadowBias !== undefined) { this.shadowBias = shadowBias; }
            if (shadowNormalBias !== undefined) { this.shadowNormalBias = shadowNormalBias; }
            if (shadowMaxZ !== undefined) { this.shadowMaxZ = shadowMaxZ; }
            if (shadowMinZ !== undefined) { this.shadowMinZ = shadowMinZ; }
            if (shadowRefreshRate !== undefined) { this.shadowRefreshRate = shadowRefreshRate; }
        }
        /**
         * Where the light shines from
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Brightness as luminous power, so values in the thousands are normal; 0 gives no light
         * @default 2000
         * @minimum 0
         * @maximum Infinity
         * @step 500
         */
        intensity = 2000;
        /**
         * Hex color of the light on surfaces
         * @default #ffffff
         */
        diffuse: Base.Color = "#ffffff";
        /**
         * Hex color of the highlights the light makes on shiny surfaces
         * @default #ffffff
         */
        specular: Base.Color = "#ffffff";
        /**
         * Radius of the glowing sphere drawn at the light's position, in scene units; 0 draws none
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 0.1;
        /**
         * Resolution of the shadow map in pixels; higher gives sharper shadows at more GPU cost
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize?: number | undefined = 1024;
        /**
         * When true, the light casts shadows from every mesh in the scene
         * @default true
         */
        enableShadows?: boolean | undefined = true;
        /**
         * How light the shadows are, from 0 for fully dark to 1 for invisible
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness?: number | undefined = 0;
        /**
         * When true, transparent parts of meshes let light through the shadow, which Gaussian
         * splats need
         * @default false
         */
        transparencyShadow = false;
        /**
         * When true, shadow edges are softened by sampling the map several times
         * @default true
         */
        shadowUsePercentageCloserFiltering = true;
        /**
         * How much shadow edges blur with distance from the caster when filtering is on; larger
         * blurs more
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        shadowContactHardeningLightSizeUVRatio = 0.2;
        /**
         * Small depth offset that stops surfaces from shadowing themselves in stripes; raise it if
         * stripes appear
         * @default 0.0001
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        shadowBias = 0.0001;
        /**
         * Extra offset along surface normals against self-shadowing, in scene units
         * @default 0.002
         * @minimum 0
         * @maximum Infinity
         * @step 0.0001
         */
        shadowNormalBias = 0.002;
        /**
         * The farthest distance from the light that shadows are computed for, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMaxZ = 1000;
        /**
         * The nearest distance from the light that shadows are computed for, in scene units
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMinZ = 0.1;
        /**
         * How often the shadow map is redrawn: 1 every frame, 0 once only, 2 every second frame
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowRefreshRate = 1;
    }
    /**
     * Feeds `babylon.scene.activateCamera` with the camera the scene should render through.
     */
    export class ActiveCameraDto {
        constructor(camera?: BABYLON.Camera) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * The camera that becomes active
         * @default undefined
         */
        camera!: BABYLON.Camera;
    }
    /**
     * Feeds `babylon.scene.useRightHandedSystem` with the choice between the two coordinate
     * handednesses.
     */
    export class UseRightHandedSystemDto {
        constructor(use?: boolean) {
            if (use !== undefined) { this.use = use; }
        }
        /**
         * When true, the scene uses the right-handed system of most CAD tools and glTF; when false,
         * the engine's default left-handed one
         * @default true
         */
        use = true;
    }
    /**
     * Feeds `babylon.scene.drawDirectionalLight`: the direction the sun-like light shines in, its
     * colors and brightness and the shadow settings.
     */
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
         * The direction the light travels in; `[-100, -100, -100]` shines down and diagonally, and
         * only the direction matters, not the length
         * @default [-100, -100, -100]
         */
        direction: Base.Vector3 = [-100, -100, -100];
        /**
         * Brightness as a plain factor, 1 being full strength
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        intensity = 0.5;
        /**
         * Hex color of the light on surfaces
         * @default #ffffff
         */
        diffuse: Base.Color = "#ffffff";
        /**
         * Hex color of the highlights the light makes on shiny surfaces
         * @default #ffffff
         */
        specular: Base.Color = "#ffffff";
        /**
         * Resolution of the shadow map in pixels; higher gives sharper shadows at more GPU cost
         * @default 1024
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowGeneratorMapSize?: number | undefined = 1024;
        /**
         * When true, the light casts shadows from every mesh in the scene
         * @default true
         */
        enableShadows?: boolean | undefined = true;
        /**
         * How light the shadows are, from 0 for fully dark to 1 for invisible
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        shadowDarkness?: number | undefined = 0;
        /**
         * When true, shadow edges are softened by sampling the map several times
         * @default true
         */
        shadowUsePercentageCloserFiltering = true;
        /**
         * When true, transparent parts of meshes let light through the shadow, which Gaussian
         * splats need
         * @default false
         */
        transparencyShadow = false;
        /**
         * How much shadow edges blur with distance from the caster when filtering is on; larger
         * blurs more
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        shadowContactHardeningLightSizeUVRatio = 0.2;
        /**
         * Small depth offset that stops surfaces from shadowing themselves in stripes; raise it if
         * stripes appear
         * @default 0.0001
         * @minimum 0
         * @maximum Infinity
         * @step 0.00001
         */
        shadowBias = 0.0001;
        /**
         * Extra offset along surface normals against self-shadowing, in scene units
         * @default 0.002
         * @minimum 0
         * @maximum Infinity
         * @step 0.0001
         */
        shadowNormalBias = 0.002;
        /**
         * The farthest distance from the light that shadows are computed for, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMaxZ = 1000;
        /**
         * The nearest distance from the light that shadows are computed for, in scene units
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 50
         */
        shadowMinZ = 0;
        /**
         * How often the shadow map is redrawn: 1 every frame, 0 once only, 2 every second frame
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        shadowRefreshRate = 1;
    }
    /**
     * Feeds `babylon.scene.adjustActiveArcRotateCamera`: where the default orbiting camera goes,
     * what it looks at, and its optional limits and sensitivities.
     */
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
         * Where the camera is placed; its orbit radius becomes the distance to `lookAt`
         * @default [10, 10, 10]
         */
        position: Base.Point3 = [10, 10, 10];
        /**
         * The point the camera looks at and orbits around
         */
        lookAt: Base.Point3 = [0, 0, 0];
        /**
         * The closest the camera may zoom to the target, in scene units; left out, it is not
         * changed
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        lowerRadiusLimit?: number | undefined;
        /**
         * The farthest the camera may zoom from the target, in scene units; left out, it is not
         * changed
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        upperRadiusLimit?: number | undefined;
        /**
         * The smallest angle around the vertical axis the camera may orbit to, in degrees; left
         * out, it is not changed
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        lowerAlphaLimit?: number | undefined;
        /**
         * The largest angle around the vertical axis the camera may orbit to, in degrees; left out,
         * it is not changed
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        upperAlphaLimit?: number | undefined;
        /**
         * How close to straight above the camera may go, in degrees down from the top; 0 would look
         * straight down
         * @default 1
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        lowerBetaLimit = 1;
        /**
         * How close to straight below the camera may go, in degrees down from the top; 180 would
         * look straight up
         * @default 179
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        upperBetaLimit = 179;
        /**
         * How much pointer movement a horizontal orbit takes; lower turns faster
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityX = 1000;
        /**
         * How much pointer movement a vertical orbit takes; lower turns faster
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityY = 1000;
        /**
         * The farthest distance the camera draws, in scene units; anything beyond is not rendered
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        maxZ = 1000;
        /**
         * How much pointer movement a pan takes; lower pans faster, so lower it for large models
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        panningSensibility = 1000;
        /**
         * How much wheel movement a zoom step takes; lower zooms faster, so lower it for large
         * models
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        wheelPrecision = 3;
    }
    /**
     * Feeds `babylon.scene.enableSkybox`: which built-in sky to use, how big and blurred it is, how
     * much it lights the scene and whether it is shown.
     */
    export class SkyboxDto {
        constructor(skybox?: Base.skyboxEnum, size?: number, blur?: number, environmentIntensity?: number, hideSkybox?: boolean) {
            if (skybox !== undefined) { this.skybox = skybox; }
            if (size !== undefined) { this.size = size; }
            if (blur !== undefined) { this.blur = blur; }
            if (environmentIntensity !== undefined) { this.environmentIntensity = environmentIntensity; }
            if (hideSkybox !== undefined) { this.hideSkybox = hideSkybox; }
        }
        /**
         * The built-in sky to surround the scene with
         * @default clearSky
         */
        skybox: Base.skyboxEnum = Base.skyboxEnum.clearSky;
        /**
         * Edge length of the sky cube, in scene units; make it larger than the scene so nothing
         * pokes through
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        size = 1000;
        /**
         * How much the visible sky is blurred, from 0 for sharp to 1 for fully soft; the lighting
         * is unaffected
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        blur = 0.1;
        /**
         * How strongly the sky lights the scene through reflections and ambient light; 1 is full
         * strength
         * @default 0.7
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        environmentIntensity = 0.7;
        /**
         * When true, the sky is not drawn but still lights the scene
         * @default false
         */
        hideSkybox?: boolean | undefined = false;
    }

    /**
     * Feeds `babylon.scene.enableSkyboxCustomTexture`: your own sky texture by URL, its size, and
     * the same size, blur, intensity and visibility options as the built-in skies.
     */
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
         * Address of an `.hdr` file, an `.env` file or the root of six cube face images; nothing
         * happens without it
         * @default undefined
         * @optional true
         */
        textureUrl?: string | undefined;
        /**
         * Resolution the sky texture is loaded at, in pixels per face; used for `.hdr` files
         * @default 512
         * @optional true
         */
        textureSize?: number | undefined = 512;
        /**
         * Edge length of the sky cube, in scene units; make it larger than the scene so nothing
         * pokes through
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        size = 1000;
        /**
         * How much the visible sky is blurred, from 0 for sharp to 1 for fully soft; the lighting
         * is unaffected
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        blur = 0.1;
        /**
         * How strongly the sky lights the scene through reflections and ambient light; 1 is full
         * strength
         * @default 0.7
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        environmentIntensity = 0.7;
        /**
         * When true, the sky is not drawn but still lights the scene
         * @default false
         */
        hideSkybox?: boolean | undefined = false;
    }

    /**
     * Feeds `babylon.scene.onPointerDown`, `onPointerUp` and `onPointerMove` with the function to
     * run on that pointer event.
     */
    export class PointerDto {
        /**
         * The function to run each time the event happens; it takes no arguments
         */
        statement_update!: () => void;
    }
    /**
     * Feeds `babylon.scene.fog`: the fog mode, its color, how dense it is and, for linear fog,
     * where it starts and ends.
     */
    export class FogDto {
        constructor(mode?: Base.fogModeEnum, color?: Base.Color, density?: number, start?: number, end?: number) {
            if (mode !== undefined) { this.mode = mode; }
            if (color !== undefined) { this.color = color; }
            if (density !== undefined) { this.density = density; }
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * `none` turns fog off, `linear` fades between `start` and `end`, `exponential` and
         * `exponentialSquared` fade by `density`
         * @default none
         */
        mode: Base.fogModeEnum = Base.fogModeEnum.none;
        /**
         * Hex color distant geometry fades into, normally the background color
         * @default #ffffff
         */
        color: Base.Color = "#ffffff";
        /**
         * How quickly the exponential modes thicken with distance; ignored by linear fog
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        density = 0.1;
        /**
         * Distance from the camera where linear fog begins, in scene units
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        start: number = 0;
        /**
         * Distance from the camera where linear fog hides everything, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        end: number = 1000;
    }
    /**
     * Feeds `babylon.scene.canvasCSSBackgroundImage` with any CSS background image value to paint
     * behind the scene.
     */
    export class SceneCanvasCSSBackgroundImageDto {
        /**
         * Provide options without default values
         */
        constructor(cssBackgroundImage?: string) {
            if (cssBackgroundImage !== undefined) { this.cssBackgroundImage = cssBackgroundImage; }
        }
        /**
         * A CSS `background-image` value, such as a gradient function or `url(...)`
         * @default linear-gradient(to top, #1a1c1f 0%, #93aacd 100%)
         */
        cssBackgroundImage = "linear-gradient(to top, #1a1c1f 0%, #93aacd 100%)";
    }

    /**
     * Feeds `babylon.scene.twoColorLinearGradientBackground`: the two colors, the direction the
     * gradient runs in and where each color stops.
     */
    export class SceneTwoColorLinearGradientDto {
        constructor(colorFrom?: Base.Color, colorTo?: Base.Color, direction?: Base.gradientDirectionEnum, stopFrom?: number, stopTo?: number) {
            if (colorFrom !== undefined) { this.colorFrom = colorFrom; }
            if (colorTo !== undefined) { this.colorTo = colorTo; }
            if (direction !== undefined) { this.direction = direction; }
            if (stopFrom !== undefined) { this.stopFrom = stopFrom; }
            if (stopTo !== undefined) { this.stopTo = stopTo; }
        }
        /**
         * Hex color the gradient starts with
         * @default #1a1c1f
         */
        colorFrom: Base.Color = "#1a1c1f";
        /**
         * Hex color the gradient ends with
         * @default #93aacd
         */
        colorTo: Base.Color = "#93aacd";
        /**
         * Which way the gradient runs, such as to the top or to the bottom right
         * @default toBottom
         */
        direction: Base.gradientDirectionEnum = Base.gradientDirectionEnum.toBottom;
        /**
         * Where the first color is still pure, as a percentage along the gradient
         * @default 0
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopFrom = 0;
        /**
         * Where the second color becomes pure, as a percentage along the gradient
         * @default 100
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopTo = 100;
    }

    /**
     * Feeds `babylon.scene.twoColorRadialGradientBackground`: the two colors, where the gradient
     * spreads from, its shape and where each color stops.
     */
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
         * Hex color at the center of the gradient
         * @default #1a1c1f
         */
        colorFrom: Base.Color = "#1a1c1f";
        /**
         * Hex color at the outer edge of the gradient
         * @default #93aacd
         */
        colorTo: Base.Color = "#93aacd";
        /**
         * Where the center of the gradient sits on the canvas
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * How far from the center the first color is still pure, as a percentage
         * @default 0
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopFrom = 0;
        /**
         * How far from the center the second color becomes pure, as a percentage
         * @default 100
         * @minimum 0
         * @maximum 100
         * @step 1
         */
        stopTo = 100;
        /**
         * Whether the gradient spreads as a circle or stretches into an ellipse with the canvas
         * @default circle
         */
        shape: Base.gradientShapeEnum = Base.gradientShapeEnum.circle;
    }

    /**
     * Feeds `babylon.scene.multiColorLinearGradientBackground`: the colors, one stop each, and the
     * direction the gradient runs in.
     */
    export class SceneMultiColorLinearGradientDto {
        constructor(colors?: Base.Color[], stops?: number[], direction?: Base.gradientDirectionEnum) {
            if (colors !== undefined) { this.colors = colors; }
            if (stops !== undefined) { this.stops = stops; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * The hex colors in order; the list must be as long as `stops`
         * @default ["#1a1c1f", "#93aacd"]
         */
        colors: Base.Color[] = ["#1a1c1f", "#93aacd"];
        /**
         * Where each color is pure, as percentages along the gradient, one per color
         * @default [0, 100]
         */
        stops: number[] = [0, 100];
        /**
         * Which way the gradient runs, such as to the top or to the bottom right
         * @default toTop
         */
        direction: Base.gradientDirectionEnum = Base.gradientDirectionEnum.toTop;
    }

    /**
     * Feeds `babylon.scene.multiColorRadialGradientBackground`: the colors, one stop each, where
     * the gradient spreads from and its shape.
     */
    export class SceneMultiColorRadialGradientDto {
        constructor(colors?: Base.Color[], stops?: number[], position?: Base.gradientPositionEnum, shape?: Base.gradientShapeEnum) {
            if (colors !== undefined) { this.colors = colors; }
            if (stops !== undefined) { this.stops = stops; }
            if (position !== undefined) { this.position = position; }
            if (shape !== undefined) { this.shape = shape; }
        }
        /**
         * The hex colors from the center outward; the list must be as long as `stops`
         * @default ["#1a1c1f", "#93aacd"]
         */
        colors: Base.Color[] = ["#1a1c1f", "#93aacd"];
        /**
         * How far from the center each color is pure, as percentages, one per color
         * @default [0, 100]
         */
        stops: number[] = [0, 100];
        /**
         * Where the center of the gradient sits on the canvas
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * Whether the gradient spreads as a circle or stretches into an ellipse with the canvas
         * @default circle
         */
        shape: Base.gradientShapeEnum = Base.gradientShapeEnum.circle;
    }

    /**
     * Feeds `babylon.scene.canvasBackgroundImage`: the image to show behind the scene and the CSS
     * options for how it repeats, scales, sits and scrolls.
     */
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
         * Address of the image to show behind the scene
         * @default undefined
         */
        imageUrl?: string | undefined;
        /**
         * Whether the image tiles across the canvas, in one direction or not at all
         * @default noRepeat
         */
        repeat: Base.backgroundRepeatEnum = Base.backgroundRepeatEnum.noRepeat;
        /**
         * How the image is scaled: cover fills the canvas, contain shows all of it, or a CSS size
         * such as `100px 50px`
         * @default cover
         */
        size: Base.backgroundSizeEnum = Base.backgroundSizeEnum.cover;
        /**
         * Where the image sits on the canvas, such as the center or a corner, or a CSS position
         * such as `50% 50%`
         * @default center
         */
        position: Base.gradientPositionEnum = Base.gradientPositionEnum.center;
        /**
         * Whether the image scrolls with the page or stays fixed to the viewport
         * @default scroll
         */
        attachment: Base.backgroundAttachmentEnum = Base.backgroundAttachmentEnum.scroll;
        /**
         * Which box of the canvas the image is positioned against: its padding, border or content
         * box
         * @default paddingBox
         */
        origin: Base.backgroundOriginClipEnum = Base.backgroundOriginClipEnum.paddingBox;
        /**
         * Which box of the canvas the image is clipped to: its padding, border or content box
         * @default borderBox
         */
        clip: Base.backgroundOriginClipEnum = Base.backgroundOriginClipEnum.borderBox;
    }
}
