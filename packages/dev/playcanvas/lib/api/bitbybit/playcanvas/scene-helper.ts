import * as pc from "playcanvas";
import { PlayCanvasScene, InitPlayCanvasResult, PlayCanvasOrbitCameraInstance, PlayCanvasInputHandler, PlayCanvasOrbitCameraController } from "../../inputs/playcanvas-scene-helper-inputs";
import { PlayCanvasCamera } from "../../inputs/playcanvas-camera-inputs";

/**
 * Helper function to initialize a basic PlayCanvas scene with lights, shadows, and optional ground plane.
 * This provides a quick setup for common use cases while remaining fully customizable.
 * 
 * @param inputs Configuration options for the scene
 * @returns Object containing the app, scene, lights, ground, and dispose function
 * 
 * @example
 * ```typescript
 * import { initPlayCanvas, PlayCanvasScene } from "@bitbybit-dev/playcanvas";
 * 
 * // Basic usage with defaults
 * const { app, scene } = initPlayCanvas();
 * 
 * // Custom configuration
 * const options = new PlayCanvasScene.InitPlayCanvasDto();
 * options.sceneSize = 500;
 * options.enableGround = true;
 * options.enableShadows = true;
 * const { app, scene, directionalLight } = initPlayCanvas(options);
 * ```
 */
