import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";
import { Base } from "../../../inputs/inputs";
import { BabylonArcRotateCamera } from "./arc-rotate-camera";
import { BabylonFreeCamera } from "./free-camera";
import { BabylonTargetCamera } from "./target-camera";

export class BabylonCamera {

    public free: BabylonFreeCamera;
    public arcRotate: BabylonArcRotateCamera;
    public target: BabylonTargetCamera;

    constructor(
        private readonly context: Context,
    ) {
        this.free = new BabylonFreeCamera(this.context);
        this.arcRotate = new BabylonArcRotateCamera(this.context);
        this.target = new BabylonTargetCamera(this.context);
    }

    /**
     * Freeze projection matrix of the camera
     * @param inputs Camera to freeze
     */
    freezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.freezeProjectionMatrix();
    }

    /**
     * Unfreeze projection matrix of the camera
     * @param inputs Camera to freeze
     */
    unfreezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.unfreezeProjectionMatrix();
    }


    /**
     * Changes the position of a camera
     * @param inputs Changes the camera position
     */
    setPosition(inputs: Inputs.BabylonCamera.PositionDto): void {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        inputs.camera.position = pos;
    }

    /**
     * Gets the position of a camera
     * @param inputs Gets the camera position
     */
    getPosition(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.position.x, inputs.camera.position.y, inputs.camera.position.z];
    }

    /**
     * Changes the target of a camera
     * @param inputs Changes the camera target
     */
    setTarget(inputs: Inputs.BabylonCamera.TargetDto): void {
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        inputs.camera.setTarget(target);
    }

    /**
     * Gets the target of a camera
     * @param inputs Gets the camera position
     */
    getTarget(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.target.x, inputs.camera.target.y, inputs.camera.target.z];
    }

    /**
     * Changes the speed of a camera
     * @param inputs Changes the camera target
     */
    setSpeed(inputs: Inputs.BabylonCamera.SpeedDto): void {
        inputs.camera.speed = inputs.speed;
    }

    /**
     * Gets the speed of a camera
     * @param inputs Gets the camera position
     */
    getSpeed(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.target.x, inputs.camera.target.y, inputs.camera.target.z];
    }

    /**
     * Changes the minZ of a camera
     * @param inputs Changes the camera minZ
     */
    setMinZ(inputs: Inputs.BabylonCamera.MinZDto): void {
        inputs.camera.minZ = inputs.minZ;
    }

    /**
     * Changes the maxZ of a camera
     * @param inputs Changes the camera maxZ
     */
    setMaxZ(inputs: Inputs.BabylonCamera.MaxZDto): void {
        inputs.camera.maxZ = inputs.maxZ;
    }
}
