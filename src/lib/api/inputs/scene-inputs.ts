import { Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace BabylonScene {

    export class SceneBackgroundColourDto {
        /**
         * Provide options without default values
         */
        constructor(colour?: string) {
            this.colour = colour;
        }
        /**
         * Hex colour string for the scene background colour
         */
        colour = '#ffffff';
    }
    export class PointLightDto {
        /**
         * Position of the point light
         */
        position: Base.Point3;
        /**
         * Intensity of the point light, value between 0 and 1
         */
        intensity = 0.5;
        /**
         * Diffuse colour of the point light
         */
        diffuse = '#ffffff';
        /**
         * Specular colour of the point light
         */
        specular = '#ffffff';
        /**
         * Radius of the sphere mesh representing the light bulb. If 0 light gets created without the mesh
         */
        radius = 0.1;
        /**
         * The map size for shadow generator texture if shadows are enabled
         */
        shadowGeneratorMapSize?= 1024;
        /**
         * Enables shadows
         */
        enableShadows?= true;
        /**
         * Shadow darkness
         */
        shadowDarkness?= 0;
    }
    export class DirectionalLightDto {
        /**
         * Direction of the directional light
         */
        direction: Base.Vector3;
        /**
         * Intensity of the point light, value between 0 and 1
         */
        intensity = 0.5;
        /**
         * Diffuse colour of the point light
         */
        diffuse = '#ffffff';
        /**
         * Specular colour of the point light
         */
        specular = '#ffffff';
        /**
         * The map size for shadow generator texture if shadows are enabled
         */
        shadowGeneratorMapSize?= 1024;
        /**
         * Enables shadows
         */
        enableShadows?= true;
        /**
         * Shadow darkness
         */
        shadowDarkness?= 0;
    }
    export class CameraConfigurationDto {
        /**
         * Position of the point light
         */
        position: Base.Point3;
        /**
         * Look at
         */
        lookAt: Base.Point3;
        /**
         * Lets configure how far the camera can see
         */
        maxZ = 1000;
        /**
         * Panning sensibility. If large units are used for the model, this number needs to get larger
         */
        panningSensibility = 0.1;
        /**
         * Zoom precision of the wheel. If large units are used, this number needs to get smaller
         */
        wheelPrecision = 0.1;
    }
}