export function initPlayCanvas(inputs?: PlayCanvasScene.InitPlayCanvasDto): InitPlayCanvasResult {
    const config = inputs || new PlayCanvasScene.InitPlayCanvasDto();

    // Get or create canvas
    let canvas: HTMLCanvasElement;
    if (config.canvasId) {
        const existingCanvas = document.getElementById(config.canvasId) as HTMLCanvasElement;
        if (!existingCanvas) {
            throw new Error(`Canvas with id "${config.canvasId}" not found`);
        }
        canvas = existingCanvas;
    } else {
        canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        document.body.appendChild(canvas);
    }

    // Create PlayCanvas application
    const app = new pc.Application(canvas, {
        graphicsDeviceOptions: {
            antialias: true,
            alpha: false,
        },
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas),
    });

    // Fill the window and automatically change resolution to be the same as the canvas size
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    
    // Set pixel ratio for sharper rendering on high-DPI displays
    app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
    
    // Create root scene entity
    const scene = new pc.Entity("scene");
    app.root.addChild(scene);

    // Parse background color and set camera clear color later
    const bgColor = hexToRgb(config.backgroundColor);

    // Calculate positions based on scene size
    const lightHeight = config.sceneSize * 0.75;
    const lightOffset = config.sceneSize * 0.5;

    // Set ambient light
    const ambientColor = hexToRgb(config.ambientLightColor);
    app.scene.ambientLight = new pc.Color(
        ambientColor.r * config.ambientLightIntensity,
        ambientColor.g * config.ambientLightIntensity,
        ambientColor.b * config.ambientLightIntensity
    );

    // Create directional light
    const directionalLight = new pc.Entity("directionalLight");
    const lightColor = hexToRgb(config.directionalLightColor);

    // Scale bias values with scene size for consistent shadow quality
    // Smaller scenes need smaller bias, larger scenes need larger bias
    const scaledShadowBias = 0.005 * config.sceneSize;
    const scaledNormalOffsetBias = 0.01 * config.sceneSize;

    directionalLight.addComponent("light", {
        type: "directional",
        color: new pc.Color(lightColor.r, lightColor.g, lightColor.b),
        intensity: config.directionalLightIntensity,
        castShadows: config.enableShadows,
        shadowResolution: config.shadowMapSize,
        // Shadow distance tightly bounds the scene for maximum effective resolution
        shadowDistance: config.sceneSize * 3,
        // Bias values scaled proportionally to scene size
        shadowBias: scaledShadowBias,
        normalOffsetBias: scaledNormalOffsetBias,
        numCascades: 4,
        cascadeDistribution: 0.5,
    });
    directionalLight.setPosition(lightOffset, lightHeight, lightOffset);
    directionalLight.setEulerAngles(45, 30, 0);
    scene.addChild(directionalLight);

    // Create ground plane
    let ground: pc.Entity | null = null;
    if (config.enableGround) {
        const groundSize = config.sceneSize * config.groundScaleFactor;
        ground = new pc.Entity("ground");
        ground.addComponent("render", {
            type: "plane",
        });
        ground.setLocalScale(groundSize, 1, groundSize);
        ground.setPosition(
            config.groundCenter[0],
            config.groundCenter[1],
            config.groundCenter[2]
        );

        // Create ground material
        const groundMaterial = new pc.StandardMaterial();
        const groundColor = hexToRgb(config.groundColor);
        groundMaterial.diffuse = new pc.Color(groundColor.r, groundColor.g, groundColor.b);
        groundMaterial.opacity = config.groundOpacity;
        if (config.groundOpacity < 1) {
            groundMaterial.blendType = pc.BLEND_NORMAL;
        }
        groundMaterial.update();

        const meshInstances = ground.render?.meshInstances;
        if (meshInstances) {
            for (const mi of meshInstances) {
                mi.material = groundMaterial;
            }
        }

        scene.addChild(ground);
    }

    // Create orbit camera if enabled
    let orbitCamera: PlayCanvasOrbitCameraController | null = null;
    if (config.enableOrbitCamera) {
        // Use provided camera options or create new DTO with defaults as single source of truth
        const camOpts = config.orbitCameraOptions ?? new PlayCanvasCamera.OrbitCameraDto();

        // Compute scene-aware overrides for values that should scale with scene size
        // Reference scene size of 20 units is used as baseline for sensitivity calculations
        const referenceSize = 20;
        const sizeRatio = config.sceneSize / referenceSize;

        // Only override these values if user didn't provide custom camera options
        const userProvidedCameraOptions = config.orbitCameraOptions !== undefined;
        const effectiveDistance = userProvidedCameraOptions ? camOpts.distance : config.sceneSize * Math.sqrt(2);
        const effectiveDistanceMin = userProvidedCameraOptions ? camOpts.distanceMin : config.sceneSize * 0.05;
        const effectiveDistanceMax = userProvidedCameraOptions ? camOpts.distanceMax : config.sceneSize * 10;
        const effectiveDistanceSensitivity = userProvidedCameraOptions ? camOpts.distanceSensitivity : camOpts.distanceSensitivity * sizeRatio;

        // Create camera entity
        const cameraEntity = new pc.Entity("OrbitCamera");
        cameraEntity.addComponent("camera", {
            clearColor: new pc.Color(bgColor.r, bgColor.g, bgColor.b, 1),
            fov: 70,
            nearClip: 0.1,
            farClip: config.sceneSize * 50,
        });
        scene.addChild(cameraEntity);

        // Create orbit camera controller using DTO defaults with scene-aware overrides
        orbitCamera = createOrbitCameraController(app, cameraEntity, {
            autoRender: camOpts.autoRender,
            distanceMax: effectiveDistanceMax,
            distanceMin: effectiveDistanceMin,
            pitchAngleMax: camOpts.pitchAngleMax,
            pitchAngleMin: camOpts.pitchAngleMin,
            inertiaFactor: camOpts.inertiaFactor,
            focusEntity: camOpts.focusEntity || null,
            frameOnStart: camOpts.frameOnStart,
            pivotPoint: camOpts.pivotPoint,
            distance: effectiveDistance,
            pitch: camOpts.pitch,
            yaw: camOpts.yaw,
            orbitSensitivity: camOpts.orbitSensitivity,
            distanceSensitivity: effectiveDistanceSensitivity,
        });
    }

    // Handle window resize
    const onWindowResize = (): void => {
        app.resizeCanvas();
    };
    window.addEventListener("resize", onWindowResize, false);

    // Start the application
    app.start();

    // Dispose function to clean up resources
    const dispose = (): void => {
        window.removeEventListener("resize", onWindowResize);

        if (orbitCamera) {
            orbitCamera.destroy();
        }

        if (ground) {
            const meshInstances = ground.render?.meshInstances;
            if (meshInstances) {
                for (const mi of meshInstances) {
                    mi.material?.destroy();
                }
            }
            ground.destroy();
        }

        directionalLight.destroy();
        scene.destroy();

        app.destroy();

        // Remove canvas if we created it
        if (!config.canvasId && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    };

    return {
        app,
        scene,
        directionalLight,
        ground,
        orbitCamera,
        dispose
    };
}

