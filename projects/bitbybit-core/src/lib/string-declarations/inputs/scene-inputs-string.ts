import { simplifyDeclaration } from '../simplify-declaration';

export const sceneInputsString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
export declare namespace Scene {
    class SceneBackgroundColourDto {
        /**
         * Provide options without default values
         */
        constructor(colour?: string);
        /**
         * Hex colour string for the scene background colour
         */
        colour: string;
    }
    class SceneDrawGridMeshDto {
        /**
         * Width of the grid
         */
        width: number;
        /**
         * Height of the ground
         */
        height: number;
        /**
         * Ground subdivisions
         */
        subdivisions: number;
        /**
         * The frequency of thicker lines.
         */
        majorUnitFrequency: number;
        /**
         * The visibility of minor units in the grid.
         */
        minorUnitVisibility: number;
        /**
         * The scale of the grid compared to unit.
         */
        gridRatio: number;
        /**
         * The grid opacity outside of the lines.
         */
        opacity: number;
        /**
         * Cull the back faces
         */
        backFaceCulling: boolean;
        /**
         * Main color of the grid (e.g. between lines)
         */
        mainColor: string;
        /**
         * Color of the grid lines.
         */
        secondaryColor: string;
    }
    class PointLightDto {
        /**
         * Position of the point light
         */
        position: number[];
        /**
         * Intensity of the point light, value between 0 and 1
         */
        intensity: number;
        /**
         * Diffuse colour of the point light
         */
        diffuse: string;
        /**
         * Specular colour of the point light
         */
        specular: string;
        /**
         * Radius of the sphere mesh representing the light bulb. If 0 light gets created without the mesh
         */
        radius: number;
    }
    class CameraConfigurationDto {
        /**
         * Position of the point light
         */
        position: number[];
        /**
         * Lets configure how far the camera can see
         */
        maxZ: number;
        /**
         * Panning sensibility. If large units are used for the model, this number needs to get larger
         */
        panningSensibility: number;
        /**
         * Zoom precision of the wheel. If large units are used, this number needs to get smaller
         */
        wheelPrecision: number;
    }
    class MeshInstanceAndTransformDto {
        mesh: Mesh;
        position: number[];
        rotation: number[];
        scaling: number[];
    }
}
`);
