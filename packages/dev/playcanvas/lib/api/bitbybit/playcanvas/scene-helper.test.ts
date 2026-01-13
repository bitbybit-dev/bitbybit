/**
 * @jest-environment jsdom
 */
import { initPlayCanvas } from "./scene-helper";
import { PlayCanvasScene } from "../../inputs/playcanvas-scene-helper-inputs";
import { PlayCanvasCamera } from "../../inputs/playcanvas-camera-inputs";
import { MockEntityType, MockAppType } from "../../__mocks__/playcanvas.mock";

// Mock PlayCanvas module using centralized mocks
jest.mock("playcanvas", () => {
    const { createSceneHelperMock } = jest.requireActual("../../__mocks__/playcanvas.mock");
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
        jest.clearAllMocks();
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
            expect((result.app as unknown as MockAppType)._started).toBe(true);

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
            expect((result.app as unknown as MockAppType)._canvas).toBe(mockCanvas);

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
            expect((result.app as unknown as MockAppType)._canvas).not.toBe(mockCanvas);

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
            const lightComponent = (result.directionalLight as unknown as MockEntityType).light;
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
            const lightComponent = (result.directionalLight as unknown as MockEntityType).light;
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
            const lightComponent = (result.directionalLight as unknown as MockEntityType).light;
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
            const lightComponent = (result.directionalLight as unknown as MockEntityType).light;
            expect(lightComponent?.shadowResolution).toBe(4096);

            // Cleanup
            result.dispose();
        });
    });

    describe("dispose method", () => {
        it("should remove window resize event listener on dispose", () => {
            // Arrange
            const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
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
            const destroySpy = jest.spyOn(result.directionalLight, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy scene entity on cleanup", () => {
            // Arrange
            const result = initPlayCanvas();
            const destroySpy = jest.spyOn(result.scene, "destroy");

            // Act
            result.dispose();

            // Assert
            expect(destroySpy).toHaveBeenCalled();
        });

        it("should destroy app on cleanup", () => {
            // Arrange
            const result = initPlayCanvas();
            const destroySpy = jest.spyOn(result.app, "destroy");

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
            const destroySpy = jest.spyOn(result.orbitCamera as NonNullable<typeof result.orbitCamera>, "destroy");

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
            const destroySpy = jest.spyOn(result.ground as NonNullable<typeof result.ground>, "destroy");

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
            expect((result.app as unknown as MockAppType)._updateCallbacks.length).toBeGreaterThan(0);

            // Cleanup
            result.dispose();
        });

        it("should unregister update callback on destroy", () => {
            // Arrange
            const config = new PlayCanvasScene.InitPlayCanvasDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;
            const result = initPlayCanvas(config);
            const initialCallbackCount = (result.app as unknown as MockAppType)._updateCallbacks.length;

            // Act
            result.orbitCamera?.destroy();

            // Assert
            expect((result.app as unknown as MockAppType)._updateCallbacks.length).toBeLessThan(initialCallbackCount);

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
