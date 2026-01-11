import * as THREEJS from "three";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";
import { OrbitCameraInstance, InputHandler, OrbitCameraController } from "../../inputs/threejs-camera-inputs";

// Re-export for backwards compatibility
export { OrbitCameraInstance, InputHandler, OrbitCameraController };

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

export class ThreeJSOrbitCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates an orbit camera controller that allows rotating around a pivot point. This camera is suitable for 3D object inspection and scene navigation.
     * @param inputs Describes the orbit camera configuration
     * @returns Orbit camera controller instance with mouse, touch, and keyboard input handlers
     * @group create
     * @shortname new orbit camera
     */
    create(inputs: Inputs.ThreeJSCamera.OrbitCameraDto): OrbitCameraController {
        if (!this.context.scene) {
            throw new Error("Scene not initialized. Ensure context.scene is set first.");
        }

        // Get aspect ratio - fallback to 1 if window is not available
        const aspectRatio = typeof window !== "undefined" 
            ? window.innerWidth / window.innerHeight 
            : 1;

        // Create camera
        const camera = new THREEJS.PerspectiveCamera(
            50,
            aspectRatio,
            0.1,
            10000
        );

        // Create orbit camera with configuration
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

        // Set initial position
        const pivotVec = new THREEJS.Vector3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        orbitCamera.pivotPoint = pivotVec;
        orbitCamera.distance = inputs.distance;
        orbitCamera.pitch = inputs.pitch;
        orbitCamera.yaw = inputs.yaw;

        // Initialize the current pivot point to match the target (no inertia on start)
        orbitCamera.initializePivotPoint(pivotVec);

        // Get DOM element for event listeners
        const domElement = inputs.domElement || document.body;

        // Setup mouse input
        const mouseInput = this.createMouseInput(camera, orbitCamera, domElement, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity,
            panSensitivity: inputs.panSensitivity
        });

        // Setup touch input
        const touchInput = this.createTouchInput(camera, orbitCamera, domElement, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity,
            panSensitivity: inputs.panSensitivity
        });

        // Setup keyboard input for panning with arrow keys
        const keyboardInput = this.createKeyboardInput(orbitCamera);

        // Update function for animation loop
        const updateFn = (dt: number) => {
            orbitCamera.update(dt);
        };

        // Focus on object if provided
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
     * Sets the pivot point of the orbit camera
     * @param inputs Orbit camera and pivot point
     * @group adjust
     * @shortname set pivot point
     */
    setPivotPoint(inputs: Inputs.ThreeJSCamera.PivotPointDto): void {
        const pivotVec = new THREEJS.Vector3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        inputs.orbitCamera.orbitCamera.pivotPoint = pivotVec;
    }

    /**
     * Gets the pivot point of the orbit camera
     * @param inputs Orbit camera instance
     * @returns Pivot point as [x, y, z]
     * @group get
     * @shortname get pivot point
     */
    getPivotPoint(inputs: Inputs.ThreeJSCamera.PivotPointDto): Inputs.Base.Point3 {
        const pivot = inputs.orbitCamera.orbitCamera.pivotPoint;
        return [pivot.x, pivot.y, pivot.z];
    }

    /**
     * Focus the camera on an object, adjusting distance to frame it properly
     * @param inputs Orbit camera and object to focus on
     * @group adjust
     * @shortname focus on object
     */
    focusOnObject(inputs: Inputs.ThreeJSCamera.FocusObjectDto): void {
        inputs.orbitCamera.orbitCamera.focus(inputs.object, inputs.padding);
    }

    /**
     * Reset camera to specific yaw, pitch and distance
     * @param inputs Orbit camera and reset parameters
     * @group adjust
     * @shortname reset camera
     */
    resetCamera(inputs: Inputs.ThreeJSCamera.ResetCameraDto): void {
        inputs.orbitCamera.orbitCamera.reset(inputs.yaw, inputs.pitch, inputs.distance);
    }

    /**
     * Gets the current distance from pivot point
     * @param inputs Orbit camera controller
     * @returns Current distance
     * @group get
     * @shortname get distance
     */
    getDistance(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.distance;
    }

    /**
     * Sets the distance from pivot point
     * @param inputs Orbit camera controller and distance
     * @group adjust
     * @shortname set distance
     */
    setDistance(inputs: Inputs.ThreeJSCamera.ResetCameraDto): void {
        inputs.orbitCamera.orbitCamera.distance = inputs.distance;
    }

    /**
     * Gets the current yaw angle in degrees
     * @param inputs Orbit camera controller
     * @returns Current yaw angle
     * @group get
     * @shortname get yaw
     */
    getYaw(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.yaw;
    }

    /**
     * Gets the current pitch angle in degrees
     * @param inputs Orbit camera controller
     * @returns Current pitch angle
     * @group get
     * @shortname get pitch
     */
    getPitch(inputs: Inputs.ThreeJSCamera.OrbitCameraControllerDto): number {
        return inputs.orbitCamera.orbitCamera.pitch;
    }

    /**
     * Sets distance limits for the orbit camera
     * @param inputs Orbit camera and min/max distance
     * @group adjust
     * @shortname set distance limits
     */
    setDistanceLimits(inputs: Inputs.ThreeJSCamera.SetDistanceLimitsDto): void {
        inputs.orbitCamera.orbitCamera.distanceMin = inputs.min;
        inputs.orbitCamera.orbitCamera.distanceMax = inputs.max;
    }

    /**
     * Sets pitch angle limits for the orbit camera
     * @param inputs Orbit camera and min/max pitch angles
     * @group adjust
     * @shortname set pitch limits
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
            // Convert spherical coordinates to cartesian
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
                // Clamp distance using current instance limits
                state._targetDistance = Math.max(this.distanceMin, Math.min(this.distanceMax, value));
            },

            get pitch(): number {
                return state._targetPitch;
            },
            set pitch(value: number) {
                // Clamp pitch using current instance limits, avoiding gimbal lock
                const safeMin = Math.max(this.pitchAngleMin, -89.9);
                const safeMax = Math.min(this.pitchAngleMax, 89.9);
                state._targetPitch = Math.max(safeMin, Math.min(safeMax, value));
            },

            get yaw(): number {
                return state._targetYaw;
            },
            set yaw(value: number) {
                state._targetYaw = value;
                // Handle wrap-around for smooth rotation
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
                
                // Calculate yaw and pitch from camera orientation
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
            // Get camera's right and up vectors
            const right = new THREEJS.Vector3();
            const up = new THREEJS.Vector3();
            camera.matrix.extractBasis(right, up, new THREEJS.Vector3());

            // Calculate pan amount based on distance from pivot
            const panScale = orbitCamera.distance * 0.001 * options.panSensitivity;

            panVector.set(0, 0, 0);
            panVector.addScaledVector(right, -deltaX * panScale);
            panVector.addScaledVector(up, deltaY * panScale);

            orbitCamera.pivotPoint.add(panVector);
        };

        const onMouseDown = (event: MouseEvent): void => {
            event.preventDefault();
            switch (event.button) {
                case 0: // Left button
                    lookButtonDown = true;
                    break;
                case 1: // Middle button
                case 2: // Right button
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
                lastTouchX = touches[0].clientX;
                lastTouchY = touches[0].clientY;
            } else if (touches.length === 2) {
                lastPinchDistance = getPinchDistance(touches[0], touches[1]);
                const mid = getPinchMidpoint(touches[0], touches[1]);
                lastPinchMidX = mid.x;
                lastPinchMidY = mid.y;
            }
        };

        const onTouchEnd = (event: TouchEvent): void => {
            const touches = event.touches;
            if (touches.length === 1) {
                lastTouchX = touches[0].clientX;
                lastTouchY = touches[0].clientY;
            } else if (touches.length === 2) {
                lastPinchDistance = getPinchDistance(touches[0], touches[1]);
                const mid = getPinchMidpoint(touches[0], touches[1]);
                lastPinchMidX = mid.x;
                lastPinchMidY = mid.y;
            }
        };

        const onTouchMove = (event: TouchEvent): void => {
            event.preventDefault();
            const touches = event.touches;

            if (touches.length === 1) {
                const deltaX = touches[0].clientX - lastTouchX;
                const deltaY = touches[0].clientY - lastTouchY;

                orbitCamera.pitch += deltaY * options.orbitSensitivity;
                orbitCamera.yaw -= deltaX * options.orbitSensitivity;

                lastTouchX = touches[0].clientX;
                lastTouchY = touches[0].clientY;
            } else if (touches.length === 2) {
                // Pinch to zoom
                const currentPinchDistance = getPinchDistance(touches[0], touches[1]);
                const pinchDelta = currentPinchDistance - lastPinchDistance;
                orbitCamera.distance -= pinchDelta * options.distanceSensitivity * 0.1 * (orbitCamera.distance * 0.1);
                lastPinchDistance = currentPinchDistance;

                // Two-finger pan
                const mid = getPinchMidpoint(touches[0], touches[1]);
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
            // Only handle if the domElement or document has focus
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

        // Use the global window object if available (browser environment)
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
