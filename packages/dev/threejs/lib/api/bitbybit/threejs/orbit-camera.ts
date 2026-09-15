import * as THREEJS from "three";
import { Context } from "../../context";
import * as Inputs from "../../inputs";
import { OrbitCameraInstance, InputHandler, OrbitCameraController } from "../../inputs/threejs-camera-inputs";

export type { OrbitCameraInstance, InputHandler, OrbitCameraController };

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

interface OrbitCameraState {
    _modelsAabb: THREEJS.Box3;
    _pivotPoint: THREEJS.Vector3;
    _targetPivotPoint: THREEJS.Vector3;
    _lastFramePivotPoint: THREEJS.Vector3;
    _yaw: number;
    _pitch: number;
    _distance: number;
    _targetYaw: number;
    _targetPitch: number;
    _targetDistance: number;
    _autoRenderDefault: boolean;
}

interface OrbitCameraConfig {
    autoRender: boolean;
    distanceMax: number;
    distanceMin: number;
    pitchAngleMax: number;
    pitchAngleMin: number;
    inertiaFactor: number;
    enableDamping: boolean;
    dampingFactor: number;
    focusObject: THREEJS.Object3D | null;
    frameOnStart: boolean;
}

/**
 * The orbiting camera for Three.js: it looks at a pivot point from a distance and turns around it
 * with `yaw` around the vertical axis and `pitch` up or down, both in degrees. The controller it
 * gives back carries the camera and its input handlers; the methods here move the pivot, frame an
 * object, reset the view and fence the distance and pitch.
 */
