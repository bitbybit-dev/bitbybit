import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiStackPanel } from "./stack-panel";
import * as Inputs from "../../../inputs";

describe("BabylonGuiStackPanel", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiStackPanel;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiStackPanel(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const panelFor = (adjust: (inputs: Inputs.BabylonGui.CreateStackPanelDto) => void = () => undefined): BABYLON.GUI.StackPanel => {
        const inputs = new Inputs.BabylonGui.CreateStackPanelDto("panel", true, 5);
        adjust(inputs);
        return service.createStackPanel(inputs);
    };

    describe("createStackPanel", () => {
        it("should carry the name, direction and spacing it was given", () => {
            // Act
            const panel = panelFor();

            // Assert
            expect(panel.name).toBe("panel");
            expect(panel.isVertical).toBe(true);
            expect(panel.spacing).toBe(5);
        });

        it("should carry the colours it was given", () => {
            // Act
            const panel = panelFor((inputs) => { inputs.color = "#ffffff"; inputs.background = "#00000055"; });

            // Assert
            expect(panel.color).toBe("#ffffff");
            expect(panel.background).toBe("#00000055");
        });

        it("should span the space it is given when no width was asked for", () => {
            // Act
            const panel = panelFor();

            // Assert
            expect(panel.width).toBe("100%");
        });

        it("should take a size of its own over the default", () => {
            // Act
            const panel = panelFor((inputs) => { inputs.width = "250px"; inputs.height = "400px"; });

            // Assert
            expect(panel.width).toBe("250px");
            expect(panel.height).toBe("400px");
        });

        it("should let go of the controls it holds when it is disposed of", () => {
            // Arrange
            const panel = panelFor();
            panel.addControl(new BABYLON.GUI.TextBlock("child", "a"));

            // Act
            panel.dispose();

            // Assert
            expect(panel.children).toHaveLength(0);
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the direction", () => {
            // Arrange
            const panel = panelFor();

            // Act
            service.setIsVertical(new Inputs.BabylonGui.SetStackPanelIsVerticalDto(panel, false));

            // Assert
            expect(service.getIsVertical(new Inputs.BabylonGui.StackPanelDto(panel))).toBe(false);
        });

        it("should set and read the spacing", () => {
            // Arrange
            const panel = panelFor();

            // Act
            service.setSpacing(new Inputs.BabylonGui.SetStackPanelSpacingDto(panel, 12));

            // Assert
            expect(service.getSpacing(new Inputs.BabylonGui.StackPanelDto(panel))).toBe(12);
        });

        it("should set and read the width", () => {
            // Arrange
            const panel = panelFor();

            // Act
            service.setWidth(new Inputs.BabylonGui.SetStackPanelWidthDto(panel, "180px"));

            // Assert
            expect(service.getWidth(new Inputs.BabylonGui.StackPanelDto(panel))).toBe("180px");
        });

        it("should set and read the height", () => {
            // Arrange
            const panel = panelFor();

            // Act
            service.setHeight(new Inputs.BabylonGui.SetStackPanelHeightDto(panel, "220px"));

            // Assert
            expect(service.getHeight(new Inputs.BabylonGui.StackPanelDto(panel))).toBe("220px");
        });

        it("should hand the panel back from every writer", () => {
            // Arrange
            const panel = panelFor();

            // Assert
            expect(service.setIsVertical(new Inputs.BabylonGui.SetStackPanelIsVerticalDto(panel, true))).toBe(panel);
            expect(service.setSpacing(new Inputs.BabylonGui.SetStackPanelSpacingDto(panel, 0))).toBe(panel);
            expect(service.setWidth(new Inputs.BabylonGui.SetStackPanelWidthDto(panel, "10px"))).toBe(panel);
            expect(service.setHeight(new Inputs.BabylonGui.SetStackPanelHeightDto(panel, "10px"))).toBe(panel);
        });
    });
});
