import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonWebXRBase } from "./base";
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

describe("BabylonWebXRBase", () => {
    let headless: HeadlessScene;
    let service: BabylonWebXRBase;
    let experience: BABYLON.WebXRDefaultExperience;
    let enterXR: Mock<(options?: BABYLON.WebXRDefaultExperienceOptions) => Promise<BABYLON.WebXRDefaultExperience>>;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonWebXRBase(headless.context);
        const stand: Partial<BABYLON.WebXRDefaultExperience> = {
            baseExperience: baseExperienceStandIn({ enableFeature: vi.fn() }),
        };
        experience = stand as BABYLON.WebXRDefaultExperience;
        enterXR = vi.fn(() => Promise.resolve(experience));
        headless.scene.createDefaultXRExperienceAsync = enterXR;
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createDefaultXRExperienceAsync", () => {
        it("should hand back the experience the scene entered", async () => {
            // Act
            const result = await service.createDefaultXRExperienceAsync(
                new Inputs.BabylonWebXR.WebXRDefaultExperienceOptions());

            // Assert
            expect(result).toBe(experience);
        });

        it("should pass on a request to hide the default interface", async () => {
            // Act
            await service.createDefaultXRExperienceAsync(
                new Inputs.BabylonWebXR.WebXRDefaultExperienceOptions(true));

            // Assert
            expect(enterXR).toHaveBeenCalledWith({ disableDefaultUI: true });
        });

        it("should ask for nothing in particular when it was told nothing", async () => {
            // Arrange
            const inputs = new Inputs.BabylonWebXR.WebXRDefaultExperienceOptions();
            inputs.disableDefaultUI = undefined;

            // Act
            await service.createDefaultXRExperienceAsync(inputs);

            // Assert
            expect(enterXR).toHaveBeenCalledWith({});
        });
    });

    describe("createDefaultXRExperienceNoOptionsAsync", () => {
        it("should enter XR without asking for anything at all", async () => {
            // Act
            const result = await service.createDefaultXRExperienceNoOptionsAsync();

            // Assert
            expect(result).toBe(experience);
            expect(enterXR).toHaveBeenCalledWith();
        });
    });

    describe("the objects a script reaches through", () => {
        it("should hand out the base experience of a session", () => {
            // Assert
            expect(service.getBaseExperience(new Inputs.BabylonWebXR.WebXRDefaultExperienceDto(experience)))
                .toBe(experience.baseExperience);
        });

        it("should hand out the feature manager of a base experience", () => {
            // Assert
            expect(service.getFeatureManager(
                new Inputs.BabylonWebXR.WebXRExperienceHelperDto(experience.baseExperience)))
                .toBe(experience.baseExperience.featuresManager);
        });
    });
});
