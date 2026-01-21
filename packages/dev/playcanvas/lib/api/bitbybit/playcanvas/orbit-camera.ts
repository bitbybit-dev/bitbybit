import * as pc from "playcanvas";
import { Context } from "../../context";
import * as Inputs from "../../inputs";

interface OrbitCameraInstance {
    autoRender: boolean;
    distanceMax: number;
    distanceMin: number;
    pitchAngleMax: number;
    pitchAngleMin: number;
    inertiaFactor: number;
    focusEntity: pc.Entity | null;
    frameOnStart: boolean;
    distance: number;
    pitch: number;
    yaw: number;
    pivotPoint: pc.Vec3;
    focus(focusEntity: pc.Entity): void;
    resetAndLookAtPoint(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3): void;
    resetAndLookAtEntity(resetPoint: pc.Vec3, entity: pc.Entity): void;
    reset(yaw: number, pitch: number, distance: number): void;
    update(dt: number): void;
}

interface InputHandler {
    destroy(): void;
}

interface OrbitCameraController {
    orbitCamera: OrbitCameraInstance;
    cameraEntity: pc.Entity;
    mouseInput: InputHandler | null;
    touchInput: InputHandler | null;
    update: (dt: number) => void;
    destroy: () => void;
}

interface OrbitCameraState {
    _modelsAabb: pc.BoundingBox;
    _pivotPoint: pc.Vec3;
    _targetPivotPoint: pc.Vec3;
    _lastFramePivotPoint: pc.Vec3;
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
    focusEntity: pc.Entity | null;
    frameOnStart: boolean;
}

