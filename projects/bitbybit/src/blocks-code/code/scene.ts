import { Injectable } from '@angular/core';
import { Context } from './context';
import { Color4, Color3, Mesh } from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';

@Injectable()
export class Scene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: SceneDrawGridMeshDto): Mesh {
        const groundMaterial = new GridMaterial(`groundMaterial${Math.random()}`, this.context.scene);
        groundMaterial.majorUnitFrequency = inputs.majorUnitFrequency;
        groundMaterial.minorUnitVisibility = inputs.minorUnitVisibility;
        groundMaterial.gridRatio = inputs.gridRatio;
        groundMaterial.backFaceCulling = inputs.backFaceCulling;
        groundMaterial.mainColor = Color3.FromHexString(inputs.mainColor);
        groundMaterial.lineColor = Color3.FromHexString(inputs.secondaryColor);
        groundMaterial.opacity = inputs.opacity;

        const ground = Mesh.CreateGround(`ground${Math.random()}`,
            inputs.width, inputs.height, inputs.subdivisions, this.context.scene, false
        );

        ground.material = groundMaterial;
        return ground;
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     */
    clearAllDrawnObjects(): void {
        this.context.bitByBitBlocklyHelperService.clearAllDrawn();
    }

}

interface SceneBackgroundColourDto {
    colour: string;
}

interface SceneDrawGridMeshDto {
    width: number;
    height: number;
    subdivisions: number;
    majorUnitFrequency: number;
    minorUnitVisibility: number;
    gridRatio: number;
    opacity: number;
    backFaceCulling: boolean;
    mainColor: string;
    secondaryColor: string;
}
