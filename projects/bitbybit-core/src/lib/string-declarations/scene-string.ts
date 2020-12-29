import { simplifyDeclaration } from "./simplify-declaration";

export const sceneString = simplifyDeclaration(`
import { Context } from '../context';
import { Mesh } from '@babylonjs/core';
export declare class Scene {
    private readonly context;
    constructor(context: Context);
    /**
     * Changes the scene background colour for 3D space
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void;
    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: Inputs.Scene.SceneDrawGridMeshDto): Mesh;
    /**
     * Clears all of the drawn objects in the 3D scene
     */
    clearAllDrawn(): void;
}
`);