/**
 * Parse hex color to RGB values (0-1 range)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        };
    }
    return { r: 0.1, g: 0.1, b: 0.1 };
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
    pivotPoint: [number, number, number];
    distance: number;
    pitch: number;
    yaw: number;
    orbitSensitivity: number;
    distanceSensitivity: number;
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

function createOrbitCameraController(
    app: pc.Application,
    cameraEntity: pc.Entity,
    config: OrbitCameraConfig
): PlayCanvasOrbitCameraController {
    const orbitCamera = createOrbitCameraInstance(cameraEntity, config);

    // Set initial position
    const pivotVec = new pc.Vec3(config.pivotPoint[0], config.pivotPoint[1], config.pivotPoint[2]);
    orbitCamera.pivotPoint = pivotVec;
    orbitCamera.distance = config.distance;
    orbitCamera.pitch = config.pitch;
    orbitCamera.yaw = config.yaw;

    // Setup mouse input
    const mouseInput = createMouseInput(app, cameraEntity, orbitCamera, {
        orbitSensitivity: config.orbitSensitivity,
        distanceSensitivity: config.distanceSensitivity
    });

    // Setup touch input
    const touchInput = createTouchInput(app, cameraEntity, orbitCamera, {
        orbitSensitivity: config.orbitSensitivity,
        distanceSensitivity: config.distanceSensitivity
    });

    // Register update function
    const updateFn = (dt: number): void => {
        orbitCamera.update(dt);
    };
    app.on("update", updateFn);

    // Focus on entity if provided
    if (config.focusEntity && config.frameOnStart) {
        orbitCamera.focus(config.focusEntity);
    }

    return {
        orbitCamera,
        cameraEntity,
        mouseInput,
        touchInput,
        update: updateFn,
        destroy: (): void => {
            app.off("update", updateFn);
            mouseInput?.destroy();
            touchInput?.destroy();
        }
    };
}

function createOrbitCameraInstance(entity: pc.Entity, config: OrbitCameraConfig): PlayCanvasOrbitCameraInstance {
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

    const buildAabb = (entityToBuild: pc.Entity | pc.GraphNode, modelsAdded: number): number => {
        let count = modelsAdded;
        if (entityToBuild instanceof pc.Entity && entityToBuild.model) {
            const mi = entityToBuild.model.meshInstances;
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

        const children = entityToBuild.children;
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
        },

        resetAndLookAtEntity(resetPoint: pc.Vec3, targetEntity: pc.Entity): void {
            buildAabb(targetEntity, 0);
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

function createMouseInput(
    app: pc.Application,
    entity: pc.Entity,
    orbitCamera: PlayCanvasOrbitCameraInstance,
    options: { orbitSensitivity: number; distanceSensitivity: number }
): PlayCanvasInputHandler | null {
    if (!app.mouse) return null;

    const mouse = app.mouse;
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
        destroy: (): void => {
            mouse.off(pc.EVENT_MOUSEDOWN, onMouseDown);
            mouse.off(pc.EVENT_MOUSEUP, onMouseUp);
            mouse.off(pc.EVENT_MOUSEMOVE, onMouseMove);
            mouse.off(pc.EVENT_MOUSEWHEEL, onMouseWheel);
            window.removeEventListener("mouseout", onMouseOut);
        }
    };
}

function createTouchInput(
    app: pc.Application,
    entity: pc.Entity,
    orbitCamera: PlayCanvasOrbitCameraInstance,
    options: { orbitSensitivity: number; distanceSensitivity: number }
): PlayCanvasInputHandler | null {
    if (!app.touch) return null;

    const touch = app.touch;
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
        destroy: (): void => {
            touch.off(pc.EVENT_TOUCHSTART, onTouchStartEndCancel);
            touch.off(pc.EVENT_TOUCHEND, onTouchStartEndCancel);
            touch.off(pc.EVENT_TOUCHCANCEL, onTouchStartEndCancel);
            touch.off(pc.EVENT_TOUCHMOVE, onTouchMove);
        }
    };
}
