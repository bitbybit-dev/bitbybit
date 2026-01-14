/**
 * @jest-environment jsdom
 */
import { initBabylonJS } from "./scene-helper";
import { BabylonJSScene } from "../../inputs/babylon-scene-helper-inputs";
import { BabylonCamera } from "../../inputs/babylon-camera-inputs";
import { MockMeshType } from "../../__mocks__/babylonjs.mock";

// Mock BabylonJS core module using centralized mocks
jest.mock("@babylonjs/core", () => {
    const { createSceneHelperMock } = jest.requireActual("../../__mocks__/babylonjs.mock");
    return createSceneHelperMock();
});

describe("initBabylonJS unit tests", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
        // Create a mock canvas element
        mockCanvas = document.createElement("canvas");
        mockCanvas.id = "test-canvas";
        document.body.appendChild(mockCanvas);

        // Mock window properties
        Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
        Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });
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
            const result = initBabylonJS();

            // Assert
            expect(result.scene).toBeDefined();
            expect(result.engine).toBeDefined();
            expect(result.hemisphericLight).toBeDefined();
            expect(result.directionalLight).toBeDefined();
            expect(result.ground).toBeDefined();
            expect(typeof result.startRenderLoop).toBe("function");
            expect(typeof result.dispose).toBe("function");

            // Cleanup
            result.dispose();
        });

        it("should set scene metadata with empty shadowGenerators array when shadows disabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = false;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.scene.metadata).toBeDefined();
            expect(result.scene.metadata.shadowGenerators).toEqual([]);

            // Cleanup
            result.dispose();
        });

        it("should create hemispheric light with correct name", () => {
            // Arrange & Act
            const result = initBabylonJS();

            // Assert
            expect(result.hemisphericLight.name).toBe("hemisphericLight");

            // Cleanup
            result.dispose();
        });

        it("should create directional light with correct name", () => {
            // Arrange & Act
            const result = initBabylonJS();

            // Assert
            expect(result.directionalLight.name).toBe("directionalLight");

            // Cleanup
            result.dispose();
        });
    });

    describe("canvas handling", () => {
        it("should use existing canvas when canvasId is provided", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";

            // Act
            const result = initBabylonJS(config);

            // Assert - engine should be created with the existing canvas
            expect(result.engine).toBeDefined();

            // Cleanup
            result.dispose();
        });

        it("should throw error when canvas with provided id is not found", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "nonexistent-canvas";

            // Act & Assert
            expect(() => initBabylonJS(config)).toThrow("Canvas with id \"nonexistent-canvas\" not found");
        });

        it("should create new canvas when canvasId is not provided", () => {
            // Arrange & Act
            const result = initBabylonJS();

            // Assert - a new canvas should have been created
            expect(result.engine).toBeDefined();

            // Cleanup
            result.dispose();
        });
    });

    describe("shadow configuration", () => {
        it("should add shadow generator to scene metadata when shadows are enabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.scene.metadata.shadowGenerators.length).toBe(1);

            // Cleanup
            result.dispose();
        });

        it("should not add shadow generator when shadows are disabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = false;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.scene.metadata.shadowGenerators.length).toBe(0);

            // Cleanup
            result.dispose();
        });

        it("should configure shadow generator with blur settings when enabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            const shadowGenerator = result.scene.metadata.shadowGenerators[0];
            expect(shadowGenerator.useBlurExponentialShadowMap).toBe(true);
            expect(shadowGenerator.blurKernel).toBe(32);
            expect(shadowGenerator.darkness).toBe(0.3);

            // Cleanup
            result.dispose();
        });
    });

    describe("ground plane configuration", () => {
        it("should create ground plane when enableGround is true", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.ground).not.toBeNull();
            expect(result.ground?.name).toBe("ground");

            // Cleanup
            result.dispose();
        });

        it("should not create ground plane when enableGround is false", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = false;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.ground).toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should position ground at specified center", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundCenter = [5, -2, 10];

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.ground?.position.x).toBe(5);
            expect(result.ground?.position.y).toBe(-2);
            expect(result.ground?.position.z).toBe(10);

            // Cleanup
            result.dispose();
        });

        it("should create ground with correct size based on sceneSize and groundScaleFactor", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.groundScaleFactor = 3;
            config.enableGround = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            const expectedSize = config.sceneSize * config.groundScaleFactor; // 150
            expect((result.ground as unknown as MockMeshType)._groundWidth).toBe(expectedSize);
            expect((result.ground as unknown as MockMeshType)._groundHeight).toBe(expectedSize);

            // Cleanup
            result.dispose();
        });

        it("should set ground material with correct color", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundColor = "#ff0000";

            // Act
            const result = initBabylonJS(config);

            // Assert
            const material = result.ground?.material;
            expect(material).toBeDefined();
            expect(material?.name).toBe("groundMaterial");

            // Cleanup
            result.dispose();
        });

        it("should set ground material opacity from config", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundOpacity = 0.5;

            // Act
            const result = initBabylonJS(config);

            // Assert
            const material = result.ground?.material;
            expect(material?.alpha).toBe(0.5);

            // Cleanup
            result.dispose();
        });

        it("should set ground to receive shadows when shadows are enabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.enableShadows = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect((result.ground as unknown as MockMeshType).receiveShadows).toBe(true);

            // Cleanup
            result.dispose();
        });
    });

    describe("arc rotate camera configuration", () => {
        it("should create arc rotate camera when enableArcRotateCamera is true", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableArcRotateCamera = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.arcRotateCamera).not.toBeNull();
            expect(result.arcRotateCamera?.name).toBe("arcRotateCamera");

            // Cleanup
            result.dispose();
        });

        it("should not create arc rotate camera when enableArcRotateCamera is false", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableArcRotateCamera = false;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.arcRotateCamera).toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should set camera radius based on scene size when no custom options provided", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.enableArcRotateCamera = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            const expectedRadius = config.sceneSize * Math.sqrt(2);
            expect(result.arcRotateCamera?.radius).toBeCloseTo(expectedRadius, 5);

            // Cleanup
            result.dispose();
        });

        it("should use custom camera options when provided", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableArcRotateCamera = true;
            config.arcRotateCameraOptions = new BabylonCamera.ArcRotateCameraDto();
            config.arcRotateCameraOptions.radius = 100;
            config.arcRotateCameraOptions.alpha = 90;
            config.arcRotateCameraOptions.beta = 60;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.arcRotateCamera?.radius).toBe(100);
            // Alpha and beta are converted to radians
            expect(result.arcRotateCamera?.alpha).toBeCloseTo(Math.PI / 2, 5); // 90 degrees
            expect(result.arcRotateCamera?.beta).toBeCloseTo(Math.PI / 3, 5); // 60 degrees

            // Cleanup
            result.dispose();
        });

        it("should set camera limits based on scene size", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.enableArcRotateCamera = true;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.arcRotateCamera?.lowerRadiusLimit).toBeCloseTo(config.sceneSize * 0.1, 5);
            expect(result.arcRotateCamera?.upperRadiusLimit).toBeCloseTo(config.sceneSize * 10, 5);
            expect(result.arcRotateCamera?.maxZ).toBeCloseTo(config.sceneSize * 50, 5);

            // Cleanup
            result.dispose();
        });
    });

    describe("scene size scaling", () => {
        it("should position lights based on scene size", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 100;

            // Act
            const result = initBabylonJS(config);

            // Assert
            const expectedHeight = config.sceneSize * 0.75; // 75
            const expectedOffset = config.sceneSize * 0.5; // 50
            expect(result.directionalLight.position.x).toBeCloseTo(expectedOffset, 5);
            expect(result.directionalLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.z).toBeCloseTo(expectedOffset, 5);

            // Cleanup
            result.dispose();
        });
    });

    describe("light intensity configuration", () => {
        it("should apply hemisphere light intensity from config", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.hemisphereLightIntensity = 2.5;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.hemisphericLight.intensity).toBe(2.5);

            // Cleanup
            result.dispose();
        });

        it("should apply directional light intensity from config", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.directionalLightIntensity = 3.0;

            // Act
            const result = initBabylonJS(config);

            // Assert
            expect(result.directionalLight.intensity).toBe(3.0);

            // Cleanup
            result.dispose();
        });
    });

    describe("dispose method", () => {
        it("should remove window resize event listener on dispose", () => {
            // Arrange
            const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
            const result = initBabylonJS();

            // Act
            result.dispose();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            // Cleanup
            removeEventListenerSpy.mockRestore();
        });

        it("should dispose hemispheric light on cleanup", () => {
            // Arrange
            const result = initBabylonJS();
            const disposeSpy = jest.spyOn(result.hemisphericLight, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should dispose directional light on cleanup", () => {
            // Arrange
            const result = initBabylonJS();
            const disposeSpy = jest.spyOn(result.directionalLight, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should dispose scene on cleanup", () => {
            // Arrange
            const result = initBabylonJS();
            const disposeSpy = jest.spyOn(result.scene, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should dispose engine on cleanup", () => {
            // Arrange
            const result = initBabylonJS();
            const disposeSpy = jest.spyOn(result.engine, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should dispose arc rotate camera when enabled", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.enableArcRotateCamera = true;
            const result = initBabylonJS(config);
            expect(result.arcRotateCamera).not.toBeNull();
            const disposeSpy = jest.spyOn(result.arcRotateCamera as NonNullable<typeof result.arcRotateCamera>, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should remove created canvas from DOM on dispose", () => {
            // Arrange - no canvasId means a new canvas is created
            const result = initBabylonJS();
            const canvasCount = document.querySelectorAll("canvas").length;

            // Act
            result.dispose();

            // Assert - there should be one less canvas (only the mock test canvas remains)
            const newCanvasCount = document.querySelectorAll("canvas").length;
            expect(newCanvasCount).toBeLessThan(canvasCount);
        });

        it("should not remove canvas from DOM when canvasId was provided", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            const result = initBabylonJS(config);

            // Act
            result.dispose();

            // Assert - canvas should still be in DOM
            expect(mockCanvas.parentNode).toBe(document.body);
        });
    });

    describe("startRenderLoop method", () => {
        it("should start engine render loop", () => {
            // Arrange
            const result = initBabylonJS();
            const runRenderLoopSpy = jest.spyOn(result.engine, "runRenderLoop");

            // Act
            result.startRenderLoop();

            // Assert
            expect(runRenderLoopSpy).toHaveBeenCalledWith(expect.any(Function));

            // Cleanup
            result.dispose();
        });

        it("should call onRender callback when provided", () => {
            // Arrange
            const config = new BabylonJSScene.InitBabylonJSDto();
            config.canvasId = "test-canvas";
            config.enableArcRotateCamera = true; // Need active camera for render
            const result = initBabylonJS(config);
            const onRenderMock = jest.fn();
            let renderCallback: (() => void) | null = null;
            
            jest.spyOn(result.engine, "runRenderLoop").mockImplementation((callback) => {
                renderCallback = callback;
            });

            // Act
            result.startRenderLoop(onRenderMock);
            // Simulate one frame
            if (renderCallback) {
                renderCallback();
            }

            // Assert
            expect(onRenderMock).toHaveBeenCalled();

            // Cleanup
            result.dispose();
        });
    });
});
