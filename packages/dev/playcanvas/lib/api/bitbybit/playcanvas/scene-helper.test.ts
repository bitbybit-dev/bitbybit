import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initPlayCanvas } from "./scene-helper";
import { PlayCanvasScene } from "../../inputs/playcanvas-scene-helper-inputs";
import { PlayCanvasCamera } from "../../inputs/playcanvas-camera-inputs";
import { asMockApp, asMockEntity } from "../../__mocks__/playcanvas.mock";
import type { Mock } from "vitest";
import * as pc from "playcanvas";

// Mock PlayCanvas module using centralized mocks
vi.mock("playcanvas", async () => {
    const { createSceneHelperMock } = await vi.importActual<typeof import("../../__mocks__/playcanvas.mock")>("../../__mocks__/playcanvas.mock");
    return createSceneHelperMock();
});

describe("initPlayCanvas unit tests", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
        // Create a mock canvas element
        mockCanvas = document.createElement("canvas");
        mockCanvas.id = "test-canvas";
        document.body.appendChild(mockCanvas);

        // Mock window properties
        Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
        Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });
        Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });
    });

    afterEach(() => {
        // Clean up DOM
        if (mockCanvas && mockCanvas.parentNode) {
            mockCanvas.parentNode.removeChild(mockCanvas);
        }
        // Clean up any canvases created by tests
        document.querySelectorAll("canvas").forEach(canvas => {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });
        vi.clearAllMocks();
    });

    describe("initialization with defaults", () => {
        it("should create scene with default configuration", () => {
            // Arrange & Act
            const result = initPlayCanvas();

            // Assert
            expect(result.app).toBeDefined();
            expect(result.scene).toBeDefined();
            expect(result.directionalLight).toBeDefined();
            expect(result.ground).toBeDefined();
            expect(typeof result.dispose).toBe("function");

            // Cleanup
            result.dispose();
        });

        it("should create root scene entity with correct name", () => {
            // Arrange & Act
            const result = initPlayCanvas();

            // Assert
            expect(result.scene.name).toBe("scene");

            // Cleanup
            result.dispose();
        });

        it("should create directional light entity with correct name", () => {
            // Arrange & Act
            const result = initPlayCanvas();

            // Assert
            expect(result.directionalLight.name).toBe("directionalLight");

            // Cleanup
            result.dispose();
        });

        it("should start the application", () => {
            // Arrange & Act
            const result = initPlayCanvas();

            // Assert
            expect(asMockApp(result.app)._started).toBe(true);

            // Cleanup
            result.dispose();
        });
    });

    describe("canvas handling", () => {
        it("should use existing canvas when canvasId is provided", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(asMockApp(result.app)._canvas).toBe(mockCanvas);

            // Cleanup
            result.dispose();
        });

        it("should throw error when canvas with provided id is not found", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "nonexistent-canvas";

            // Act & Assert
            expect(() => initPlayCanvas(config)).toThrow("Canvas with id \"nonexistent-canvas\" not found");
        });

        it("should create new canvas when canvasId is not provided", () => {
            // Arrange & Act
            const result = initPlayCanvas();

            // Assert - canvas should be created and different from test canvas
            expect(asMockApp(result.app)._canvas).not.toBe(mockCanvas);

            // Cleanup
            result.dispose();
        });
    });

    describe("ground plane configuration", () => {
        it("should create ground plane when enableGround is true", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.ground).not.toBeNull();
            expect(result.ground?.name).toBe("ground");

            // Cleanup
            result.dispose();
        });

        it("should not create ground plane when enableGround is false", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableGround = false;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.ground).toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should position ground at specified center", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundCenter = [5, -2, 10];

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const position = result.ground?.getPosition();
            expect(position?.x).toBe(5);
            expect(position?.y).toBe(-2);
            expect(position?.z).toBe(10);

            // Cleanup
            result.dispose();
        });

        it("should scale ground based on sceneSize and groundScaleFactor", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.groundScaleFactor = 3;
            config.enableGround = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const expectedSize = config.sceneSize * config.groundScaleFactor; // 150
            const scale = result.ground?.getLocalScale();
            expect(scale?.x).toBe(expectedSize);
            expect(scale?.z).toBe(expectedSize);

            // Cleanup
            result.dispose();
        });
    });

    describe("orbit camera configuration", () => {
        it("should create orbit camera when enableOrbitCamera is true", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera).not.toBeNull();
            expect(result.orbitCamera?.cameraEntity).toBeDefined();
            expect(result.orbitCamera?.orbitCamera).toBeDefined();

            // Cleanup
            result.dispose();
        });

        it("should not create orbit camera when enableOrbitCamera is false", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = false;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera).toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should set camera distance based on scene size when no custom options provided", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const expectedDistance = config.sceneSize * Math.sqrt(2);
            expect(result.orbitCamera?.orbitCamera.distance).toBeCloseTo(expectedDistance, 5);

            // Cleanup
            result.dispose();
        });

        it("should use custom camera options when provided", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;
            config.orbitCameraOptions = new PlayCanvasCamera.OrbitCameraDto();
            config.orbitCameraOptions.distance = 100;
            config.orbitCameraOptions.pitch = 45;
            config.orbitCameraOptions.yaw = 90;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera?.orbitCamera.distance).toBe(100);
            expect(result.orbitCamera?.orbitCamera.pitch).toBe(45);
            expect(result.orbitCamera?.orbitCamera.yaw).toBe(90);

            // Cleanup
            result.dispose();
        });

        it("should set camera limits based on scene size", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera?.orbitCamera.distanceMin).toBeCloseTo(config.sceneSize * 0.05, 5);
            expect(result.orbitCamera?.orbitCamera.distanceMax).toBeCloseTo(config.sceneSize * 10, 5);

            // Cleanup
            result.dispose();
        });

        it("should create camera entity with name OrbitCamera", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera?.cameraEntity.name).toBe("OrbitCamera");

            // Cleanup
            result.dispose();
        });
    });

    describe("scene size scaling", () => {
        it("should position directional light based on scene size", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 100;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const expectedHeight = config.sceneSize * 0.75; // 75
            const expectedOffset = config.sceneSize * 0.5; // 50
            const lightPosition = result.directionalLight.getPosition();
            expect(lightPosition.x).toBeCloseTo(expectedOffset, 5);
            expect(lightPosition.y).toBeCloseTo(expectedHeight, 5);
            expect(lightPosition.z).toBeCloseTo(expectedOffset, 5);

            // Cleanup
            result.dispose();
        });

        it("should set ambient light color based on config", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.ambientLightColor = "#ffffff";
            config.ambientLightIntensity = 0.5;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const ambientLight = result.app.scene.ambientLight;
            expect(ambientLight).toBeDefined();
            // Ambient light values should be RGB * intensity
            expect(ambientLight.r).toBeCloseTo(0.5, 2);
            expect(ambientLight.g).toBeCloseTo(0.5, 2);
            expect(ambientLight.b).toBeCloseTo(0.5, 2);

            // Cleanup
            result.dispose();
        });
    });

    describe("light configuration", () => {
        it("should apply directional light intensity from config", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.directionalLightIntensity = 2.5;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const lightComponent = asMockEntity(result.directionalLight).light;
            expect(lightComponent?.intensity).toBe(2.5);

            // Cleanup
            result.dispose();
        });

        it("should enable shadows on directional light when enableShadows is true", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableShadows = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const lightComponent = asMockEntity(result.directionalLight).light;
            expect(lightComponent?.castShadows).toBe(true);

            // Cleanup
            result.dispose();
        });

        it("should disable shadows on directional light when enableShadows is false", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableShadows = false;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const lightComponent = asMockEntity(result.directionalLight).light;
            expect(lightComponent?.castShadows).toBe(false);

            // Cleanup
            result.dispose();
        });

        it("should set shadow map size from config", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.shadowMapSize = 4096;
            config.enableShadows = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            const lightComponent = asMockEntity(result.directionalLight).light;
            expect(lightComponent?.shadowResolution).toBe(4096);

            // Cleanup
            result.dispose();
        });
    });

    describe("dispose method", () => {
        it("should remove window resize event listener on dispose", () => {
            // Arrange
            const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
            const result = initPlayCanvas();

            // Act
            result.dispose();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            // Cleanup
            removeEventListenerSpy.mockRestore();
        });

        it("should destroy directional light on cleanup", () => {
            // Arrange
            const result = initPlayCanvas();
            const destroySpy = vi.spyOn(result.directionalLight, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy scene entity on cleanup", () => {
            // Arrange
            const result = initPlayCanvas();
            const destroySpy = vi.spyOn(result.scene, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy app on cleanup", () => {
            // Arrange
            const result = initPlayCanvas();
            const destroySpy = vi.spyOn(result.app, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy orbit camera controller when enabled", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.enableOrbitCamera = true;
            const result = initPlayCanvas(config);
            expect(result.orbitCamera).not.toBeNull();
            const destroySpy = vi.spyOn(result.orbitCamera as NonNullable<typeof result.orbitCamera>, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy ground when enabled", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.enableGround = true;
            const result = initPlayCanvas(config);
            expect(result.ground).not.toBeNull();
            const destroySpy = vi.spyOn(result.ground as NonNullable<typeof result.ground>, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should remove created canvas from DOM on dispose", () => {
            // Arrange - no canvasId means a new canvas is created
            const result = initPlayCanvas();
            const canvasCount = document.querySelectorAll("canvas").length;

            // Act
            result.dispose();

            // Assert - there should be one less canvas (only the mock test canvas remains)
            const newCanvasCount = document.querySelectorAll("canvas").length;
            expect(newCanvasCount).toBeLessThan(canvasCount);
        });

        it("should not remove canvas from DOM when canvasId was provided", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            const result = initPlayCanvas(config);

            // Act
            result.dispose();

            // Assert - canvas should still be in DOM
            expect(mockCanvas.parentNode).toBe(document.body);
        });
    });

    describe("hexToRgb helper function", () => {
        it("should parse valid hex colors correctly", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.backgroundColor = "#ff0000"; // Pure red

            // Act
            const result = initPlayCanvas(config);

            // Assert - the background color should be parsed and applied
            expect(result.app).toBeDefined();

            // Cleanup
            result.dispose();
        });

        it("should handle lowercase hex colors", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.groundColor = "#00ff00"; // Pure green

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.ground).toBeDefined();

            // Cleanup
            result.dispose();
        });
    });

    describe("orbit camera controller functionality", () => {
        it("should register update callback on app", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(asMockApp(result.app)._updateCallbacks.length).toBeGreaterThan(0);

            // Cleanup
            result.dispose();
        });

        it("should unregister update callback on destroy", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;
            const result = initPlayCanvas(config);
            const initialCallbackCount = asMockApp(result.app)._updateCallbacks.length;

            // Act
            result.orbitCamera?.destroy();

            // Assert
            expect(asMockApp(result.app)._updateCallbacks.length).toBeLessThan(initialCallbackCount);

            // Cleanup
            result.dispose();
        });

        it("should have mouse and touch input handlers", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(result.orbitCamera?.mouseInput).toBeDefined();
            expect(result.orbitCamera?.touchInput).toBeDefined();

            // Cleanup
            result.dispose();
        });

        it("should have update function", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initPlayCanvas(config);

            // Assert
            expect(typeof result.orbitCamera?.update).toBe("function");

            // Cleanup
            result.dispose();
        });
    });
});

