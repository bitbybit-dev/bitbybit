import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import { Base } from "../../../inputs";
import { BabylonArcRotateCamera } from "./arc-rotate-camera";
import { BabylonFreeCamera } from "./free-camera";
import { BabylonTargetCamera } from "./target-camera";

/**
 * Cameras of the BabylonJS scene: `arcRotate` orbits a target and is the usual choice for looking
 * at a model, `free` flies with keyboard and pointer, `target` looks at a point without user
 * control. The methods here set a camera's position, target, speed and clipping distances and
 * switch it between perspective and orthographic projection.
 */
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
     * Stops a camera from recomputing its projection every frame, saving work when its field of
     * view and clipping distances no longer change.
     * @param inputs - The camera
     * @group adjust
     * @shortname freeze projection matrix
     */
    freezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.freezeProjectionMatrix();
    }

    /**
     * Lets a frozen camera recompute its projection again, needed after changing its field of view
     * or clipping distances.
     * @param inputs - The camera
     * @group adjust
     * @shortname unfreeze projection matrix
     */
    unfreezeProjectionMatrix(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.unfreezeProjectionMatrix();
    }


    /**
     * Moves a camera to a point in the scene; a target camera keeps looking at its target from
     * there.
     * @param inputs - The camera and the position
     * @group set
     * @shortname set camera position
     * @example
     * ```typescript
     * bitbybit.babylon.camera.setPosition({ camera, position: [20, 20, 20] });
     * ```
     */
    setPosition(inputs: Inputs.BabylonCamera.PositionDto): void {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        inputs.camera.position = pos;
    }

    /**
     * Reads where a camera is in the scene, as a point.
     * @param inputs - The camera
     * @returns The position as a point
     * @group get
     * @shortname get camera position
     */
    getPosition(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.position.x, inputs.camera.position.y, inputs.camera.position.z];
    }

    /**
     * Turns a camera to look at a point in the scene.
     * @param inputs - The camera and the target point
     * @group set
     * @shortname set camera target
     * @example
     * ```typescript
     * bitbybit.babylon.camera.setTarget({ camera, target: [0, 5, 0] });
     * ```
     */
    setTarget(inputs: Inputs.BabylonCamera.TargetDto): void {
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        inputs.camera.setTarget(target);
    }

    /**
     * Reads the point a camera is looking at.
     * @param inputs - The camera
     * @returns The target as a point
     * @group get
     * @shortname get camera target
     */
    getTarget(inputs: Inputs.BabylonCamera.PositionDto): Base.Point3 {
        return [inputs.camera.target.x, inputs.camera.target.y, inputs.camera.target.z];
    }

    /**
     * Sets how fast a camera moves in response to its keyboard and pointer controls; 1 is the
     * default pace.
     * @param inputs - The camera and the speed
     * @group set
     * @shortname set camera speed
     */
    setSpeed(inputs: Inputs.BabylonCamera.SpeedDto): void {
        inputs.camera.speed = inputs.speed;
    }

    /**
     * Reads how fast a camera moves in response to its controls.
     * @param inputs - The camera
     * @returns The speed
     * @group get
     * @shortname get camera speed
     */
    getSpeed(inputs: Inputs.BabylonCamera.PositionDto): number {
        return inputs.camera.speed;
    }

    /**
     * Sets the near clipping distance of a camera: anything closer than `minZ` scene units is not
     * drawn. Too small a value costs depth precision on large scenes.
     * @param inputs - The camera and the near distance
     * @group set
     * @shortname set camera min z
     */
    setMinZ(inputs: Inputs.BabylonCamera.MinZDto): void {
        inputs.camera.minZ = inputs.minZ;
    }

    /**
     * Sets the far clipping distance of a camera: anything farther than `maxZ` scene units is not
     * drawn.
     * @param inputs - The camera and the far distance
     * @group set
     * @shortname camera max z
     */
    setMaxZ(inputs: Inputs.BabylonCamera.MaxZDto): void {
        inputs.camera.maxZ = inputs.maxZ;
    }

    /**
     * Switches a camera to orthographic projection, where objects keep their size whatever their
     * distance, as in technical drawings.
     *
     * The four `ortho` values are the edges of the view in scene units; a 0 falls back to the
     * default of 1 unit each way.
     * @param inputs - The camera and the four edges of the orthographic view
     * @group adjust
     * @shortname enable orthographic mode
     * @example
     * ```typescript
     * bitbybit.babylon.camera.makeCameraOrthographic({ camera, orthoLeft: -20, orthoRight: 20, orthoBottom: -10, orthoTop: 10 });
     * ```
     */
    makeCameraOrthographic(inputs: Inputs.BabylonCamera.OrthographicDto): void {
        inputs.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        inputs.camera.orthoBottom = inputs.orthoBottom || -1;
        inputs.camera.orthoTop = inputs.orthoTop || 1;
        inputs.camera.orthoLeft = inputs.orthoLeft || -1;
        inputs.camera.orthoRight = inputs.orthoRight || 1;
    }


    /**
     * Switches a camera back to perspective projection, where distant objects look smaller, the
     * default for cameras.
     * @param inputs - The camera
     * @group adjust
     * @shortname enable perspective mode
     */
    makeCameraPerspective(inputs: Inputs.BabylonCamera.CameraDto): void {
        inputs.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    }
    
}
