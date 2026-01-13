/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ThreeJSScene } from "../../inputs/threejs-scene-inputs";
import { hexToRgb } from "../../__mocks__/test-helpers";
// Mock three module using centralized mocks
jest.mock("three", () => {
    const { createThreeJSMock } = jest.requireActual("../../__mocks__/threejs.mock");
    return createThreeJSMock();
});

// Mock the orbit-camera module using centralized mock factory
jest.mock("./orbit-camera", () => {
    const { createMockOrbitCameraResult } = jest.requireActual("../../__mocks__/threejs.mock");
    return {
        createOrbitCamera: jest.fn().mockReturnValue(createMockOrbitCameraResult()),
    };
});

// Import after mocks are defined
import { initThreeJS } from "./scene-helper";

describe("initThreeJS unit tests", () => {
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
            const result = initThreeJS();

            // Assert
            expect(result.scene).toBeDefined();
            expect(result.renderer).toBeDefined();
            expect(result.hemisphereLight).toBeDefined();
            expect(result.directionalLight).toBeDefined();
            expect(result.ground).toBeDefined();
            expect(typeof result.startAnimationLoop).toBe("function");
            expect(typeof result.dispose).toBe("function");

            // Cleanup
            result.dispose();
        });

        it("should set default background color to #1a1c1f", () => {
            // Arrange & Act
            const result = initThreeJS();
            const expectedColor = hexToRgb("#1a1c1f");

            // Assert
            expect(result.scene.background).toBeDefined();
            const background = result.scene.background as { r: number; g: number; b: number };
            expect(Math.abs(background.r - expectedColor.r)).toBeLessThan(0.01);
            expect(Math.abs(background.g - expectedColor.g)).toBeLessThan(0.01);
            expect(Math.abs(background.b - expectedColor.b)).toBeLessThan(0.01);

            // Cleanup
            result.dispose();
        });

        it("should create hemisphere light with default settings", () => {
            // Arrange
            const defaultDto = new ThreeJSScene.InitThreeJSDto();

            // Act
            const result = initThreeJS();

            // Assert
            expect(result.hemisphereLight.intensity).toBe(defaultDto.hemisphereLightIntensity);
            const expectedHeight = defaultDto.sceneSize * 0.75;
            expect(result.hemisphereLight.position.y).toBeCloseTo(expectedHeight, 5);

            // Cleanup
            result.dispose();
        });

        it("should create directional light with default settings", () => {
            // Arrange
            const defaultDto = new ThreeJSScene.InitThreeJSDto();

            // Act
            const result = initThreeJS();

            // Assert
            expect(result.directionalLight.intensity).toBe(defaultDto.directionalLightIntensity);
            const expectedOffset = defaultDto.sceneSize * 0.5;
            const expectedHeight = defaultDto.sceneSize * 0.75;
            expect(result.directionalLight.position.x).toBeCloseTo(expectedOffset, 5);
            expect(result.directionalLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.z).toBeCloseTo(expectedOffset, 5);

            // Cleanup
            result.dispose();
        });
    });

    describe("canvas handling", () => {
        it("should use existing canvas when canvasId is provided", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.renderer.domElement).toBe(mockCanvas);

            // Cleanup
            result.dispose();
        });

        it("should throw error when canvas with provided id is not found", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "nonexistent-canvas";

            // Act & Assert
            expect(() => initThreeJS(config)).toThrow("Canvas with id \"nonexistent-canvas\" not found");
        });

        it("should create new canvas when canvasId is not provided", () => {
            // Arrange & Act
            const result = initThreeJS();

            // Assert - canvas should be appended to document.body
            expect(result.renderer.domElement).not.toBe(mockCanvas);
            expect(result.renderer.domElement.style.width).toBe("100%");
            expect(result.renderer.domElement.style.height).toBe("100%");
            expect(result.renderer.domElement.style.display).toBe("block");

            // Cleanup
            result.dispose();
        });
    });

    describe("shadow configuration", () => {
        it("should enable shadows when enableShadows is true", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.renderer.shadowMap.enabled).toBe(true);
            expect(result.renderer.shadowMap.type).toBe(2); // VSMShadowMap
            expect(result.directionalLight.castShadow).toBe(true);

            // Cleanup
            result.dispose();
        });

        it("should not enable shadows when enableShadows is false", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableShadows = false;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.renderer.shadowMap.enabled).toBe(false);
            expect(result.directionalLight.castShadow).toBe(false);

            // Cleanup
            result.dispose();
        });

        it("should configure shadow camera based on scene size", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.groundScaleFactor = 2;
            config.enableShadows = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            const shadowCameraSize = config.sceneSize * config.groundScaleFactor;
            expect(result.directionalLight.shadow.camera.left).toBe(-shadowCameraSize / 2);
            expect(result.directionalLight.shadow.camera.right).toBe(shadowCameraSize / 2);
            expect(result.directionalLight.shadow.camera.top).toBe(shadowCameraSize / 2);
            expect(result.directionalLight.shadow.camera.bottom).toBe(-shadowCameraSize / 2);
            expect(result.directionalLight.shadow.camera.far).toBe(config.sceneSize * 3);

            // Cleanup
            result.dispose();
        });

        it("should set shadow map size from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.shadowMapSize = 4096;
            config.enableShadows = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.directionalLight.shadow.mapSize.width).toBe(4096);
            expect(result.directionalLight.shadow.mapSize.height).toBe(4096);

            // Cleanup
            result.dispose();
        });
    });

    describe("ground plane configuration", () => {
        it("should create ground plane when enableGround is true", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.ground).toBeDefined();
            expect(result.ground).not.toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should not create ground plane when enableGround is false", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = false;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.ground).toBeNull();

            // Cleanup
            result.dispose();
        });

        it("should position ground at specified center", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundCenter = [5, -2, 10];

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.ground?.position.x).toBe(5);
            expect(result.ground?.position.y).toBe(-2);
            expect(result.ground?.position.z).toBe(10);

            // Cleanup
            result.dispose();
        });

        it("should rotate ground to be horizontal", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.ground?.rotation.x).toBeCloseTo(-Math.PI / 2, 5);

            // Cleanup
            result.dispose();
        });

        it("should apply ground color from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundColor = "#ff0000";

            // Act
            const result = initThreeJS(config);

            // Assert
            const material = result.ground?.material as unknown as { color: { r: number; g: number; b: number } };
            const expectedColor = hexToRgb("#ff0000");
            expect(Math.abs(material.color.r - expectedColor.r)).toBeLessThan(0.01);
            expect(Math.abs(material.color.g - expectedColor.g)).toBeLessThan(0.01);
            expect(Math.abs(material.color.b - expectedColor.b)).toBeLessThan(0.01);

            // Cleanup
            result.dispose();
        });

        it("should set ground opacity from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.groundOpacity = 0.5;

            // Act
            const result = initThreeJS(config);

            // Assert
            const material = result.ground?.material as { transparent: boolean; opacity: number };
            expect(material.transparent).toBe(true);
            expect(material.opacity).toBe(0.5);

            // Cleanup
            result.dispose();
        });

        it("should set ground to receive shadows when shadows are enabled", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableGround = true;
            config.enableShadows = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.ground?.receiveShadow).toBe(true);

            // Cleanup
            result.dispose();
        });
    });

    describe("orbit camera configuration", () => {
        it("should create orbit camera when enableOrbitCamera is true", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.orbitCamera).not.toBeNull();
            expect(result.orbitCamera?.camera).toBeDefined();

            // Cleanup
            result.dispose();
        });

        it("should not create orbit camera when enableOrbitCamera is false", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.enableOrbitCamera = false;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.orbitCamera).toBeNull();

            // Cleanup
            result.dispose();
        });
    });

    describe("scene size scaling", () => {
        it("should scale light positions based on scene size", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 100;

            // Act
            const result = initThreeJS(config);

            // Assert
            const expectedHeight = config.sceneSize * 0.75; // 75
            const expectedOffset = config.sceneSize * 0.5; // 50
            expect(result.hemisphereLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.x).toBeCloseTo(expectedOffset, 5);
            expect(result.directionalLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.z).toBeCloseTo(expectedOffset, 5);

            // Cleanup
            result.dispose();
        });

        it("should scale ground size based on scene size and groundScaleFactor", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.sceneSize = 50;
            config.groundScaleFactor = 3;
            config.enableGround = true;

            // Act
            const result = initThreeJS(config);

            // Assert
            const geometry = result.ground?.geometry as unknown as { parameters: { width: number; height: number } };
            const expectedSize = config.sceneSize * config.groundScaleFactor; // 150
            expect(geometry.parameters.width).toBe(expectedSize);
            expect(geometry.parameters.height).toBe(expectedSize);

            // Cleanup
            result.dispose();
        });
    });

    describe("light color configuration", () => {
        it("should apply hemisphere light sky color from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.hemisphereLightSkyColor = "#00ff00";

            // Act
            const result = initThreeJS(config);

            // Assert
            const expectedColor = hexToRgb("#00ff00");
            expect(result.hemisphereLight.color.r).toBeCloseTo(expectedColor.r, 2);
            expect(result.hemisphereLight.color.g).toBeCloseTo(expectedColor.g, 2);
            expect(result.hemisphereLight.color.b).toBeCloseTo(expectedColor.b, 2);

            // Cleanup
            result.dispose();
        });

        it("should apply hemisphere light ground color from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.hemisphereLightGroundColor = "#0000ff";

            // Act
            const result = initThreeJS(config);

            // Assert
            const expectedColor = hexToRgb("#0000ff");
            expect(result.hemisphereLight.groundColor.r).toBeCloseTo(expectedColor.r, 2);
            expect(result.hemisphereLight.groundColor.g).toBeCloseTo(expectedColor.g, 2);
            expect(result.hemisphereLight.groundColor.b).toBeCloseTo(expectedColor.b, 2);

            // Cleanup
            result.dispose();
        });

        it("should apply directional light color from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.directionalLightColor = "#ffff00";

            // Act
            const result = initThreeJS(config);

            // Assert
            const expectedColor = hexToRgb("#ffff00");
            expect(result.directionalLight.color.r).toBeCloseTo(expectedColor.r, 2);
            expect(result.directionalLight.color.g).toBeCloseTo(expectedColor.g, 2);
            expect(result.directionalLight.color.b).toBeCloseTo(expectedColor.b, 2);

            // Cleanup
            result.dispose();
        });

        it("should apply light intensities from config", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            config.hemisphereLightIntensity = 2.5;
            config.directionalLightIntensity = 3.0;

            // Act
            const result = initThreeJS(config);

            // Assert
            expect(result.hemisphereLight.intensity).toBe(2.5);
            expect(result.directionalLight.intensity).toBe(3.0);

            // Cleanup
            result.dispose();
        });
    });

    describe("dispose method", () => {
        it("should remove window resize event listener on dispose", () => {
            // Arrange
            const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
            const result = initThreeJS();

            // Act
            result.dispose();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            // Cleanup
            removeEventListenerSpy.mockRestore();
        });

        it("should stop animation loop on dispose", () => {
            // Arrange
            const result = initThreeJS();
            const setAnimationLoopSpy = jest.spyOn(result.renderer, "setAnimationLoop");

            // Act
            result.dispose();

            // Assert
            expect(setAnimationLoopSpy).toHaveBeenCalledWith(null);
        });

        it("should dispose renderer on cleanup", () => {
            // Arrange
            const result = initThreeJS();
            const disposeSpy = jest.spyOn(result.renderer, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should dispose ground geometry and material on cleanup", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.enableGround = true;
            const result = initThreeJS(config);
            const ground = result.ground as { geometry: { dispose: () => void }; material: { dispose: () => void } };
            const geometryDisposeSpy = jest.spyOn(ground.geometry, "dispose");
            const materialDisposeSpy = jest.spyOn(ground.material, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(geometryDisposeSpy).toHaveBeenCalled();
            expect(materialDisposeSpy).toHaveBeenCalled();
        });

        it("should remove lights from scene on dispose", () => {
            // Arrange
            const result = initThreeJS();
            const sceneRemoveSpy = jest.spyOn(result.scene, "remove");

            // Act
            result.dispose();

            // Assert
            expect(sceneRemoveSpy).toHaveBeenCalledWith(result.hemisphereLight);
            expect(sceneRemoveSpy).toHaveBeenCalledWith(result.directionalLight);
            expect(sceneRemoveSpy).toHaveBeenCalledWith(result.directionalLight.target);
        });

        it("should destroy orbit camera on dispose when enabled", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.enableOrbitCamera = true;
            const result = initThreeJS(config);

            // Act
            result.dispose();

            // Assert
            expect(result.orbitCamera?.destroy).toHaveBeenCalled();
        });

        it("should remove created canvas from DOM on dispose", () => {
            // Arrange - no canvasId means a new canvas is created
            const result = initThreeJS();
            const canvas = result.renderer.domElement;
            expect(canvas.parentNode).toBe(document.body);

            // Act
            result.dispose();

            // Assert
            expect(canvas.parentNode).toBeNull();
        });

        it("should not remove canvas from DOM when canvasId was provided", () => {
            // Arrange
            const config = new ThreeJSScene.InitThreeJSDto();
            config.canvasId = "test-canvas";
            const result = initThreeJS(config);

            // Act
            result.dispose();

            // Assert - canvas should still be in DOM
            expect(mockCanvas.parentNode).toBe(document.body);
        });
    });

    describe("startAnimationLoop method", () => {
        it("should set animation loop on renderer", () => {
            // Arrange
            const result = initThreeJS();
            const setAnimationLoopSpy = jest.spyOn(result.renderer, "setAnimationLoop");

            // Act
            result.startAnimationLoop();

            // Assert
            expect(setAnimationLoopSpy).toHaveBeenCalledWith(expect.any(Function));

            // Cleanup
            result.dispose();
        });

        it("should call onRender callback when provided", () => {
            // Arrange
            const result = initThreeJS();
            const onRenderMock = jest.fn();
            let animateCallback: ((time: number, frame?: XRFrame) => void) | null = null;
            
            jest.spyOn(result.renderer, "setAnimationLoop").mockImplementation((callback) => {
                animateCallback = callback;
            });

            // Act
            result.startAnimationLoop(onRenderMock);
            // Simulate one frame
            if (animateCallback) {
                (animateCallback as (time: number) => void)(0);
            }

            // Assert
            expect(onRenderMock).toHaveBeenCalledWith(expect.any(Number));

            // Cleanup
            result.dispose();
        });
    });
});