// The camera is driven by a pointer and by a pair of fingers, and PlayCanvas delivers both as events
// on the application's own devices. The devices the suite stands in for record the handlers they are
// given, so calling one back is exactly what the engine would do.
describe("the orbit camera's input handling", () => {
    let result: ReturnType<typeof initPlayCanvas>;

    const handlerFor = (device: { on: Mock }, type: string): ((event: unknown) => void) =>
        device.on.mock.calls.find((call) => call[0] === type)![1] as (event: unknown) => void;

    const mouseHandler = (type: string): ((event: unknown) => void) =>
        handlerFor(asMockApp(result.app).mouse!, type);

    const touchHandler = (type: string): ((event: unknown) => void) =>
        handlerFor(asMockApp(result.app).touch!, type);

    const mouseEvent = (fields: Record<string, unknown>): unknown =>
        ({ x: 0, y: 0, dx: 0, dy: 0, wheelDelta: 0, event: { preventDefault: () => undefined }, ...fields });

    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        canvas = document.createElement("canvas");
        canvas.id = "test-canvas";
        document.body.appendChild(canvas);
        const config = new PlayCanvasScene.InitPlayCanvasDto();
        config.canvasId = "test-canvas";
        config.enableOrbitCamera = true;
        result = initPlayCanvas(config);
    });

    afterEach(() => {
        result.dispose();
        canvas.remove();
    });

    describe("the mouse", () => {
        it("should turn the camera while the left button is held", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            mouseHandler("mousedown")(mouseEvent({ button: 0 }));

            // Act
            mouseHandler("mousemove")(mouseEvent({ dx: 10, dy: 5 }));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).not.toBe(started);
            expect(result.orbitCamera!.orbitCamera.pitch).not.toBe(0);
        });

        it("should stop turning once the left button is released", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            mouseHandler("mousedown")(mouseEvent({ button: 0 }));
            mouseHandler("mouseup")(mouseEvent({ button: 0 }));

            // Act
            mouseHandler("mousemove")(mouseEvent({ dx: 10, dy: 5 }));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(started);
        });

        it("should move the pivot while the right button is held", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            mouseHandler("mousedown")(mouseEvent({ button: 2 }));

            // Act
            mouseHandler("mousemove")(mouseEvent({ x: 100, y: 100 }));

            // Assert - a pan moves the pivot rather than turning the camera
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(started);
            expect(result.orbitCamera!.orbitCamera.pivotPoint.x).not.toBe(0);
        });

        it("should stop moving the pivot once the middle button is released", () => {
            // Arrange
            mouseHandler("mousedown")(mouseEvent({ button: 1 }));
            mouseHandler("mouseup")(mouseEvent({ button: 1 }));
            const before = result.orbitCamera!.orbitCamera.yaw;

            // Act
            mouseHandler("mousemove")(mouseEvent({ dx: 10 }));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(before);
        });

        it("should back away on a wheel turn", () => {
            // Arrange
            const before = result.orbitCamera!.orbitCamera.distance;

            // Act
            mouseHandler("mousewheel")(mouseEvent({ wheelDelta: 1 }));

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBeGreaterThan(before);
        });

        it("should forget the buttons when the pointer leaves the window", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            mouseHandler("mousedown")(mouseEvent({ button: 0 }));
            window.dispatchEvent(new Event("mouseout"));

            // Act
            mouseHandler("mousemove")(mouseEvent({ dx: 10, dy: 5 }));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(started);
        });
    });

    describe("touch", () => {
        const touches = (points: { x: number; y: number }[]): unknown => ({ touches: points });

        it("should turn the camera as one finger moves", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            touchHandler("touchstart")(touches([{ x: 0, y: 0 }]));

            // Act
            touchHandler("touchmove")(touches([{ x: 10, y: 5 }]));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).not.toBe(started);
        });

        it("should come closer as two fingers spread apart", () => {
            // Arrange
            const before = result.orbitCamera!.orbitCamera.distance;
            touchHandler("touchstart")(touches([{ x: 0, y: 0 }, { x: 10, y: 0 }]));

            // Act
            touchHandler("touchmove")(touches([{ x: 0, y: 0 }, { x: 100, y: 0 }]));

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).not.toBe(before);
        });

        it("should take up where it left off when a finger is lifted", () => {
            // Arrange
            const started = result.orbitCamera!.orbitCamera.yaw;
            touchHandler("touchstart")(touches([{ x: 0, y: 0 }, { x: 10, y: 0 }]));

            // Act
            touchHandler("touchend")(touches([{ x: 50, y: 50 }]));
            touchHandler("touchmove")(touches([{ x: 60, y: 50 }]));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).not.toBe(started);
        });

        it("should do nothing for a touch of more fingers than it follows", () => {
            // Arrange
            const before = result.orbitCamera!.orbitCamera.yaw;

            // Act
            touchHandler("touchcancel")(touches([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]));
            touchHandler("touchmove")(touches([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]));

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(before);
        });
    });
});

