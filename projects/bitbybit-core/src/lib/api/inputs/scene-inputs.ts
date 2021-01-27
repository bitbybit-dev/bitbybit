import { PointLight } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Scene {

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

    export class SceneDrawGridMeshDto {
        /**
         * Width of the grid
         */
        width = 400;
        /**
         * Height of the ground
         */
        height = 400;
        /**
         * Ground subdivisions
         */
        subdivisions = 10;
        /**
         * The frequency of thicker lines.
         */
        majorUnitFrequency = 10;
        /**
         * The visibility of minor units in the grid.
         */
        minorUnitVisibility = 0.45;
        /**
         * The scale of the grid compared to unit.
         */
        gridRatio = 0.5;
        /**
         * The grid opacity outside of the lines.
         */
        opacity = 0.5;
        /**
         * Cull the back faces
         */
        backFaceCulling = false;
        /**
         * Main color of the grid (e.g. between lines)
         */
        mainColor = '#000000';
        /**
         * Color of the grid lines.
         */
        secondaryColor = '#555555';
    }
    export class PointLightDto {
        /**
         * Position of the point light
         */
        position: number[];
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
        radius: 0.1;
    }
}
