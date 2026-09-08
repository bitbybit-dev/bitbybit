import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ThreeJSScene, InitThreeJSResult } from "../../inputs/threejs-scene-inputs";
import { hexToRgb } from "../../__mocks__/test-helpers";
vi.mock("three", async () => {
    const { createThreeJSMock } = await vi.importActual<typeof import("../../__mocks__/threejs.mock")>("../../__mocks__/threejs.mock");
    return createThreeJSMock();
});

vi.mock("./orbit-camera", async () => {
    const { createMockOrbitCameraResult } = await vi.importActual<typeof import("../../__mocks__/threejs.mock")>("../../__mocks__/threejs.mock");
    return {
        createOrbitCamera: vi.fn().mockReturnValue(createMockOrbitCameraResult()),
    };
});

import { initThreeJS } from "./scene-helper";

describe("initThreeJS unit tests", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
        mockCanvas = document.createElement("canvas");
        mockCanvas.id = "test-canvas";
        document.body.appendChild(mockCanvas);

        Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
        Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });
        Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true });
    });

    afterEach(() => {
        if (mockCanvas && mockCanvas.parentNode) {
            mockCanvas.parentNode.removeChild(mockCanvas);
        }
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
            const result = initThreeJS();

            // Assert
            expect(result.scene).toBeDefined();
            expect(result.renderer).toBeDefined();
            expect(result.hemisphereLight).toBeDefined();
            expect(result.directionalLight).toBeDefined();
            expect(result.ground).toBeDefined();
            expect(typeof result.startAnimationLoop).toBe("function");
            expect(typeof result.dispose).toBe("function");

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

            expect(result.renderer.domElement).not.toBe(mockCanvas);
            expect(result.renderer.domElement.style.width).toBe("100%");
            expect(result.renderer.domElement.style.height).toBe("100%");
            expect(result.renderer.domElement.style.display).toBe("block");

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
            expect(result.renderer.shadowMap.type).toBe(2);
            expect(result.directionalLight.castShadow).toBe(true);

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
            const expectedHeight = config.sceneSize * 0.75;
            const expectedOffset = config.sceneSize * 0.5;
            expect(result.hemisphereLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.x).toBeCloseTo(expectedOffset, 5);
            expect(result.directionalLight.position.y).toBeCloseTo(expectedHeight, 5);
            expect(result.directionalLight.position.z).toBeCloseTo(expectedOffset, 5);

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
            const expectedSize = config.sceneSize * config.groundScaleFactor;
            expect(geometry.parameters.width).toBe(expectedSize);
            expect(geometry.parameters.height).toBe(expectedSize);

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

            result.dispose();
        });
    });

    describe("dispose method", () => {
        it("should remove window resize event listener on dispose", () => {
            // Arrange
            const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
            const result = initThreeJS();

            // Act
            result.dispose();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it("should stop animation loop on dispose", () => {
            // Arrange
            const result = initThreeJS();
            const setAnimationLoopSpy = vi.spyOn(result.renderer, "setAnimationLoop");

            // Act
            result.dispose();

            // Assert
            expect(setAnimationLoopSpy).toHaveBeenCalledWith(null);
        });

        it("should dispose renderer on cleanup", () => {
            // Arrange
            const result = initThreeJS();
            const disposeSpy = vi.spyOn(result.renderer, "dispose");

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
            const geometryDisposeSpy = vi.spyOn(ground.geometry, "dispose");
            const materialDisposeSpy = vi.spyOn(ground.material, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(geometryDisposeSpy).toHaveBeenCalled();
            expect(materialDisposeSpy).toHaveBeenCalled();
        });

        it("should remove lights from scene on dispose", () => {
            // Arrange
            const result = initThreeJS();
            const sceneRemoveSpy = vi.spyOn(result.scene, "remove");

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

            expect(mockCanvas.parentNode).toBe(document.body);
        });
    });

    describe("startAnimationLoop method", () => {
        it("should set animation loop on renderer", () => {
            // Arrange
            const result = initThreeJS();
            const setAnimationLoopSpy = vi.spyOn(result.renderer, "setAnimationLoop");

            // Act
            result.startAnimationLoop();

            // Assert
            expect(setAnimationLoopSpy).toHaveBeenCalledWith(expect.any(Function));

            result.dispose();
        });

        it("should call onRender callback when provided", () => {
            // Arrange
            const result = initThreeJS();
            const onRenderMock = vi.fn();
            let animateCallback: XRFrameRequestCallback | null = null;

            vi.spyOn(result.renderer, "setAnimationLoop").mockImplementation((callback) => {
                animateCallback = callback;
            });

            // Act
            result.startAnimationLoop(onRenderMock);
            if (animateCallback) {
                (animateCallback as (time: number) => void)(0);
            }

            // Assert
            expect(onRenderMock).toHaveBeenCalledWith(expect.any(Number));

            result.dispose();
        });
    });

    describe("frame delta measurement", () => {
        const SIXTY_HZ_DELTA = 1 / 60;

        const runFrames = (
            result: InitThreeJSResult,
            frameTimesMs: number[]
        ): { onRenderDeltas: number[]; cameraDeltas: number[] } => {
            const orbitCamera = result.orbitCamera;
            if (!orbitCamera) {
                throw new Error("these tests need the orbit camera enabled");
            }
            const updateSpy = vi.spyOn(orbitCamera, "update");

            let captured: XRFrameRequestCallback | null = null;
            vi.spyOn(result.renderer, "setAnimationLoop").mockImplementation((callback) => {
                captured = callback;
            });

            const onRenderDeltas: number[] = [];
            result.startAnimationLoop((delta) => onRenderDeltas.push(delta));

            const animate = captured as ((time: number) => void) | null;
            if (!animate) {
                throw new Error("startAnimationLoop registered no frame callback");
            }
            frameTimesMs.forEach((timeMs) => animate(timeMs));

            const cameraDeltas = updateSpy.mock.calls.map((call) => call[0]);
            updateSpy.mockRestore();
            return { onRenderDeltas, cameraDeltas };
        };

        const deltaAt = (deltas: number[], index: number): number => {
            const delta = deltas[index];
            if (delta === undefined) {
                throw new Error(`no frame delta was recorded at index ${index}`);
            }
            return delta;
        };

        it("should give the first frame a 60Hz delta rather than zero or the raw timestamp", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1234567]);

            // Assert
            expect(onRenderDeltas).toHaveLength(1);
            expect(deltaAt(onRenderDeltas, 0)).toBeCloseTo(SIXTY_HZ_DELTA, 10);

            result.dispose();
        });

        it("should measure the real interval of a 120Hz display", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1000, 1008.3333333, 1016.6666666]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(0.0083333333, 8);
            expect(deltaAt(onRenderDeltas, 2)).toBeCloseTo(0.0083333333, 8);
            expect(deltaAt(onRenderDeltas, 1)).not.toBeCloseTo(0.016, 4);

            result.dispose();
        });

        it("should measure the real interval of a 30Hz display", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1000, 1033.3333333, 1066.6666666]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(0.0333333333, 8);
            expect(deltaAt(onRenderDeltas, 2)).toBeCloseTo(0.0333333333, 8);

            result.dispose();
        });

        it("should clamp the gap a backgrounded tab returns with to six 60Hz frames", () => {
            // Arrange
            const result = initThreeJS();

            const { onRenderDeltas } = runFrames(result, [1000, 6000]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(6 / 60, 10);

            result.dispose();
        });

        it("should keep measuring from the real timestamp after a clamped gap", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1000, 6000, 6020]);

            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(6 / 60, 10);
            expect(deltaAt(onRenderDeltas, 2)).toBeCloseTo(0.02, 10);

            result.dispose();
        });

        it("should give a 60Hz delta when two frames carry the same timestamp", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1000, 1000]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(SIXTY_HZ_DELTA, 10);

            result.dispose();
        });

        it("should never report a negative delta when a timestamp goes backwards", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas } = runFrames(result, [1000, 900]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(SIXTY_HZ_DELTA, 10);
            expect(deltaAt(onRenderDeltas, 1)).toBeGreaterThan(0);

            result.dispose();
        });

        it("should give a 60Hz delta when a frame carries a non-finite timestamp", () => {
            // Arrange
            const result = initThreeJS();

            const { onRenderDeltas } = runFrames(result, [1000, NaN, 1050]);

            // Assert
            expect(deltaAt(onRenderDeltas, 1)).toBeCloseTo(SIXTY_HZ_DELTA, 10);
            expect(deltaAt(onRenderDeltas, 2)).toBeCloseTo(SIXTY_HZ_DELTA, 10);
            expect(onRenderDeltas.every((delta) => Number.isFinite(delta))).toBe(true);

            result.dispose();
        });

        it("should give the orbit camera the same delta the onRender callback receives", () => {
            // Arrange
            const result = initThreeJS();

            // Act
            const { onRenderDeltas, cameraDeltas } = runFrames(result, [1000, 1020, 1045]);

            // Assert
            expect(cameraDeltas).toEqual(onRenderDeltas);
            expect(deltaAt(cameraDeltas, 0)).toBeCloseTo(SIXTY_HZ_DELTA, 10);
            expect(deltaAt(cameraDeltas, 1)).toBeCloseTo(0.02, 10);
            expect(deltaAt(cameraDeltas, 2)).toBeCloseTo(0.025, 10);

            result.dispose();
        });

        it("should treat the first frame of a restarted loop as a first frame again", () => {
            // Arrange
            const result = initThreeJS();
            runFrames(result, [1000, 1020]);

            const restarted = runFrames(result, [90000]);

            // Assert
            expect(deltaAt(restarted.onRenderDeltas, 0)).toBeCloseTo(SIXTY_HZ_DELTA, 10);

            result.dispose();
        });
    });
});
