import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import { Base } from "../../../inputs";
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
     * @param inputs camera to freeze
     * @group adjust
     * @shortname freeze projection matrix
     */
    freezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.freezeProjectionMatrix();
    }

    /**
     * Unfreeze projection matrix of the camera
     * @param inputs camera to unfreeze
     * @group adjust
     * @shortname unfreeze projection matrix
     */
    unfreezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.unfreezeProjectionMatrix();
    }


    /**
     * Changes the position of a camera
     * @param inputs camera and position
     * @group set
     * @shortname set camera position
     */
    setPosition(inputs: Inputs.BabylonCamera.PositionDto): void {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        inputs.camera.position = pos;
    }

    /**
     * Gets the position of a camera
     * @param inputs camera
     * @group get
     * @shortname get camera position
     */
    getPosition(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.position.x, inputs.camera.position.y, inputs.camera.position.z];
    }

    /**
     * Changes the target of a camera
     * @param inputs camera and target
     * @group set
     * @shortname set camera target
     */
    setTarget(inputs: Inputs.BabylonCamera.TargetDto): void {
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        inputs.camera.setTarget(target);
    }

    /**
     * Gets the target of a camera
     * @param inputs camera
     * @group get
     * @shortname get camera target
     */
    getTarget(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.target.x, inputs.camera.target.y, inputs.camera.target.z];
    }

    /**
     * Changes the speed of a camera
     * @param inputs camera and speed
     * @group set
     * @shortname set camera speed
     */
    setSpeed(inputs: Inputs.BabylonCamera.SpeedDto): void {
        inputs.camera.speed = inputs.speed;
    }

    /**
     * Gets the speed of a camera
     * @param inputs camera
     * @group get
     * @shortname get camera speed
     */
    getSpeed(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.target.x, inputs.camera.target.y, inputs.camera.target.z];
    }

    /**
     * Changes the minZ of a camera
     * @param inputs camera
     * @group set
     * @shortname set camera min z
     */
    setMinZ(inputs: Inputs.BabylonCamera.MinZDto): void {
        inputs.camera.minZ = inputs.minZ;
    }

    /**
     * Changes the maxZ of a camera
     * @param inputs camera and maxz value
     * @group set
     * @shortname camera max z
     */
    setMaxZ(inputs: Inputs.BabylonCamera.MaxZDto): void {
        inputs.camera.maxZ = inputs.maxZ;
    }

    /**
     * Changes the the mode of the camera to orthographic
     * @param inputs the camera and orthographic properties
     * @group adjust
     * @shortname enable orthographic mode
     */
    makeCameraOrthographic(inputs: Inputs.BabylonCamera.OrthographicDto): void {
        inputs.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        inputs.camera.orthoBottom = inputs.orthoBottom || -1;
        inputs.camera.orthoTop = inputs.orthoTop || 1;
        inputs.camera.orthoLeft = inputs.orthoLeft || -1;
        inputs.camera.orthoRight = inputs.orthoRight || 1;
    }


    /**
     * Changes the mode of a camera to perspective
     * @param inputs Changes the camera maxZ
     * @group adjust
     * @shortname enable perspective mode
     */
    makeCameraPerspective(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    }
    
}
