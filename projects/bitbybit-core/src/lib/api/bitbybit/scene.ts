import { Injectable } from '@angular/core';
import { Context } from '../context';
import {
    Color4, Color3, Mesh, PointLight, Vector3,
    MeshBuilder, StandardMaterial, Light, ArcRotateCamera, Angle
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials';
import * as Inputs from '../inputs/inputs';
import { GeometryHelper } from '../geometry-helper';

@Injectable()
export class Scene {

    constructor(private readonly context: Context) { }

    /**
     * Changes the scene background colour for 3D space
     * <div>
     *  <img src="../assets/images/blockly-images/scene/backgroundColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#backgroundcolour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void {
        this.context.scene.clearColor = Color4.FromColor3(Color3.FromHexString(inputs.colour));
    }

    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawGridMesh.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawgridmesh
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: Inputs.Scene.SceneDrawGridMeshDto): Mesh {
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
     * Creates and draws a point light in the scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/drawPointLight.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawpointlight
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     */
    drawPointLight(inputs: Inputs.Scene.PointLightDto): PointLight {
        const pos = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const light = new PointLight(`pointLight${Math.random()}`,
            pos,
            this.context.scene
        );
        light.diffuse = Color3.FromHexString(inputs.diffuse);
        light.specular = Color3.FromHexString(inputs.specular);
        light.intensityMode = Light.INTENSITYMODE_LUMINOUSPOWER;
        light.intensity = inputs.intensity;

        if (inputs.radius > 0) {
            const sphere = MeshBuilder.CreateSphere(`PointLightSphere${Math.random()}`,
                { diameter: inputs.radius * 2 },
                this.context.scene
            );
            const lightMaterial = new StandardMaterial(`LightMaterial${Math.random()}`, this.context.scene);
            lightMaterial.diffuseColor = light.diffuse;
            lightMaterial.specularColor = light.diffuse;
            lightMaterial.emissiveColor = light.diffuse;
            sphere.material = lightMaterial;
            sphere.parent = light;
        }
        return light;
    }

    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * <div>
     *  <img src="../assets/images/blockly-images/scene/adjustActiveArcRotateCamera.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#adjustactivearcrotatecamera
     */
    adjustActiveArcRotateCamera(inputs: Inputs.Scene.CameraConfigurationDto): void {
        const camera = this.context.scene.getCameraByName('Camera') as ArcRotateCamera;
        camera.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        camera.maxZ = inputs.maxZ;
        camera.panningSensibility = inputs.panningSensibility;
        camera.wheelPrecision = inputs.wheelPrecision;
    }

    /**
     * Clears all of the drawn objects in the 3D scene
     * <div>
     *  <img src="../assets/images/blockly-images/scene/clearAllDrawn.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#clearalldrawn
     */
    clearAllDrawn(): void {
        this.context.bitByBitBlocklyHelperService.clearAllDrawn();
    }

    /**
     * Creates mesh instance and transforms it for optimised rendering. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child ges a mesh instance.
     * <div>
     *  <img src="../assets/images/blockly-images/scene/createMeshInstanceAndTransform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#createmeshinstanceandtransform
     */
    createMeshInstanceAndTransform(inputs: Inputs.Scene.MeshInstanceAndTransformDto): Promise<any> {
        return new Promise((resolve, reject) => {
            if (inputs.mesh && inputs.mesh.getChildren && inputs.mesh.getChildren().length > 0) {
                inputs.mesh.getChildren().forEach((child: Mesh) => {
                    if (child.createInstance) {
                        child.isVisible = false;

                        const newInstance = child.createInstance(`InstanceMesh${Math.random}`);

                        newInstance.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                        newInstance.rotation = new Vector3(inputs.rotation[0], inputs.rotation[1], inputs.rotation[2]);
                        newInstance.scaling = new Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);
                    }
                });
            } else if (inputs.mesh) {
                inputs.mesh.isVisible = false;

                const newInstance = inputs.mesh.createInstance(`InstanceMesh${Math.random}`);

                newInstance.position = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
                newInstance.rotation = new Vector3(
                    Angle.FromDegrees(inputs.rotation[0]).radians(),
                    Angle.FromDegrees(inputs.rotation[1]).radians(),
                    Angle.FromDegrees(inputs.rotation[2]).radians());
                newInstance.scaling = new Vector3(inputs.scaling[0], inputs.scaling[1], inputs.scaling[2]);
            }
            resolve({} as any);
        });
    }

}
