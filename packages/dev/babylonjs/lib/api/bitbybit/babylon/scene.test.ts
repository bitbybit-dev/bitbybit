import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import { BabylonScene } from "./scene";
import * as Inputs from "../../inputs";

const A_COLOUR = "#ff0000";
const A_POSITION: Inputs.Base.Point3 = [1, 2, 3];
const A_DIRECTION: Inputs.Base.Vector3 = [0, -1, 0];

describe("BabylonScene", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let context: Context;
    let sceneService: BabylonScene;
    let canvas: HTMLCanvasElement;

    const pointLight = (adjust: (inputs: Inputs.BabylonScene.PointLightDto) => void = () => undefined): Inputs.BabylonScene.PointLightDto => {
        const inputs = new Inputs.BabylonScene.PointLightDto(A_POSITION, 1, A_COLOUR, A_COLOUR, 0.1, 512, false);
        adjust(inputs);
        return inputs;
    };

    const directionalLight = (adjust: (inputs: Inputs.BabylonScene.DirectionalLightDto) => void = () => undefined): Inputs.BabylonScene.DirectionalLightDto => {
        const inputs = new Inputs.BabylonScene.DirectionalLightDto(A_DIRECTION, 1, A_COLOUR, A_COLOUR, 512, false);
        adjust(inputs);
        return inputs;
    };

    beforeEach(() => {
        canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        engine = new BABYLON.NullEngine();
        vi.spyOn(engine, "getRenderingCanvas").mockReturnValue(canvas);
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        new BABYLON.TransformNode("root", scene);
        context = new Context();
        context.scene = scene;
        sceneService = new BabylonScene(context);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
        canvas.remove();
        vi.restoreAllMocks();
    });

    describe("getScene", () => {
        it("should hand back the scene the context holds", () => {
            expect(sceneService.getScene()).toBe(scene);
        });
    });

    describe("setAndAttachScene", () => {
        it("should take the scene it was given as the one in use", () => {
            // Arrange
            const other = new BABYLON.Scene(engine);

            // Act
            const result = sceneService.setAndAttachScene(new Inputs.BabylonScene.SceneDto(other));

            // Assert
            expect(result).toBe(other);
            expect(context.scene).toBe(other);
        });

        it("should give the new scene somewhere to record its shadow generators", () => {
            // Arrange
            const other = new BABYLON.Scene(engine);

            // Act
            sceneService.setAndAttachScene(new Inputs.BabylonScene.SceneDto(other));

            // Assert
            expect(other.metadata).toEqual({ shadowGenerators: [] });
        });
    });

    describe("activateCamera", () => {
        it("should make the camera it was given the active one", () => {
            // Arrange
            const camera = new BABYLON.FreeCamera("second", BABYLON.Vector3.Zero(), scene);

            // Act
            sceneService.activateCamera(new Inputs.BabylonScene.ActiveCameraDto(camera));

            // Assert
            expect(scene.activeCamera).toBe(camera);
        });
    });

    describe("useRightHandedSystem", () => {
        it("should switch the scene to a right handed system", () => {
            // Act
            sceneService.useRightHandedSystem(new Inputs.BabylonScene.UseRightHandedSystemDto(true));

            // Assert
            expect(scene.useRightHandedSystem).toBe(true);
        });
    });

    describe("drawPointLight", () => {
        it("should add a light to the scene at the position it was given", () => {
            // Act
            const light = sceneService.drawPointLight(pointLight());

            // Assert
            expect(light.position.asArray()).toEqual(A_POSITION);
            expect(scene.lights).toContain(light);
        });

        it("should give the light the colour and intensity it was asked for", () => {
            // Act
            const light = sceneService.drawPointLight(pointLight((inputs) => { inputs.intensity = 3; }));

            // Assert
            expect(light.intensity).toBe(3);
            expect(light.diffuse.toHexString()).toBe("#FF0000");
        });

        it("should not cast shadows unless it was asked to", () => {
            // Act
            sceneService.drawPointLight(pointLight());

            // Assert
            expect(sceneService.getShadowGenerators()).toEqual([]);
        });

        it("should build a shadow generator when it was asked to cast shadows", () => {
            // Act
            sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));

            // Assert
            expect(sceneService.getShadowGenerators()).toHaveLength(1);
        });

        it("should give the shadow generator the settings it was given", () => {
            // Act
            sceneService.drawPointLight(pointLight((inputs) => {
                inputs.enableShadows = true;
                inputs.shadowDarkness = 0.4;
                inputs.shadowBias = 0.002;
            }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.darkness).toBe(0.4);
            expect(generator!.bias).toBe(0.002);
        });

        it("should let shadows fall through transparent surfaces when asked", () => {
            // Act
            sceneService.drawPointLight(pointLight((inputs) => {
                inputs.enableShadows = true;
                inputs.transparencyShadow = true;
            }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.transparencyShadow).toBe(true);
        });
    });

    describe("drawPointLightNoReturn", () => {
        it("should add the light without handing it back", () => {
            // Act
            const result = sceneService.drawPointLightNoReturn(pointLight());

            // Assert
            expect(result).toBeUndefined();
            expect(scene.lights).toHaveLength(1);
        });
    });

    describe("drawDirectionalLight", () => {
        it("should add a light pointing the way it was given", () => {
            // Act
            const light = sceneService.drawDirectionalLight(directionalLight());

            // Assert
            expect(light.direction.asArray()).toEqual(A_DIRECTION);
            expect(scene.lights).toContain(light);
        });

        it("should build a shadow generator when it was asked to cast shadows", () => {
            // Act
            sceneService.drawDirectionalLight(directionalLight((inputs) => { inputs.enableShadows = true; }));

            // Assert
            expect(sceneService.getShadowGenerators()).toHaveLength(1);
        });
    });

    describe("drawDirectionalLightNoReturn", () => {
        it("should add the light without handing it back", () => {
            // Act
            const result = sceneService.drawDirectionalLightNoReturn(directionalLight());

            // Assert
            expect(result).toBeUndefined();
            expect(scene.lights).toHaveLength(1);
        });
    });

    describe("getShadowGenerators", () => {
        it("should give none for a scene that records none", () => {
            // Arrange
            scene.metadata = undefined;

            // Act & Assert
            expect(sceneService.getShadowGenerators()).toEqual([]);
        });
    });

    describe("getActiveCamera", () => {
        it("should hand back the camera the scene is looking through", () => {
            expect(sceneService.getActiveCamera()).toBe(scene.activeCamera);
        });
    });

    describe("adjustActiveArcRotateCamera", () => {
        const configuration = (adjust: (inputs: Inputs.BabylonScene.CameraConfigurationDto) => void = () => undefined): Inputs.BabylonScene.CameraConfigurationDto => {
            const inputs = new Inputs.BabylonScene.CameraConfigurationDto([0, 10, 20], [0, 0, 0]);
            adjust(inputs);
            return inputs;
        };

        it("should stand the camera where it was told and point it where it was told", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration());
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.position.asArray()).toEqual([0, 10, 20]);
            expect(camera.target.asArray()).toEqual([0, 0, 0]);
        });

        it("should set the radius to the distance between the two", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration());
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.radius).toBeCloseTo(Math.sqrt(500), 5);
        });

        it("should take the radius limits it was given", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration((inputs) => {
                inputs.lowerRadiusLimit = 2;
                inputs.upperRadiusLimit = 50;
            }));
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.lowerRadiusLimit).toBe(2);
            expect(camera.upperRadiusLimit).toBe(50);
        });

        it("should take the angle limits it was given, in radians", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration((inputs) => {
                inputs.lowerAlphaLimit = -90;
                inputs.upperAlphaLimit = 90;
                inputs.lowerBetaLimit = 10;
                inputs.upperBetaLimit = 170;
            }));
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.lowerAlphaLimit).toBeCloseTo(-Math.PI / 2, 5);
            expect(camera.upperAlphaLimit).toBeCloseTo(Math.PI / 2, 5);
            expect(camera.lowerBetaLimit).toBeCloseTo(10 * Math.PI / 180, 5);
            expect(camera.upperBetaLimit).toBeCloseTo(170 * Math.PI / 180, 5);
        });

        it("should turn a negative angle into the negative radians it names", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration((inputs) => { inputs.lowerAlphaLimit = -90; }));
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.lowerAlphaLimit).toBeCloseTo(-Math.PI / 2, 5);
        });

        it("should take the sensitivities and the far plane it was given", () => {
            // Act
            sceneService.adjustActiveArcRotateCamera(configuration((inputs) => {
                inputs.angularSensibilityX = 500;
                inputs.angularSensibilityY = 600;
                inputs.panningSensibility = 700;
                inputs.wheelPrecision = 8;
                inputs.maxZ = 5000;
            }));
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;

            // Assert
            expect(camera.angularSensibilityX).toBe(500);
            expect(camera.angularSensibilityY).toBe(600);
            expect(camera.panningSensibility).toBe(700);
            expect(camera.wheelPrecision).toBe(8);
            expect(camera.maxZ).toBe(5000);
        });

        it("should leave a limit alone when none was given", () => {
            // Arrange
            const camera = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;
            camera.lowerRadiusLimit = 3;

            // Act
            sceneService.adjustActiveArcRotateCamera(configuration());

            // Assert
            expect(camera.lowerRadiusLimit).toBe(3);
        });
    });

    describe("the pointer callbacks", () => {
        it("should hand the scene the function to call on a press", () => {
            // Arrange
            const inputs = new Inputs.BabylonScene.PointerDto();
            inputs.statement_update = () => undefined;

            // Act
            sceneService.onPointerDown(inputs);

            // Assert
            expect(scene.onPointerDown).toBe(inputs.statement_update);
        });

        it("should hand the scene the function to call on a release", () => {
            // Arrange
            const inputs = new Inputs.BabylonScene.PointerDto();
            inputs.statement_update = () => undefined;

            // Act
            sceneService.onPointerUp(inputs);

            // Assert
            expect(scene.onPointerUp).toBe(inputs.statement_update);
        });

        it("should hand the scene the function to call on a move", () => {
            // Arrange
            const inputs = new Inputs.BabylonScene.PointerDto();
            inputs.statement_update = () => undefined;

            // Act
            sceneService.onPointerMove(inputs);

            // Assert
            expect(scene.onPointerMove).toBe(inputs.statement_update);
        });
    });

    describe("fog", () => {
        const fogInputs = (mode: Inputs.Base.fogModeEnum): Inputs.BabylonScene.FogDto =>
            new Inputs.BabylonScene.FogDto(mode, A_COLOUR, 0.1, 10, 100);

        it("should turn the fog off", () => {
            // Act
            sceneService.fog(fogInputs(Inputs.Base.fogModeEnum.none));

            // Assert
            expect(scene.fogMode).toBe(BABYLON.Scene.FOGMODE_NONE);
        });

        it("should set exponential fog", () => {
            // Act
            sceneService.fog(fogInputs(Inputs.Base.fogModeEnum.exponential));

            // Assert
            expect(scene.fogMode).toBe(BABYLON.Scene.FOGMODE_EXP);
        });

        it("should set squared exponential fog", () => {
            // Act
            sceneService.fog(fogInputs(Inputs.Base.fogModeEnum.exponentialSquared));

            // Assert
            expect(scene.fogMode).toBe(BABYLON.Scene.FOGMODE_EXP2);
        });

        it("should set linear fog", () => {
            // Act
            sceneService.fog(fogInputs(Inputs.Base.fogModeEnum.linear));

            // Assert
            expect(scene.fogMode).toBe(BABYLON.Scene.FOGMODE_LINEAR);
        });

        it("should take the density, the range and the colour it was given", () => {
            // Act
            sceneService.fog(fogInputs(Inputs.Base.fogModeEnum.linear));

            // Assert
            expect(scene.fogDensity).toBe(0.1);
            expect(scene.fogStart).toBe(10);
            expect(scene.fogEnd).toBe(100);
            expect(scene.fogColor.toHexString()).toBe("#FF0000");
        });
    });

    describe("backgroundColour", () => {
        it("should clear the scene to the colour it was given", () => {
            // Act
            sceneService.backgroundColour(new Inputs.BabylonScene.SceneBackgroundColourDto(A_COLOUR));

            // Assert
            expect(scene.clearColor.toHexString()).toBe("#FF0000FF");
        });

        it("should take the page's own background off the canvas", () => {
            // Arrange
            canvas.style.backgroundImage = "url(old.png)";

            // Act
            sceneService.backgroundColour(new Inputs.BabylonScene.SceneBackgroundColourDto(A_COLOUR));

            // Assert
            expect(canvas.style.backgroundImage).toBe("none");
        });
    });

    describe("the canvas backgrounds", () => {
        it("should put a css background behind a transparent canvas", () => {
            // Act
            const style = sceneService.canvasCSSBackgroundImage(new Inputs.BabylonScene.SceneCanvasCSSBackgroundImageDto("url(bricks.png)"));

            // Assert
            expect(style.backgroundImage).toBe("url(bricks.png)");
            expect(canvas.style.backgroundImage).toBe("url(\"bricks.png\")");
            expect(scene.clearColor.a).toBe(0);
        });

        it("should write a two colour linear gradient", () => {
            // Act
            const style = sceneService.twoColorLinearGradientBackground(
                new Inputs.BabylonScene.SceneTwoColorLinearGradientDto("#ff0000", "#0000ff", Inputs.Base.gradientDirectionEnum.toBottom, 0, 100));

            // Assert
            expect(style.backgroundImage).toBe("linear-gradient(to bottom, #ff0000 0%, #0000ff 100%)");
        });

        it("should write a two colour radial gradient", () => {
            // Act
            const style = sceneService.twoColorRadialGradientBackground(
                new Inputs.BabylonScene.SceneTwoColorRadialGradientDto("#ff0000", "#0000ff", Inputs.Base.gradientPositionEnum.center, 0, 100, Inputs.Base.gradientShapeEnum.circle));

            // Assert
            expect(style.backgroundImage).toBe("radial-gradient(circle at center, #ff0000 0%, #0000ff 100%)");
        });

        it("should write a gradient through every colour it was given", () => {
            // Act
            const style = sceneService.multiColorLinearGradientBackground(
                new Inputs.BabylonScene.SceneMultiColorLinearGradientDto(["#ff0000", "#00ff00", "#0000ff"], [0, 50, 100], Inputs.Base.gradientDirectionEnum.toRight));

            // Assert
            expect(style).toEqual({ backgroundImage: "linear-gradient(to right, #ff0000 0%, #00ff00 50%, #0000ff 100%)" });
        });

        it("should refuse a linear gradient whose colours and stops do not line up", () => {
            // Arrange
            vi.spyOn(console, "warn").mockImplementation(() => undefined);

            // Act
            const style = sceneService.multiColorLinearGradientBackground(
                new Inputs.BabylonScene.SceneMultiColorLinearGradientDto(["#ff0000", "#00ff00"], [0], Inputs.Base.gradientDirectionEnum.toRight));

            // Assert
            expect(style).toEqual({ error: "Colors and stops arrays must have the same length" });
        });

        it("should write a radial gradient through every colour it was given", () => {
            // Act
            const style = sceneService.multiColorRadialGradientBackground(
                new Inputs.BabylonScene.SceneMultiColorRadialGradientDto(["#ff0000", "#0000ff"], [0, 100], Inputs.Base.gradientPositionEnum.center, Inputs.Base.gradientShapeEnum.ellipse));

            // Assert
            expect(style).toEqual({ backgroundImage: "radial-gradient(ellipse at center, #ff0000 0%, #0000ff 100%)" });
        });

        it("should refuse a radial gradient whose colours and stops do not line up", () => {
            // Arrange
            vi.spyOn(console, "warn").mockImplementation(() => undefined);

            // Act
            const style = sceneService.multiColorRadialGradientBackground(
                new Inputs.BabylonScene.SceneMultiColorRadialGradientDto(["#ff0000", "#00ff00"], [0], Inputs.Base.gradientPositionEnum.center, Inputs.Base.gradientShapeEnum.circle));

            // Assert
            expect(style).toEqual({ error: "Colors and stops arrays must have the same length" });
        });

        it("should put an image behind the canvas with every setting it was given", () => {
            // Act
            const style = sceneService.canvasBackgroundImage(new Inputs.BabylonScene.SceneCanvasBackgroundImageDto(
                "bricks.png",
                Inputs.Base.backgroundRepeatEnum.noRepeat,
                Inputs.Base.backgroundSizeEnum.cover,
                Inputs.Base.gradientPositionEnum.center,
                Inputs.Base.backgroundAttachmentEnum.fixed,
                Inputs.Base.backgroundOriginClipEnum.borderBox,
                Inputs.Base.backgroundOriginClipEnum.contentBox));

            // Assert
            expect(style.backgroundImage).toBe("url(bricks.png)");
            expect(style.backgroundRepeat).toBe("no-repeat");
            expect(canvas.style.backgroundSize).toBe("cover");
        });
    });

    describe("clearAllDrawn", () => {
        it("should leave the transform nodes empty rather than holding nothing", () => {
            scene.getTransformNodeByName("root")!.dispose();

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.transformNodes).toEqual([]);
        });

        it("should take every mesh out of the scene", () => {
            // Arrange
            BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.meshes).toEqual([]);
        });

        it("should turn the fog off again", () => {
            // Arrange
            scene.fogMode = BABYLON.Scene.FOGMODE_EXP;

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.fogMode).toBe(BABYLON.Scene.FOGMODE_NONE);
        });

        it("should put the scene back to a left handed system", () => {
            // Arrange
            scene.useRightHandedSystem = true;

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.useRightHandedSystem).toBe(false);
        });
    });
    describe("the meshes a shadow-casting light picks up", () => {
        const meshNamed = (name: string): BABYLON.Mesh => BABYLON.MeshBuilder.CreateBox(name, { size: 1 }, scene);

        it("should sign up every ordinary mesh already in the scene", () => {
            // Arrange
            const mesh = meshNamed("part");

            // Act
            sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.getShadowMap()!.renderList).toContain(mesh);
            expect(mesh.receiveShadows).toBe(true);
        });

        it.each([
            ["bitbybit-hdrSkyBox"],
            ["poi_marker"],
            ["dimension_text_3d_1"],
            ["bitbybit-ground"],
        ])("should leave the library's own %s out of the shadows", (name) => {
            // Arrange
            const mesh = meshNamed(name);

            // Act
            sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.getShadowMap()!.renderList).not.toContain(mesh);
        });

        it("should leave a mesh marked as casting no shadows out of the shadows", () => {
            // Arrange
            const mesh = meshNamed("part");
            mesh.metadata = { shadows: false };

            // Act
            sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.getShadowMap()!.renderList).not.toContain(mesh);
        });

        it("should do the same for a directional light", () => {
            // Arrange
            const mesh = meshNamed("part");
            meshNamed("bitbybit-ground");

            // Act
            sceneService.drawDirectionalLight(directionalLight((inputs) => { inputs.enableShadows = true; }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.getShadowMap()!.renderList).toContain(mesh);
            expect(generator!.getShadowMap()!.renderList).not.toContain(scene.getMeshByName("bitbybit-ground"));
        });

        it("should let shadows fall through transparent surfaces of a directional light when asked", () => {
            // Act
            sceneService.drawDirectionalLight(directionalLight((inputs) => {
                inputs.enableShadows = true;
                inputs.transparencyShadow = true;
            }));
            const [generator] = sceneService.getShadowGenerators();

            // Assert
            expect(generator!.transparencyShadow).toBe(true);
        });
    });

    describe("what a shadow-casting light takes with it when it goes", () => {
        it("should take its shadow generator off the scene when the light is disposed of", () => {
            // Arrange
            const light = sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));

            // Act
            light.dispose();

            // Assert
            expect(sceneService.getShadowGenerators()).toEqual([]);
        });

        it("should leave the other lights' generators alone", () => {
            // Arrange
            const first = sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));
            sceneService.drawDirectionalLight(directionalLight((inputs) => { inputs.enableShadows = true; }));

            // Act
            first.dispose();

            // Assert
            expect(sceneService.getShadowGenerators()).toHaveLength(1);
        });
    });

    describe("enableSkybox", () => {
        it.each([
            [Inputs.Base.skyboxEnum.default],
            [Inputs.Base.skyboxEnum.greyGradient],
            [Inputs.Base.skyboxEnum.clearSky],
            [Inputs.Base.skyboxEnum.city],
        ])("should put a skybox of the %s kind into the scene", (kind) => {
            // Act
            sceneService.enableSkybox(new Inputs.BabylonScene.SkyboxDto(kind, 100, 0.1, 1));

            // Assert
            expect(scene.getMeshByName("bitbybit-hdrSkyBox")).toBeTruthy();
        });

        it("should take the environment intensity it was given", () => {
            // Act
            sceneService.enableSkybox(new Inputs.BabylonScene.SkyboxDto(Inputs.Base.skyboxEnum.default, 100, 0.1, 0.4));

            // Assert
            expect(scene.environmentIntensity).toBe(0.4);
        });

        it("should keep the skybox out of sight when it was asked to", () => {
            // Act
            sceneService.enableSkybox(
                new Inputs.BabylonScene.SkyboxDto(Inputs.Base.skyboxEnum.default, 100, 0.1, 1, true));

            // Assert
            expect(scene.getMeshByName("bitbybit-hdrSkyBox")!.isVisible).toBe(false);
        });

        it("should replace the skybox already there rather than add a second", () => {
            // Arrange
            sceneService.enableSkybox(new Inputs.BabylonScene.SkyboxDto(Inputs.Base.skyboxEnum.default, 100, 0.1, 1));

            // Act
            sceneService.enableSkybox(new Inputs.BabylonScene.SkyboxDto(Inputs.Base.skyboxEnum.city, 100, 0.1, 1));

            // Assert
            expect(scene.meshes.filter(m => m.name === "bitbybit-hdrSkyBox")).toHaveLength(1);
        });
    });

    describe("enableSkyboxCustomTexture", () => {
        it.each([
            ["https://example.test/sky.env"],
            ["https://example.test/sky"],
            ["https://example.test/sky.env?v=2"],
        ])("should read the kind of texture out of the url %s", (url) => {
            // Act
            sceneService.enableSkyboxCustomTexture(
                new Inputs.BabylonScene.SkyboxCustomTextureDto(url, 256, 100, 0.1, 1));

            // Assert
            expect(scene.getMeshByName("bitbybit-hdrSkyBox")).toBeTruthy();
        });

        it("should do nothing at all when it was given no url", () => {
            // Act
            sceneService.enableSkyboxCustomTexture(new Inputs.BabylonScene.SkyboxCustomTextureDto());

            // Assert
            expect(scene.getMeshByName("bitbybit-hdrSkyBox")).toBeNull();
        });
    });

    describe("what else clearAllDrawn takes away", () => {
        it("should let go of the environment texture", () => {
            // Arrange
            sceneService.enableSkybox(new Inputs.BabylonScene.SkyboxDto(Inputs.Base.skyboxEnum.default, 100, 0.1, 1));

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.environmentTexture).toBeNull();
        });

        it("should take the materials and the textures with it", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
            mesh.material = new BABYLON.StandardMaterial("mat", scene);

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.materials).toEqual([]);
            expect(scene.textures).toEqual([]);
        });

        it("should take the geometries with it", () => {
            // Arrange
            BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.geometries).toEqual([]);
        });

        it("should take every light except the hemispheric one it is told to keep", () => {
            // Arrange
            new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
            sceneService.drawPointLight(pointLight());

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.lights.map(l => l.name)).toEqual(["HemiLight"]);
        });

        it("should take every transform node except the one everything hangs off", () => {
            // Arrange
            const root = scene.getTransformNodeByName("root")!;
            new BABYLON.TransformNode("other", scene);

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.transformNodes).toEqual([root]);
        });

        it("should take the shadow generators with it", () => {
            // Arrange
            sceneService.drawPointLight(pointLight((inputs) => { inputs.enableShadows = true; }));

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(sceneService.getShadowGenerators()).toEqual([]);
        });

        it("should put the default camera back where a script had swapped it", () => {
            // Arrange
            const other = new BABYLON.FreeCamera("mine", new BABYLON.Vector3(0, 0, -10), scene);
            scene.activeCamera = other;

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.activeCamera.name).toBe("Camera");
            expect(scene.activeCamera).toBeInstanceOf(BABYLON.ArcRotateCamera);
        });

        it("should leave the default camera where it is", () => {
            // Arrange
            const camera = scene.activeCamera!;

            // Act
            sceneService.clearAllDrawn();

            // Assert
            expect(scene.activeCamera).toBe(camera);
        });
    });
});