export class PlayCanvasOrbitCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates an orbit camera controller that allows rotating around a pivot point. This camera is suitable for 3D object inspection and scene navigation.
     * @param inputs Describes the orbit camera configuration
     * @returns Orbit camera controller instance with mouse and touch input handlers
     * @group create
     * @shortname new orbit camera
     */
    create(inputs: Inputs.PlayCanvasCamera.OrbitCameraDto): OrbitCameraController {
        if (!this.context.app) {
            throw new Error("App not initialized. Call init() first.");
        }

        // Find or create camera entity
        let cameraEntity: pc.Entity;
        if (inputs.focusEntity) {
            // Use existing camera if found in scene
            cameraEntity = this.context.scene.findOne((node: pc.GraphNode) => 
                node instanceof pc.Entity && node.camera !== undefined && node.camera !== null
            ) as pc.Entity;
        }
        
        if (!cameraEntity) {
            // Create new camera entity
            cameraEntity = new pc.Entity("OrbitCamera");
            cameraEntity.addComponent("camera", {
                clearColor: new pc.Color(0.1, 0.1, 0.1),
                farClip: 10000,
                nearClip: 0.1
            });
            this.context.scene.addChild(cameraEntity);
        }

        // Create orbit camera with configuration
        const orbitCamera = this.createOrbitCameraInstance(cameraEntity, {
            autoRender: inputs.autoRender,
            distanceMax: inputs.distanceMax,
            distanceMin: inputs.distanceMin,
            pitchAngleMax: inputs.pitchAngleMax,
            pitchAngleMin: inputs.pitchAngleMin,
            inertiaFactor: inputs.inertiaFactor,
            focusEntity: inputs.focusEntity || null,
            frameOnStart: inputs.frameOnStart
        });

        // Set initial position
        const pivotVec = new pc.Vec3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        orbitCamera.pivotPoint = pivotVec;
        orbitCamera.distance = inputs.distance;
        orbitCamera.pitch = inputs.pitch;
        orbitCamera.yaw = inputs.yaw;

        // Initialize the current pivot point to match the target (no inertia on start)
        const state = orbitCamera as any;
        if (state._pivotPoint) {
            state._pivotPoint.copy(pivotVec);
        }

        // Setup mouse input
        const mouseInput = this.createMouseInput(cameraEntity, orbitCamera, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity
        });

        // Setup touch input
        const touchInput = this.createTouchInput(cameraEntity, orbitCamera, {
            orbitSensitivity: inputs.orbitSensitivity,
            distanceSensitivity: inputs.distanceSensitivity
        });

        // Register update function
        const updateFn = (dt: number) => {
            orbitCamera.update(dt);
        };
        this.context.app.on("update", updateFn);

        // Focus on entity if provided
        if (inputs.focusEntity && inputs.frameOnStart) {
            orbitCamera.focus(inputs.focusEntity);
        }

        return {
            orbitCamera,
            cameraEntity,
            mouseInput,
            touchInput,
            update: updateFn,
            destroy: () => {
                this.context.app?.off("update", updateFn);
                mouseInput?.destroy();
                touchInput?.destroy();
            }
        };
    }

    /**
     * Sets the pivot point of the orbit camera
     * @param inputs Orbit camera and pivot point
     * @group adjust
     * @shortname set pivot point
     */
    setPivotPoint(inputs: Inputs.PlayCanvasCamera.PivotPointDto): void {
        const pivotVec = new pc.Vec3(inputs.pivotPoint[0], inputs.pivotPoint[1], inputs.pivotPoint[2]);
        inputs.orbitCamera.orbitCamera.pivotPoint = pivotVec;
    }

    /**
     * Gets the pivot point of the orbit camera
     * @param inputs Orbit camera instance
     * @returns Pivot point as [x, y, z]
     * @group get
     * @shortname get pivot point
     */
    getPivotPoint(inputs: Inputs.PlayCanvasCamera.PivotPointDto): Inputs.Base.Point3 {
        const pivot = inputs.orbitCamera.orbitCamera.pivotPoint;
        return [pivot.x, pivot.y, pivot.z];
    }

    /**
     * Focus the camera on an entity, adjusting distance to frame it properly
     * @param inputs Orbit camera and entity to focus on
     * @group adjust
     * @shortname focus on entity
     */
    focusOnEntity(inputs: Inputs.PlayCanvasCamera.FocusEntityDto): void {
        inputs.orbitCamera.orbitCamera.focus(inputs.entity);
    }

    /**
     * Reset camera to specific yaw, pitch and distance
     * @param inputs Orbit camera and reset parameters
     * @group adjust
     * @shortname reset camera
     */
    resetCamera(inputs: Inputs.PlayCanvasCamera.ResetCameraDto): void {
        inputs.orbitCamera.orbitCamera.reset(inputs.yaw, inputs.pitch, inputs.distance);
    }

    private createOrbitCameraInstance(entity: pc.Entity, config: OrbitCameraConfig): OrbitCameraInstance {
        const state: OrbitCameraState = {
            _modelsAabb: new pc.BoundingBox(),
            _pivotPoint: new pc.Vec3(),
            _targetPivotPoint: new pc.Vec3(),
            _lastFramePivotPoint: new pc.Vec3(),
            _yaw: 0,
            _pitch: 0,
            _distance: 0,
            _targetYaw: 0,
            _targetPitch: 0,
            _targetDistance: 0,
            _autoRenderDefault: true
        };

        const distanceBetween = new pc.Vec3();

        const clampDistance = (distance: number): number => {
            return Math.max(config.distanceMin, Math.min(config.distanceMax, distance));
        };

        const clampPitchAngle = (pitch: number): number => {
            return Math.max(config.pitchAngleMin, Math.min(config.pitchAngleMax, pitch));
        };

        const calcYaw = (quat: pc.Quat): number => {
            const transformedForward = new pc.Vec3();
            quat.transformVector(pc.Vec3.FORWARD, transformedForward);
            return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
        };

        const calcPitch = (quat: pc.Quat, yaw: number): number => {
            const quatWithoutYaw = new pc.Quat();
            const yawOffset = new pc.Quat();
            yawOffset.setFromEulerAngles(0, -yaw, 0);
            quatWithoutYaw.mul2(yawOffset, quat);

            const transformedForward = new pc.Vec3();
            quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

            return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
        };

        const updatePosition = (): void => {
            const quatYaw = new pc.Quat().setFromEulerAngles(0, state._yaw, 0);
            const quatPitch = new pc.Quat().setFromEulerAngles(-state._pitch, 0, 0);

            const finalQuat = new pc.Quat();
            finalQuat.mul2(quatYaw, quatPitch);

            const offsetPos = new pc.Vec3(0, 0, state._distance);
            finalQuat.transformVector(offsetPos, offsetPos);

            entity.setPosition(
                state._pivotPoint.x + offsetPos.x,
                state._pivotPoint.y + offsetPos.y,
                state._pivotPoint.z + offsetPos.z
            );
            entity.setRotation(finalQuat);
        };

        const removeInertia = (): void => {
            state._yaw = state._targetYaw;
            state._pitch = state._targetPitch;
            state._distance = state._targetDistance;
            state._pivotPoint.copy(state._targetPivotPoint);
        };

        const buildAabb = (entity: pc.Entity | pc.GraphNode, modelsAdded: number): number => {
            let count = modelsAdded;
            if (entity instanceof pc.Entity && entity.model) {
                const mi = entity.model.meshInstances;
                for (let i = 0; i < mi.length; i++) {
                    if (mi[i].visible) {
                        if (count === 0) {
                            state._modelsAabb.copy(mi[i].aabb);
                        } else {
                            state._modelsAabb.add(mi[i].aabb);
                        }
                        count += 1;
                    }
                }
            }
            
            const children = entity.children;
            for (let i = 0; i < children.length; i++) {
                count = buildAabb(children[i], count);
            }
            
            return count;
        };

        return {
            autoRender: config.autoRender,
            distanceMax: config.distanceMax,
            distanceMin: config.distanceMin,
            pitchAngleMax: config.pitchAngleMax,
            pitchAngleMin: config.pitchAngleMin,
            inertiaFactor: config.inertiaFactor,
            focusEntity: config.focusEntity,
            frameOnStart: config.frameOnStart,

            get distance(): number {
                return state._targetDistance;
            },
            set distance(value: number) {
                state._targetDistance = clampDistance(value);
            },

            get pitch(): number {
                return state._targetPitch;
            },
            set pitch(value: number) {
                state._targetPitch = clampPitchAngle(value);
            },

            get yaw(): number {
                return state._targetYaw;
            },
            set yaw(value: number) {
                state._targetYaw = value;
                const diff = state._targetYaw - state._yaw;
                const reminder = diff % 360;
                if (reminder > 180) {
                    state._yaw += 360;
                } else if (reminder < -180) {
                    state._yaw -= 360;
                }
            },

            get pivotPoint(): pc.Vec3 {
                return state._targetPivotPoint;
            },
            set pivotPoint(value: pc.Vec3) {
                state._targetPivotPoint.copy(value);
            },

            focus(focusEntity: pc.Entity): void {
                buildAabb(focusEntity, 0);
                const halfExtents = state._modelsAabb.halfExtents;
                let distance = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z));
                const camera = entity.camera;
                if (camera) {
                    distance = distance / Math.tan(0.5 * camera.fov * camera.aspectRatio * pc.math.DEG_TO_RAD);
                }
                distance = distance * 2;
                this.distance = distance;
                removeInertia();
                state._pivotPoint.copy(state._modelsAabb.center);
            },

            resetAndLookAtPoint(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3): void {
                this.pivotPoint.copy(lookAtPoint);
                entity.setPosition(resetPoint);
                entity.lookAt(lookAtPoint);

                distanceBetween.sub2(lookAtPoint, resetPoint);
                this.distance = distanceBetween.length();
                this.pivotPoint.copy(lookAtPoint);

                const cameraQuat = entity.getRotation();
                this.yaw = calcYaw(cameraQuat);
                this.pitch = calcPitch(cameraQuat, this.yaw);

                removeInertia();
                updatePosition();

                if (!config.autoRender && this.context.app) {
                    this.context.app.renderNextFrame = true;
                }
            },

            resetAndLookAtEntity(resetPoint: pc.Vec3, entity: pc.Entity): void {
                buildAabb(entity, 0);
                this.resetAndLookAtPoint(resetPoint, state._modelsAabb.center);
            },

            reset(yaw: number, pitch: number, distance: number): void {
                this.pitch = pitch;
                this.yaw = yaw;
                this.distance = distance;
                removeInertia();
                updatePosition();
            },

            update(dt: number): void {
                const t = config.inertiaFactor === 0 ? 1 : Math.min(dt / config.inertiaFactor, 1);
                state._distance = pc.math.lerp(state._distance, state._targetDistance, t);
                state._yaw = pc.math.lerp(state._yaw, state._targetYaw, t);
                state._pitch = pc.math.lerp(state._pitch, state._targetPitch, t);
                state._pivotPoint.lerp(state._pivotPoint, state._targetPivotPoint, t);

                updatePosition();
            }
        };
    }

    private createMouseInput(entity: pc.Entity, orbitCamera: OrbitCameraInstance, options: { orbitSensitivity: number; distanceSensitivity: number }): InputHandler | null {
        if (!this.context.app?.mouse) return null;

        const mouse = this.context.app.mouse;
        let lookButtonDown = false;
        let panButtonDown = false;
        const lastPoint = new pc.Vec2();

        const fromWorldPoint = new pc.Vec3();
        const toWorldPoint = new pc.Vec3();
        const worldDiff = new pc.Vec3();

        const pan = (screenPoint: { x: number; y: number }): void => {
            const camera = entity.camera;
            if (!camera) return;

            const distance = orbitCamera.distance;
            camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
            camera.screenToWorld(lastPoint.x, lastPoint.y, distance, toWorldPoint);
            worldDiff.sub2(toWorldPoint, fromWorldPoint);
            orbitCamera.pivotPoint.add(worldDiff);
        };

        const onMouseDown = (event: pc.MouseEvent): void => {
            switch (event.button) {
                case pc.MOUSEBUTTON_LEFT:
                    lookButtonDown = true;
                    break;
                case pc.MOUSEBUTTON_MIDDLE:
                case pc.MOUSEBUTTON_RIGHT:
                    panButtonDown = true;
                    break;
            }
        };

        const onMouseUp = (event: pc.MouseEvent): void => {
            switch (event.button) {
                case pc.MOUSEBUTTON_LEFT:
                    lookButtonDown = false;
                    break;
                case pc.MOUSEBUTTON_MIDDLE:
                case pc.MOUSEBUTTON_RIGHT:
                    panButtonDown = false;
                    break;
            }
        };

        const onMouseMove = (event: pc.MouseEvent): void => {
            if (lookButtonDown) {
                orbitCamera.pitch += event.dy * options.orbitSensitivity;
                orbitCamera.yaw -= event.dx * options.orbitSensitivity;
            } else if (panButtonDown) {
                pan(event);
            }
            lastPoint.set(event.x, event.y);
        };

        const onMouseWheel = (event: pc.MouseEvent): void => {
            orbitCamera.distance += event.wheelDelta * options.distanceSensitivity * (orbitCamera.distance * 0.1);
            event.event.preventDefault();
        };

        const onMouseOut = (): void => {
            lookButtonDown = false;
            panButtonDown = false;
        };

        mouse.on(pc.EVENT_MOUSEDOWN, onMouseDown);
        mouse.on(pc.EVENT_MOUSEUP, onMouseUp);
        mouse.on(pc.EVENT_MOUSEMOVE, onMouseMove);
        mouse.on(pc.EVENT_MOUSEWHEEL, onMouseWheel);
        window.addEventListener("mouseout", onMouseOut, false);
        mouse.disableContextMenu();

        return {
            destroy: () => {
                mouse.off(pc.EVENT_MOUSEDOWN, onMouseDown);
                mouse.off(pc.EVENT_MOUSEUP, onMouseUp);
                mouse.off(pc.EVENT_MOUSEMOVE, onMouseMove);
                mouse.off(pc.EVENT_MOUSEWHEEL, onMouseWheel);
                window.removeEventListener("mouseout", onMouseOut);
            }
        };
    }

    private createTouchInput(entity: pc.Entity, orbitCamera: OrbitCameraInstance, options: { orbitSensitivity: number; distanceSensitivity: number }): InputHandler | null {
        if (!this.context.app?.touch) return null;

        const touch = this.context.app.touch;
        const lastTouchPoint = new pc.Vec2();
        const lastPinchMidPoint = new pc.Vec2();
        let lastPinchDistance = 0;

        const fromWorldPoint = new pc.Vec3();
        const toWorldPoint = new pc.Vec3();
        const worldDiff = new pc.Vec3();
        const pinchMidPoint = new pc.Vec2();

        const getPinchDistance = (pointA: { x: number; y: number }, pointB: { x: number; y: number }): number => {
            const dx = pointA.x - pointB.x;
            const dy = pointA.y - pointB.y;
            return Math.sqrt((dx * dx) + (dy * dy));
        };

        const calcMidPoint = (pointA: { x: number; y: number }, pointB: { x: number; y: number }, result: pc.Vec2): void => {
            result.set(pointB.x - pointA.x, pointB.y - pointA.y);
            result.mulScalar(0.5);
            result.x += pointA.x;
            result.y += pointA.y;
        };

        const pan = (midPoint: pc.Vec2): void => {
            const camera = entity.camera;
            if (!camera) return;

            const distance = orbitCamera.distance;
            camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
            camera.screenToWorld(lastPinchMidPoint.x, lastPinchMidPoint.y, distance, toWorldPoint);
            worldDiff.sub2(toWorldPoint, fromWorldPoint);
            orbitCamera.pivotPoint.add(worldDiff);
        };

        const onTouchStartEndCancel = (event: pc.TouchEvent): void => {
            const touches = event.touches;
            if (touches.length === 1) {
                lastTouchPoint.set(touches[0].x, touches[0].y);
            } else if (touches.length === 2) {
                lastPinchDistance = getPinchDistance(touches[0], touches[1]);
                calcMidPoint(touches[0], touches[1], lastPinchMidPoint);
            }
        };

        const onTouchMove = (event: pc.TouchEvent): void => {
            const touches = event.touches;
            
            if (touches.length === 1) {
                const touchPoint = touches[0];
                orbitCamera.pitch += (touchPoint.y - lastTouchPoint.y) * options.orbitSensitivity;
                orbitCamera.yaw -= (touchPoint.x - lastTouchPoint.x) * options.orbitSensitivity;
                lastTouchPoint.set(touchPoint.x, touchPoint.y);
            } else if (touches.length === 2) {
                const currentPinchDistance = getPinchDistance(touches[0], touches[1]);
                const diffInPinchDistance = currentPinchDistance - lastPinchDistance;
                lastPinchDistance = currentPinchDistance;
                
                orbitCamera.distance += (diffInPinchDistance * options.distanceSensitivity * 0.1) * (orbitCamera.distance * 0.1);
                
                calcMidPoint(touches[0], touches[1], pinchMidPoint);
                pan(pinchMidPoint);
                lastPinchMidPoint.copy(pinchMidPoint);
            }
        };

        touch.on(pc.EVENT_TOUCHSTART, onTouchStartEndCancel);
        touch.on(pc.EVENT_TOUCHEND, onTouchStartEndCancel);
        touch.on(pc.EVENT_TOUCHCANCEL, onTouchStartEndCancel);
        touch.on(pc.EVENT_TOUCHMOVE, onTouchMove);

        return {
            destroy: () => {
                touch.off(pc.EVENT_TOUCHSTART, onTouchStartEndCancel);
                touch.off(pc.EVENT_TOUCHEND, onTouchStartEndCancel);
                touch.off(pc.EVENT_TOUCHCANCEL, onTouchStartEndCancel);
                touch.off(pc.EVENT_TOUCHMOVE, onTouchMove);
            }
        };
    }
}
