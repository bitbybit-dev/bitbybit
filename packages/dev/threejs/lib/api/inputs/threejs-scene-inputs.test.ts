import { ThreeJSScene } from "./threejs-scene-inputs";

describe("ThreeJSScene DTO unit tests", () => {
    describe("InitThreeJSDto", () => {
        it("should set properties from constructor parameters", () => {
            // Arrange
            const canvasId = "my-canvas";
            const sceneSize = 500;
            const backgroundColor = "#ff0000";
            const enableShadows = false;
            const enableGround = false;
            const groundCenter = [1, 2, 3] as [number, number, number];
            const groundScaleFactor = 3;
            const groundColor = "#00ff00";
            const groundOpacity = 0.5;
            const hemisphereLightSkyColor = "#0000ff";
            const hemisphereLightGroundColor = "#ff00ff";
            const hemisphereLightIntensity = 2;
            const directionalLightColor = "#ffff00";
            const directionalLightIntensity = 3;
            const shadowMapSize = 4096;

            // Act
            const result = new ThreeJSScene.InitThreeJSDto(
                canvasId,
                sceneSize,
                backgroundColor,
                enableShadows,
                enableGround,
                groundCenter,
                groundScaleFactor,
                groundColor,
                groundOpacity,
                hemisphereLightSkyColor,
                hemisphereLightGroundColor,
                hemisphereLightIntensity,
                directionalLightColor,
                directionalLightIntensity,
                shadowMapSize
            );

            // Assert
            expect(result.canvasId).toBe("my-canvas");
            expect(result.sceneSize).toBe(500);
            expect(result.backgroundColor).toBe("#ff0000");
            expect(result.enableShadows).toBe(false);
            expect(result.enableGround).toBe(false);
            expect(result.groundCenter).toEqual([1, 2, 3]);
            expect(result.groundScaleFactor).toBe(3);
            expect(result.groundColor).toBe("#00ff00");
            expect(result.groundOpacity).toBe(0.5);
            expect(result.hemisphereLightSkyColor).toBe("#0000ff");
            expect(result.hemisphereLightGroundColor).toBe("#ff00ff");
            expect(result.hemisphereLightIntensity).toBe(2);
            expect(result.directionalLightColor).toBe("#ffff00");
            expect(result.directionalLightIntensity).toBe(3);
            expect(result.shadowMapSize).toBe(4096);
        });

        it("should have correct default values when no parameters are provided", () => {
            // Arrange & Act
            const result = new ThreeJSScene.InitThreeJSDto();

            // Assert
            expect(result.canvasId).toBeUndefined();
            expect(result.sceneSize).toBe(20);
            expect(result.backgroundColor).toBe("#1a1c1f");
            expect(result.enableShadows).toBe(true);
            expect(result.enableGround).toBe(true);
            expect(result.groundCenter).toEqual([0, 0, 0]);
            expect(result.groundScaleFactor).toBe(2);
            expect(result.groundColor).toBe("#333333");
            expect(result.groundOpacity).toBe(1);
            expect(result.hemisphereLightSkyColor).toBe("#ffffff");
            expect(result.hemisphereLightGroundColor).toBe("#444444");
            expect(result.hemisphereLightIntensity).toBe(1);
            expect(result.directionalLightColor).toBe("#ffffff");
            expect(result.directionalLightIntensity).toBe(1.5);
            expect(result.shadowMapSize).toBe(2048);
        });
    });
});