export class ThreeJSOrbitCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates an orbit camera that circles `pivotPoint` at `distance`, placed by `yaw` and `pitch`
     * in degrees, with mouse, touch and keyboard controls attached to `domElement` or the page.
     *
     * The limits fence how far it can zoom and tilt, damping and inertia smooth its motion, and
     * with `focusObject` and `frameOnStart` it starts framed on that object.
     * @param inputs - The pivot, distance, angles, limits, sensitivities, smoothing and start options
     * @returns The orbit camera controller holding the camera and its input handlers
     * @group create
     * @shortname new orbit camera
     * @example
     * ```typescript
     * const orbit = bitbybit.three.camera.orbitCamera.create({ pivotPoint: [0, 0, 0], distance: 20, pitch: 30, yaw: 45, distanceMin: 0.1, distanceMax: 1000, pitchAngleMin: -90, pitchAngleMax: 90, orbitSensitivity: 0.3, distanceSensitivity: 0.15, panSensitivity: 1, inertiaFactor: 0.1, autoRender: true, frameOnStart: true, enableDamping: true, dampingFactor: 0.1 });
     * ```
     */
    create(inputs: Inputs.ThreeJSCamera.OrbitCameraDto): OrbitCameraController {
        if (!this.context.scene) {
            throw new Error("Scene not initialized. Ensure context.scene is set first.");
        }

        const aspectRatio = typeof window !== "undefined" 
            ? window.innerWidth / window.innerHeight 
            : 1;

        const camera = new THREEJS.PerspectiveCamera(
            50,
            aspectRatio,
            0.1,
            10000
        );

        const orbitCamera = this.createOrbitCameraInstance(camera, {
            autoRender: inputs.autoRender,
            distanceMax: inputs.distanceMax,
            distanceMin: inputs.distanceMin,
            pitchAngleMax: inputs.pitchAngleMax,
            pitchAngleMin: inputs.pitchAngleMin,
            inertiaFactor: inputs.inertiaFactor,
            enableDamping: inputs.enableDamping,
            dampingFactor: inputs.dampingFactor,
            focusObject: inputs.focusObject || null,
            frameOnStart: inputs.frameOnStart
        });

        const pivotVec = new THREEJS.Vector3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        orbitCamera.pivotPoint = pivotVec;
        orbitCamera.distance = inputs.distance;
        orbitCamera.pitch = inputs.pitch;
        orbitCamera.yaw = inputs.yaw;

        orbitCamera.initializePivotPoint(pivotVec);

        const domElement = inputs.domElement || document.body;

        const mouseInput = this.createMouseInput(camera, orbitCamera, domElement, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity,
            panSensitivity: inputs.panSensitivity
        });

        const touchInput = this.createTouchInput(camera, orbitCamera, domElement, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity,
            panSensitivity: inputs.panSensitivity
        });

        const keyboardInput = this.createKeyboardInput(orbitCamera);

        const updateFn = (dt: number) => {
            orbitCamera.update(dt);
        };

        if (inputs.focusObject && inputs.frameOnStart) {
            orbitCamera.focus(inputs.focusObject);
        }

        return {
            orbitCamera,
            camera,
            mouseInput,
            touchInput,
            keyboardInput,
            update: updateFn,
            destroy: () => {
                mouseInput?.destroy();
                touchInput?.destroy();
                keyboardInput?.destroy();
            }
        };
    }

    /**
     * Moves the point an orbit camera looks at and circles around, keeping its distance and angles.
     * @param inputs - The orbit camera controller and the new pivot point
     * @group adjust
     * @shortname set pivot point
     * @example
     * ```typescript
     * bitbybit.three.camera.orbitCamera.setPivotPoint({ orbitCamera: orbit, pivotPoint: [0, 5, 0] });
     * ```
     */
    setPivotPoint(inputs: Inputs.ThreeJSCamera.PivotPointDto): void {
        const pivotVec = new THREEJS.Vector3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        inputs.orbitCamera.orbitCamera.pivotPoint = pivotVec;
    }

    /**
     * Reads the point an orbit camera looks at and circles around.
     * @param inputs - The orbit camera controller
     * @returns The pivot point
     * @group get
     * @shortname get pivot point
     */
    getPivotPoint(inputs: Inputs.ThreeJSCamera.PivotPointDto): Inputs.Base.Point3 {
        const pivot = inputs.orbitCamera.orbitCamera.pivotPoint;
        return [pivot.x, pivot.y, pivot.z];
    }

    /**
     * Turns an orbit camera toward an object and backs off until the whole object fits the view,
     * with `padding` above 1 leaving space around it.
     * @param inputs - The orbit camera controller, the object and the padding factor
     * @group adjust
     * @shortname focus on object
     * @example
     * ```typescript
     * bitbybit.three.camera.orbitCamera.focusOnObject({ orbitCamera: orbit, object: drawn, padding: 1.5 });
     * ```
     */
    focusOnObject(inputs: Inputs.ThreeJSCamera.FocusObjectDto): void {
        inputs.orbitCamera.orbitCamera.focus(inputs.object, inputs.padding);
    }

    /**
     * Puts an orbit camera at the given `yaw` and `pitch` in degrees and `distance` from its pivot,
     * discarding whatever the user has done with it.
     * @param inputs - The orbit camera controller, the two angles and the distance
     * @group adjust
     * @shortname reset camera
     * @example
     * ```typescript
     * bitbybit.three.camera.orbitCamera.resetCamera({ orbitCamera: orbit, yaw: 45, pitch: 30, distance: 20 });
     * ```
     */
    resetCamera(inputs: Inputs.ThreeJSCamera.ResetCameraDto): void {
        inputs.orbitCamera.orbitCamera.reset(inputs.yaw, inputs.pitch, inputs.distance);
    }

    /**
     * Reads how far an orbit camera currently is from its pivot point, in scene units.
     * @param inputs - The orbit camera controller
     * @returns The distance
     * @group get
     * @shortname get distance
     */
    getDistance(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.distance;
    }

    /**
     * Moves an orbit camera to `distance` scene units from its pivot point, within its distance
     * limits; the angles in the same input are ignored.
     * @param inputs - The orbit camera controller and the distance
     * @group adjust
     * @shortname set distance
     */
    setDistance(inputs: Inputs.ThreeJSCamera.ResetCameraDto): void {
        inputs.orbitCamera.orbitCamera.distance = inputs.distance;
    }

    /**
     * Reads the angle an orbit camera has turned around the vertical axis, in degrees.
     * @param inputs - The orbit camera controller
     * @returns The yaw in degrees
     * @group get
     * @shortname get yaw
     */
    getYaw(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.yaw;
    }

    /**
     * Reads how far an orbit camera looks up or down, in degrees; 0 is level, positive looks down
     * from above.
     * @param inputs - The orbit camera controller
     * @returns The pitch in degrees
     * @group get
     * @shortname get pitch
     */
    getPitch(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.pitch;
    }

    /**
     * Fences how close to and how far from its pivot an orbit camera may zoom, in scene units.
     * @param inputs - The orbit camera controller and the minimum and maximum distance
     * @group adjust
     * @shortname set distance limits
     * @example
     * ```typescript
     * bitbybit.three.camera.orbitCamera.setDistanceLimits({ orbitCamera: orbit, min: 5, max: 100 });
     * ```
     */
    setDistanceLimits(inputs: Inputs.ThreeJSCamera.SetDistanceLimitsDto): void {
        inputs.orbitCamera.orbitCamera.distanceMin = inputs.min;
        inputs.orbitCamera.orbitCamera.distanceMax = inputs.max;
    }

    /**
     * Fences how far up and down an orbit camera may tilt, in degrees, so it cannot go below the
     * ground or over the top.
     * @param inputs - The orbit camera controller and the minimum and maximum pitch
     * @group adjust
     * @shortname set pitch limits
     * @example
     * ```typescript
     * bitbybit.three.camera.orbitCamera.setPitchLimits({ orbitCamera: orbit, min: 0, max: 89 });
     * ```
     */
    setPitchLimits(inputs: Inputs.ThreeJSCamera.SetPitchLimitsDto): void {
        inputs.orbitCamera.orbitCamera.pitchAngleMin = inputs.min;
        inputs.orbitCamera.orbitCamera.pitchAngleMax = inputs.max;
    }

    private createOrbitCameraInstance(camera: THREEJS.PerspectiveCamera, config: OrbitCameraConfig): OrbitCameraInstance {
        const state: OrbitCameraState = {
            _modelsAabb: new THREEJS.Box3(),
            _pivotPoint: new THREEJS.Vector3(),
            _targetPivotPoint: new THREEJS.Vector3(),
            _lastFramePivotPoint: new THREEJS.Vector3(),
            _yaw: 0,
            _pitch: 0,
            _distance: 0,
            _targetYaw: 0,
            _targetPitch: 0,
            _targetDistance: 0,
            _autoRenderDefault: true
        };

        const distanceBetween = new THREEJS.Vector3();

        const updatePosition = (): void => {
            const phi = (90 - state._pitch) * DEG_TO_RAD;
            const theta = state._yaw * DEG_TO_RAD;

            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            const x = state._distance * sinPhi * sinTheta;
            const y = state._distance * cosPhi;
            const z = state._distance * sinPhi * cosTheta;

            camera.position.set(
                state._pivotPoint.x + x,
                state._pivotPoint.y + y,
                state._pivotPoint.z + z
            );

            camera.lookAt(state._pivotPoint);
        };

        const removeInertia = (): void => {
            state._yaw = state._targetYaw;
            state._pitch = state._targetPitch;
            state._distance = state._targetDistance;
            state._pivotPoint.copy(state._targetPivotPoint);
        };

        const buildAabb = (object: THREEJS.Object3D): void => {
            state._modelsAabb.setFromObject(object);
        };

        const lerp = (start: number, end: number, t: number): number => {
            return start + (end - start) * t;
        };

        return {
            autoRender: config.autoRender,
            distanceMax: config.distanceMax,
            distanceMin: config.distanceMin,
            pitchAngleMax: config.pitchAngleMax,
            pitchAngleMin: config.pitchAngleMin,
            inertiaFactor: config.inertiaFactor,
            enableDamping: config.enableDamping,
            dampingFactor: config.dampingFactor,
            focusObject: config.focusObject,
            frameOnStart: config.frameOnStart,

            get distance(): number {
                return state._targetDistance;
            },
            set distance(value: number) {
                state._targetDistance = Math.max(this.distanceMin, Math.min(this.distanceMax, value));
            },

            get pitch(): number {
                return state._targetPitch;
            },
            set pitch(value: number) {
                const safeMin = Math.max(this.pitchAngleMin, -89.9);
                const safeMax = Math.min(this.pitchAngleMax, 89.9);
                state._targetPitch = Math.max(safeMin, Math.min(safeMax, value));
            },

            get yaw(): number {
                return state._targetYaw;
            },
            set yaw(value: number) {
                state._targetYaw = value;
                const diff = state._targetYaw - state._yaw;
                const remainder = diff % 360;
                if (remainder > 180) {
                    state._yaw += 360;
                } else if (remainder < -180) {
                    state._yaw -= 360;
                }
            },

            get pivotPoint(): THREEJS.Vector3 {
                return state._targetPivotPoint;
            },
            set pivotPoint(value: THREEJS.Vector3) {
                state._targetPivotPoint.copy(value);
            },

            focus(focusObject: THREEJS.Object3D, padding = 1.5): void {
                buildAabb(focusObject);
                
                if (state._modelsAabb.isEmpty()) {
                    return;
                }

                const center = new THREEJS.Vector3();
                state._modelsAabb.getCenter(center);
                
                const size = new THREEJS.Vector3();
                state._modelsAabb.getSize(size);
                
                const maxDim = Math.max(size.x, size.y, size.z);
                const fov = camera.fov * DEG_TO_RAD;
                let distance = maxDim / (2 * Math.tan(fov / 2));
                distance *= padding;
                
                this.distance = distance;
                state._targetPivotPoint.copy(center);
                removeInertia();
                updatePosition();
            },

            resetAndLookAtPoint(resetPoint: THREEJS.Vector3, lookAtPoint: THREEJS.Vector3): void {
                state._targetPivotPoint.copy(lookAtPoint);
                camera.position.copy(resetPoint);
                camera.lookAt(lookAtPoint);

                distanceBetween.subVectors(lookAtPoint, resetPoint);
                this.distance = distanceBetween.length();
                
                const direction = new THREEJS.Vector3();
                direction.subVectors(resetPoint, lookAtPoint).normalize();
                
                this.yaw = Math.atan2(direction.x, direction.z) * RAD_TO_DEG;
                this.pitch = Math.asin(direction.y) * RAD_TO_DEG;

                removeInertia();
                updatePosition();
            },

            resetAndLookAtObject(resetPoint: THREEJS.Vector3, object: THREEJS.Object3D): void {
                buildAabb(object);
                const center = new THREEJS.Vector3();
                state._modelsAabb.getCenter(center);
                this.resetAndLookAtPoint(resetPoint, center);
            },

            reset(yaw: number, pitch: number, distance: number): void {
                this.pitch = pitch;
                this.yaw = yaw;
                this.distance = distance;
                removeInertia();
                updatePosition();
            },

            update(dt: number): void {
                const t = config.enableDamping 
                    ? (config.dampingFactor === 0 ? 1 : Math.min(dt / (config.inertiaFactor || 0.1), 1))
                    : 1;
                
                state._distance = lerp(state._distance, state._targetDistance, t);
                state._yaw = lerp(state._yaw, state._targetYaw, t);
                state._pitch = lerp(state._pitch, state._targetPitch, t);
                state._pivotPoint.lerp(state._targetPivotPoint, t);

                updatePosition();
            },

            initializePivotPoint(point: THREEJS.Vector3): void {
                state._pivotPoint.copy(point);
            }
        };
    }

    private createMouseInput(
        camera: THREEJS.PerspectiveCamera,
        orbitCamera: OrbitCameraInstance,
        domElement: HTMLElement,
        options: { orbitSensitivity: number; distanceSensitivity: number; panSensitivity: number }
    ): InputHandler | null {
        let lookButtonDown = false;
        let panButtonDown = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        const panVector = new THREEJS.Vector3();

        const pan = (deltaX: number, deltaY: number): void => {
            const right = new THREEJS.Vector3();
            const up = new THREEJS.Vector3();
            camera.matrix.extractBasis(right, up, new THREEJS.Vector3());

            const panScale = orbitCamera.distance * 0.001 * options.panSensitivity;

            panVector.set(0, 0, 0);
            panVector.addScaledVector(right, -deltaX * panScale);
            panVector.addScaledVector(up, deltaY * panScale);

            orbitCamera.pivotPoint.add(panVector);
        };

        const onMouseDown = (event: MouseEvent): void => {
            event.preventDefault();
            switch (event.button) {
                case 0:
                    lookButtonDown = true;
                    break;
                case 1:
                case 2:
                    panButtonDown = true;
                    break;
            }
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        };

        const onMouseUp = (event: MouseEvent): void => {
            switch (event.button) {
                case 0:
                    lookButtonDown = false;
                    break;
                case 1:
                case 2:
                    panButtonDown = false;
                    break;
            }
        };

        const onMouseMove = (event: MouseEvent): void => {
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;

            if (lookButtonDown) {
                orbitCamera.pitch += deltaY * options.orbitSensitivity;
                orbitCamera.yaw -= deltaX * options.orbitSensitivity;
            } else if (panButtonDown) {
                pan(deltaX, deltaY);
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        };

        const onMouseWheel = (event: WheelEvent): void => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 1 : -1;
            orbitCamera.distance += delta * options.distanceSensitivity * orbitCamera.distance * 0.1;
        };

        const onMouseOut = (): void => {
            lookButtonDown = false;
            panButtonDown = false;
        };

        const onContextMenu = (event: Event): void => {
            event.preventDefault();
        };

        domElement.addEventListener("mousedown", onMouseDown);
        domElement.addEventListener("mouseup", onMouseUp);
        domElement.addEventListener("mousemove", onMouseMove);
        domElement.addEventListener("wheel", onMouseWheel, { passive: false });
        domElement.addEventListener("mouseout", onMouseOut);
        domElement.addEventListener("contextmenu", onContextMenu);

        return {
            destroy: () => {
                domElement.removeEventListener("mousedown", onMouseDown);
                domElement.removeEventListener("mouseup", onMouseUp);
                domElement.removeEventListener("mousemove", onMouseMove);
                domElement.removeEventListener("wheel", onMouseWheel);
                domElement.removeEventListener("mouseout", onMouseOut);
                domElement.removeEventListener("contextmenu", onContextMenu);
            }
        };
    }

    private createTouchInput(
        camera: THREEJS.PerspectiveCamera,
        orbitCamera: OrbitCameraInstance,
        domElement: HTMLElement,
        options: { orbitSensitivity: number; distanceSensitivity: number; panSensitivity: number }
    ): InputHandler | null {
        let lastTouchX = 0;
        let lastTouchY = 0;
        let lastPinchDistance = 0;
        let lastPinchMidX = 0;
        let lastPinchMidY = 0;

        const panVector = new THREEJS.Vector3();

        const getPinchDistance = (touch1: Touch, touch2: Touch): number => {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const getPinchMidpoint = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
            return {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
        };

        const pan = (deltaX: number, deltaY: number): void => {
            const right = new THREEJS.Vector3();
            const up = new THREEJS.Vector3();
            camera.matrix.extractBasis(right, up, new THREEJS.Vector3());

            const panScale = orbitCamera.distance * 0.002 * options.panSensitivity;

            panVector.set(0, 0, 0);
            panVector.addScaledVector(right, -deltaX * panScale);
            panVector.addScaledVector(up, deltaY * panScale);

            orbitCamera.pivotPoint.add(panVector);
        };

        const onTouchStart = (event: TouchEvent): void => {
            event.preventDefault();
            const touches = event.touches;

            if (touches.length === 1) {
                lastTouchX = touches[0]!.clientX;
                lastTouchY = touches[0]!.clientY;
            } else if (touches.length === 2) {
                lastPinchDistance = getPinchDistance(touches[0]!, touches[1]!);
                const mid = getPinchMidpoint(touches[0]!, touches[1]!);
                lastPinchMidX = mid.x;
                lastPinchMidY = mid.y;
            }
        };

        const onTouchEnd = (event: TouchEvent): void => {
            const touches = event.touches;
            if (touches.length === 1) {
                lastTouchX = touches[0]!.clientX;
                lastTouchY = touches[0]!.clientY;
            } else if (touches.length === 2) {
                lastPinchDistance = getPinchDistance(touches[0]!, touches[1]!);
                const mid = getPinchMidpoint(touches[0]!, touches[1]!);
                lastPinchMidX = mid.x;
                lastPinchMidY = mid.y;
            }
        };

        const onTouchMove = (event: TouchEvent): void => {
            event.preventDefault();
            const touches = event.touches;

            if (touches.length === 1) {
                const deltaX = touches[0]!.clientX - lastTouchX;
                const deltaY = touches[0]!.clientY - lastTouchY;

                orbitCamera.pitch += deltaY * options.orbitSensitivity;
                orbitCamera.yaw -= deltaX * options.orbitSensitivity;

                lastTouchX = touches[0]!.clientX;
                lastTouchY = touches[0]!.clientY;
            } else if (touches.length === 2) {
                const currentPinchDistance = getPinchDistance(touches[0]!, touches[1]!);
                const pinchDelta = currentPinchDistance - lastPinchDistance;
                orbitCamera.distance -= pinchDelta * options.distanceSensitivity * 0.1 * (orbitCamera.distance * 0.1);
                lastPinchDistance = currentPinchDistance;

                const mid = getPinchMidpoint(touches[0]!, touches[1]!);
                const deltaX = mid.x - lastPinchMidX;
                const deltaY = mid.y - lastPinchMidY;
                pan(deltaX, deltaY);
                lastPinchMidX = mid.x;
                lastPinchMidY = mid.y;
            }
        };

        domElement.addEventListener("touchstart", onTouchStart, { passive: false });
        domElement.addEventListener("touchend", onTouchEnd);
        domElement.addEventListener("touchcancel", onTouchEnd);
        domElement.addEventListener("touchmove", onTouchMove, { passive: false });

        return {
            destroy: () => {
                domElement.removeEventListener("touchstart", onTouchStart);
                domElement.removeEventListener("touchend", onTouchEnd);
                domElement.removeEventListener("touchcancel", onTouchEnd);
                domElement.removeEventListener("touchmove", onTouchMove);
            }
        };
    }

    private createKeyboardInput(
        orbitCamera: OrbitCameraInstance
    ): InputHandler | null {
        const onKeyDown = (event: KeyboardEvent): void => {
            switch (event.key) {
                case "ArrowLeft":
                    orbitCamera.yaw -= 2;
                    break;
                case "ArrowRight":
                    orbitCamera.yaw += 2;
                    break;
                case "ArrowUp":
                    if (event.shiftKey) {
                        orbitCamera.distance *= 0.95;
                    } else {
                        orbitCamera.pitch += 2;
                    }
                    break;
                case "ArrowDown":
                    if (event.shiftKey) {
                        orbitCamera.distance *= 1.05;
                    } else {
                        orbitCamera.pitch -= 2;
                    }
                    break;
            }
        };

        const win = typeof window !== "undefined" ? window : null;
        if (win) {
            win.addEventListener("keydown", onKeyDown);
        }

        return {
            destroy: () => {
                if (win) {
                    win.removeEventListener("keydown", onKeyDown);
                }
            }
        };
    }
}

/**
 * Standalone function to create an orbit camera without requiring a BitByBit context.
 * This is useful for the initThreeJS helper function.
 * 
 * @param inputs Configuration options including scene and domElement
 * @returns Orbit camera controller instance
 */
export function createOrbitCamera(inputs: Inputs.ThreeJSCamera.OrbitCameraDto & { scene: THREEJS.Scene; domElement?: HTMLElement }): OrbitCameraController {
    const minimalContext = {
        scene: inputs.scene
    } as Context;

    const orbitCameraClass = new ThreeJSOrbitCamera(minimalContext);
    return orbitCameraClass.create(inputs);
}
