import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { GUI3DManager, NearMenu, TouchHolographicButton } from "@babylonjs/gui";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonWebXRSimple } from "./simple";
import * as Inputs from "../../../inputs";

type FeatureEnabler = { enableFeature: (...args: never[]) => unknown };

const baseExperienceStandIn = (
    featuresManager: FeatureEnabler,
    exitXRAsync?: () => Promise<void>,
): BABYLON.WebXRExperienceHelper => {
    const stand: Partial<BABYLON.WebXRExperienceHelper> = {};
    Object.assign(stand, { featuresManager });
    if (exitXRAsync) {
        stand.exitXRAsync = exitXRAsync;
    }
    return stand as BABYLON.WebXRExperienceHelper;
};

const enableFeature = vi.fn();
const exitXR = vi.fn(() => Promise.resolve());
const disposeExperience = vi.fn();

const experienceFor = (): BABYLON.WebXRDefaultExperience => {
    const stand: Partial<BABYLON.WebXRDefaultExperience> = {
        input: {} as BABYLON.WebXRInput,
        baseExperience: baseExperienceStandIn({ enableFeature }, exitXR),
        dispose: disposeExperience,
    };
    return stand as BABYLON.WebXRDefaultExperience;
};

describe("BabylonWebXRSimple", () => {
    let headless: HeadlessScene;
    let service: BabylonWebXRSimple;
    let experience: BABYLON.WebXRDefaultExperience;
    let enterXR: Mock<(options?: BABYLON.WebXRDefaultExperienceOptions) => Promise<BABYLON.WebXRDefaultExperience>>;

    beforeEach(() => {
        enableFeature.mockClear();
        exitXR.mockClear();
        disposeExperience.mockClear();
        headless = createHeadlessScene();
        service = new BabylonWebXRSimple(headless.context);
        experience = experienceFor();
        enterXR = vi.fn(() => Promise.resolve(experience));
        headless.scene.createDefaultXRExperienceAsync = enterXR;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        headless.dispose();
    });

    describe("createImmersiveARExperience", () => {
        it("should enter an augmented reality session where the device supports one", async () => {
            // Arrange
            vi.spyOn(BABYLON.WebXRSessionManager, "IsSessionSupportedAsync").mockResolvedValue(true);

            // Act
            const result = await service.createImmersiveARExperience();

            // Assert
            expect(result).toBe(experience);
        });

        it("should ask for an augmented reality session standing on the floor", async () => {
            // Arrange
            vi.spyOn(BABYLON.WebXRSessionManager, "IsSessionSupportedAsync").mockResolvedValue(true);

            // Act
            await service.createImmersiveARExperience();

            // Assert
            const options = enterXR.mock.calls[0]![0] as BABYLON.WebXRDefaultExperienceOptions;
            expect(options.uiOptions).toEqual({ sessionMode: "immersive-ar", referenceSpaceType: "local-floor" });
            expect(options.optionalFeatures).toBe(true);
        });

        it("should say so plainly where the device supports no augmented reality", async () => {
            // Arrange
            vi.spyOn(BABYLON.WebXRSessionManager, "IsSessionSupportedAsync").mockResolvedValue(false);

            // Act
            const act = service.createImmersiveARExperience();

            // Assert
            await expect(act).rejects.toThrow("AR is not supported on this device.");
        });
    });

    describe("createDefaultXRExperienceWithTeleportationReturn", () => {
        const groundFor = (): BABYLON.Mesh => {
            const ground = new BABYLON.Mesh("ground", headless.scene);
            const tile = BABYLON.MeshBuilder.CreateGround("tile", { width: 4, height: 4 }, headless.scene);
            tile.parent = ground;
            tile.isPickable = false;
            ground.isPickable = false;
            return ground;
        };

        it("should keep the session on the scene so the rest of the library can find it", async () => {
            // Act
            const result = await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([groundFor()]));

            // Assert
            expect(headless.scene.metadata.xr).toBe(experience);
            expect(result.xr).toBe(experience);
        });

        it("should start the scene's metadata off where it had none", async () => {
            // Arrange
            headless.scene.metadata = null;

            // Act
            await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));

            // Assert
            expect(headless.scene.metadata.xr).toBe(experience);
        });

        it("should make every ground mesh and every child of one able to be teleported onto", async () => {
            // Arrange
            const ground = groundFor();

            // Act
            await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([ground]));

            // Assert
            expect(ground.isPickable).toBe(true);
            expect(ground.getChildMeshes()[0]!.isPickable).toBe(true);
        });

        it("should turn teleportation on over exactly those meshes", async () => {
            // Arrange
            const ground = groundFor();

            // Act
            await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([ground]));

            // Assert
            const [feature, , options] = enableFeature.mock.calls[0]!;
            expect(feature).toBe(BABYLON.WebXRFeatureName.TELEPORTATION);
            expect(options.floorMeshes).toEqual([ground.getChildMeshes()[0], ground]);
            expect(options.xrInput).toBe(experience.input);
        });

        it("should give the teleportation marker a material of its own", async () => {
            // Act
            const result = await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));

            // Assert
            expect(result.torusMat).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            expect(result.torusMat.baseColor.equals(new BABYLON.Color3(0, 0, 1))).toBe(true);
            expect(result.torusMat.metallic).toBe(0);
            expect(result.torusMat.roughness).toBe(1);
        });

        it("should put a menu into the scene with a way out of the session on it", async () => {
            // Act
            const result = await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));

            // Assert
            expect(result.manager).toBeInstanceOf(GUI3DManager);
            expect(result.near).toBeInstanceOf(NearMenu);
            expect(result.button).toBeInstanceOf(TouchHolographicButton);
            expect(result.text.text).toBe("Exit VR");
            expect(headless.scene.metadata.guiManager).toBe(result.manager);
        });

        it("should leave the session when the way out is pressed", async () => {
            // Arrange
            const result = await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));

            // Act
            result.button.onPointerClickObservable.notifyObservers(
                Object.assign(new BABYLON.Vector3(), { buttonIndex: 0 }));

            // Assert
            expect(exitXR).toHaveBeenCalled();
        });

        it("should hand back one call that takes the whole session away again", async () => {
            // Arrange
            const result = await service.createDefaultXRExperienceWithTeleportationReturn(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));
            const disposedMaterial = vi.spyOn(result.torusMat, "dispose");
            const disposedMenu = vi.spyOn(result.near, "dispose");

            // Act
            result.dispose();

            // Assert
            expect(disposeExperience).toHaveBeenCalled();
            expect(disposedMaterial).toHaveBeenCalled();
            expect(disposedMenu).toHaveBeenCalled();
        });
    });

    describe("createDefaultXRExperienceWithTeleportation", () => {
        it("should build the same session without handing anything back", async () => {
            // Act
            const result = await service.createDefaultXRExperienceWithTeleportation(
                new Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto([]));

            // Assert
            expect(result).toBeUndefined();
            expect(headless.scene.metadata.xr).toBe(experience);
        });
    });
});