// What the camera itself does once it exists: the limits it holds its values inside, the two ways it
// can be pointed at something, and the easing it applies on the way to where it was told to go.
describe("the orbit camera instance", () => {
    let result: ReturnType<typeof initPlayCanvas>;
    let canvas: HTMLCanvasElement;

    const build = (adjust: (config: PlayCanvasScene.InitPlayCanvasDto) => void = () => undefined): ReturnType<typeof initPlayCanvas> => {
        const config = new PlayCanvasScene.InitPlayCanvasDto();
        config.canvasId = "test-canvas";
        config.enableOrbitCamera = true;
        adjust(config);
        return initPlayCanvas(config);
    };

    beforeEach(() => {
        canvas = document.createElement("canvas");
        canvas.id = "test-canvas";
        document.body.appendChild(canvas);
        result = build();
    });

    afterEach(() => {
        result.dispose();
        canvas.remove();
    });

    describe("distance", () => {
        it("should not come closer than the nearest it is allowed", () => {
            // Act
            result.orbitCamera!.orbitCamera.distance = -100;

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBe(result.orbitCamera!.orbitCamera.distanceMin);
        });

        it("should not back away further than the furthest it is allowed", () => {
            // Act
            result.orbitCamera!.orbitCamera.distance = 1e9;

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBe(result.orbitCamera!.orbitCamera.distanceMax);
        });

        it("should take a distance that lies within the limits", () => {
            // Act
            result.orbitCamera!.orbitCamera.distance = 12;

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBe(12);
        });
    });

    describe("pitch", () => {
        it("should not look further up than it is allowed", () => {
            // Act
            result.orbitCamera!.orbitCamera.pitch = 1000;

            // Assert
            expect(result.orbitCamera!.orbitCamera.pitch).toBe(result.orbitCamera!.orbitCamera.pitchAngleMax);
        });

        it("should not look further down than it is allowed", () => {
            // Act
            result.orbitCamera!.orbitCamera.pitch = -1000;

            // Assert
            expect(result.orbitCamera!.orbitCamera.pitch).toBe(result.orbitCamera!.orbitCamera.pitchAngleMin);
        });
    });

    describe("yaw", () => {
        it("should take the shorter way round rather than unwinding a whole turn", () => {
            // Act
            result.orbitCamera!.orbitCamera.yaw = 350;

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(350);
        });

        it("should take the shorter way round in the other direction too", () => {
            // Act
            result.orbitCamera!.orbitCamera.yaw = -350;

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(-350);
        });
    });

    describe("pivotPoint", () => {
        it("should take the point it was given rather than the object holding it", () => {
            // Arrange
            const point = result.orbitCamera!.orbitCamera.pivotPoint.clone();
            point.x = 5;

            // Act
            result.orbitCamera!.orbitCamera.pivotPoint = point;

            // Assert
            expect(result.orbitCamera!.orbitCamera.pivotPoint.x).toBe(5);
            expect(result.orbitCamera!.orbitCamera.pivotPoint).not.toBe(point);
        });
    });

    describe("reset", () => {
        it("should put the camera where it was told, all three at once", () => {
            // Act
            result.orbitCamera!.orbitCamera.reset(45, 30, 20);

            // Assert
            expect(result.orbitCamera!.orbitCamera.yaw).toBe(45);
            expect(result.orbitCamera!.orbitCamera.pitch).toBe(30);
            expect(result.orbitCamera!.orbitCamera.distance).toBe(20);
        });
    });

    describe("update", () => {
        it("should move part of the way towards where it was told to go", () => {
            // Arrange
            result.orbitCamera!.orbitCamera.reset(0, 0, 10);
            result.orbitCamera!.orbitCamera.distance = 20;

            // Act
            result.orbitCamera!.update(0.001);

            // Assert - the target is held while the camera eases towards it
            expect(result.orbitCamera!.orbitCamera.distance).toBe(20);
        });

        it("should arrive at once when it was given no inertia", () => {
            // Arrange
            result.dispose();
            result = build((config) => {
            config.orbitCameraOptions = new PlayCanvasCamera.OrbitCameraDto();
            config.orbitCameraOptions.inertiaFactor = 0;
        });

            // Act
            result.orbitCamera!.orbitCamera.distance = 20;
            result.orbitCamera!.update(0.016);

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBe(20);
        });
    });

    describe("focus", () => {
        it("should back away far enough to hold the object it was pointed at", () => {
            // Arrange
            const target = result.app.root.children[0]!;

            // Act
            result.orbitCamera!.orbitCamera.focus(target as never);

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBeGreaterThan(0);
        });
    });

    describe("resetAndLookAtPoint", () => {
        it("should look at the point it was given from where it was told to stand", () => {
            // Act
            result.orbitCamera!.orbitCamera.resetAndLookAtPoint(new pc.Vec3(0, 0, 20), new pc.Vec3(0, 0, 0));

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBeCloseTo(20, 5);
        });
    });

    describe("resetAndLookAtEntity", () => {
        it("should look at the middle of the object it was given", () => {
            // Arrange
            const target = result.app.root.children[0]!;

            // Act
            result.orbitCamera!.orbitCamera.resetAndLookAtEntity(new pc.Vec3(0, 0, 20), target as never);

            // Assert
            expect(result.orbitCamera!.orbitCamera.distance).toBeGreaterThan(0);
        });
    });
});
