import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiContainer } from "./container";
import * as Inputs from "../../../inputs";

describe("BabylonGuiContainer", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiContainer;
    let container: BABYLON.GUI.StackPanel;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiContainer(headless.context);
        container = new BABYLON.GUI.StackPanel("panel");
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("addControls", () => {
        it("should add every control it was given", () => {
            // Arrange
            const first = new BABYLON.GUI.TextBlock("first", "a");
            const second = new BABYLON.GUI.TextBlock("second", "b");

            // Act
            const result = service.addControls(new Inputs.BabylonGui.AddControlsToContainerDto(container, [first, second]));

            // Assert
            expect(result.children).toEqual([first, second]);
        });

        it("should keep what the container already held when it was not asked to clear", () => {
            // Arrange
            const existing = new BABYLON.GUI.TextBlock("existing", "a");
            container.addControl(existing);

            // Act
            service.addControls(new Inputs.BabylonGui.AddControlsToContainerDto(
                container, [new BABYLON.GUI.TextBlock("added", "b")], false));

            // Assert
            expect(container.children).toHaveLength(2);
            expect(container.children[0]).toBe(existing);
        });

        it("should empty the container first when it was asked to clear", () => {
            // Arrange
            container.addControl(new BABYLON.GUI.TextBlock("existing", "a"));
            const added = new BABYLON.GUI.TextBlock("added", "b");

            // Act
            service.addControls(new Inputs.BabylonGui.AddControlsToContainerDto(container, [added], true));

            // Assert
            expect(container.children).toEqual([added]);
        });

        it("should hand the container back", () => {
            // Act
            const result = service.addControls(new Inputs.BabylonGui.AddControlsToContainerDto(container, []));

            // Assert
            expect(result).toBe(container);
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the background", () => {
            // Act
            service.setBackground(new Inputs.BabylonGui.SetContainerBackgroundDto(container, "#101010"));

            // Assert
            expect(service.getBackground(new Inputs.BabylonGui.ContainerDto(container))).toBe("#101010");
        });

        it("should set and read the readonly flag", () => {
            // Act
            service.setIsReadonly(new Inputs.BabylonGui.SetContainerIsReadonlyDto(container, true));

            // Assert
            expect(service.getIsReadonly(new Inputs.BabylonGui.ContainerDto(container))).toBe(true);
        });

        it("should hand the container back from every writer", () => {
            // Assert
            expect(service.setBackground(new Inputs.BabylonGui.SetContainerBackgroundDto(container, "#fff"))).toBe(container);
            expect(service.setIsReadonly(new Inputs.BabylonGui.SetContainerIsReadonlyDto(container, false))).toBe(container);
        });
    });
});
