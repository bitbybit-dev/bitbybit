import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiControl } from "./control";
import * as Inputs from "../../../inputs";

describe("BabylonGuiControl", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiControl;
    let host: BABYLON.GUI.AdvancedDynamicTexture;
    let control: BABYLON.GUI.TextBlock;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiControl(headless.context);
        host = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, headless.scene);
        control = new BABYLON.GUI.TextBlock("label", "hello");
        host.addControl(control);
    });

    afterEach(() => {
        host.dispose();
        headless.dispose();
    });

    describe("changeControlPadding", () => {
        it("should apply every padding it was given", () => {
            // Act
            const result = service.changeControlPadding(
                new Inputs.BabylonGui.PaddingLeftRightTopBottomDto(control, "1px", "2px", "3px", "4px"));

            // Assert
            expect(result.paddingLeft).toBe("1px");
            expect(result.paddingRight).toBe("2px");
            expect(result.paddingTop).toBe("3px");
            expect(result.paddingBottom).toBe("4px");
        });

        it("should leave a side alone when no padding was given for it", () => {
            // Arrange
            control.paddingLeft = "9px";
            const inputs = new Inputs.BabylonGui.PaddingLeftRightTopBottomDto(control);

            // Act
            const result = service.changeControlPadding(inputs);

            // Assert
            expect(result.paddingLeft).toBe("9px");
        });

        it("should hand the control back", () => {
            // Act
            const result = service.changeControlPadding(new Inputs.BabylonGui.PaddingLeftRightTopBottomDto(control));

            // Assert
            expect(result).toBe(control);
        });
    });

    describe("changeControlAlignment", () => {
        it.each([
            [Inputs.BabylonGui.horizontalAlignmentEnum.left, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT],
            [Inputs.BabylonGui.horizontalAlignmentEnum.right, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT],
            [Inputs.BabylonGui.horizontalAlignmentEnum.center, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER],
        ])("should align %s horizontally", (alignment, expected) => {
            // Act
            const result = service.changeControlAlignment(
                new Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.Control>(control, alignment));

            // Assert
            expect(result.horizontalAlignment).toBe(expected);
        });

        it.each([
            [Inputs.BabylonGui.verticalAlignmentEnum.top, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP],
            [Inputs.BabylonGui.verticalAlignmentEnum.bottom, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM],
            [Inputs.BabylonGui.verticalAlignmentEnum.center, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER],
        ])("should align %s vertically", (alignment, expected) => {
            // Act
            const result = service.changeControlAlignment(
                new Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.Control>(control, undefined, alignment));

            // Assert
            expect(result.verticalAlignment).toBe(expected);
        });
    });

    describe("cloneControl", () => {
        it("should produce a second control rather than return the first", () => {
            // Act
            const clone = service.cloneControl(new Inputs.BabylonGui.CloneControlDto(control, undefined, undefined, host));

            // Assert
            expect(clone).not.toBe(control);
            expect(clone).toBeInstanceOf(BABYLON.GUI.TextBlock);
        });

        it("should add the clone to a container when one was given", () => {
            // Arrange
            const panel = new BABYLON.GUI.StackPanel("panel");
            host.addControl(panel);

            // Act
            const clone = service.cloneControl(new Inputs.BabylonGui.CloneControlDto(control, panel, undefined, host));

            // Assert
            expect(panel.children).toContain(clone);
        });

        it("should rename the clone when a name was given", () => {
            // Act
            const clone = service.cloneControl(new Inputs.BabylonGui.CloneControlDto(control, undefined, "copy", host));

            // Assert
            expect(clone.name).toBe("copy");
        });

        it("should give the clone the default name where none was asked for", () => {
            // Act
            const clone = service.cloneControl(new Inputs.BabylonGui.CloneControlDto(control, undefined, undefined, host));

            // Assert
            expect(clone.name).toBe("clonedControl");
        });

        it("should keep the original's name where a script named nothing at all", () => {
            const inputs = new Inputs.BabylonGui.CloneControlDto(control, undefined, undefined, host);
            Object.assign(inputs, { name: undefined });

            // Act
            const clone = service.cloneControl(inputs);

            // Assert
            expect(clone.name).toBe("label");
        });
    });

    describe("getControlByName", () => {
        it("should find the control a container holds under that name", () => {
            // Arrange
            const panel = new BABYLON.GUI.StackPanel("panel");
            host.addControl(panel);
            panel.addControl(control);

            // Act
            const found = service.getControlByName(new Inputs.BabylonGui.GetControlByNameDto(panel, "label"));

            // Assert
            expect(found).toBe(control);
        });

        it("should find nothing when no child carries that name", () => {
            // Arrange
            const panel = new BABYLON.GUI.StackPanel("panel");
            host.addControl(panel);

            // Act
            const found = service.getControlByName(new Inputs.BabylonGui.GetControlByNameDto(panel, "missing"));

            // Assert
            expect(found).toBeUndefined();
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read visibility", () => {
            // Act
            service.setIsVisible(new Inputs.BabylonGui.SetControlIsVisibleDto(control, false));

            // Assert
            expect(service.getIsVisible(new Inputs.BabylonGui.ControlDto(control))).toBe(false);
        });

        it("should set and read the readonly flag", () => {
            // Act
            service.setIsReadonly(new Inputs.BabylonGui.SetControlIsReadonlyDto(control, true));

            // Assert
            expect(service.getIsReadonly(new Inputs.BabylonGui.ControlDto(control))).toBe(true);
        });

        it("should set and read the enabled flag", () => {
            // Act
            service.setIsEnabled(new Inputs.BabylonGui.SetControlIsEnabledDto(control, false));

            // Assert
            expect(service.getIsEnabled(new Inputs.BabylonGui.ControlDto(control))).toBe(false);
        });

        it("should set and read the height", () => {
            // Act
            service.setHeight(new Inputs.BabylonGui.SetControlHeightDto(control, "80px"));

            // Assert
            expect(service.getHeight(new Inputs.BabylonGui.ControlDto(control))).toBe("80px");
        });

        it("should set and read the width", () => {
            // Act
            service.setWidth(new Inputs.BabylonGui.SetControlWidthDto(control, "70px"));

            // Assert
            expect(service.getWidth(new Inputs.BabylonGui.ControlDto(control))).toBe("70px");
        });

        it("should set and read the colour", () => {
            // Act
            service.setColor(new Inputs.BabylonGui.SetControlColorDto(control, "#abcdef"));

            // Assert
            expect(service.getColor(new Inputs.BabylonGui.ControlDto(control))).toBe("#abcdef");
        });

        it("should set and read the font size", () => {
            // Act
            service.setFontSize(new Inputs.BabylonGui.SetControlFontSizeDto(control, 30));

            // Assert
            expect(service.getFontSize(new Inputs.BabylonGui.ControlDto(control))).toBe("30px");
        });

        it("should hand the control back from every writer", () => {
            // Assert
            expect(service.setIsVisible(new Inputs.BabylonGui.SetControlIsVisibleDto(control, true))).toBe(control);
            expect(service.setIsReadonly(new Inputs.BabylonGui.SetControlIsReadonlyDto(control, false))).toBe(control);
            expect(service.setIsEnabled(new Inputs.BabylonGui.SetControlIsEnabledDto(control, true))).toBe(control);
            expect(service.setHeight(new Inputs.BabylonGui.SetControlHeightDto(control, "10px"))).toBe(control);
            expect(service.setWidth(new Inputs.BabylonGui.SetControlWidthDto(control, "10px"))).toBe(control);
            expect(service.setColor(new Inputs.BabylonGui.SetControlColorDto(control, "#fff"))).toBe(control);
            expect(service.setFontSize(new Inputs.BabylonGui.SetControlFontSizeDto(control, 12))).toBe(control);
        });
    });

    describe("createControlObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createControlObservableSelector(
                new Inputs.BabylonGui.ControlObservableSelectorDto(Inputs.BabylonGui.controlObservableSelectorEnum.onFocusObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.controlObservableSelectorEnum.onFocusObservable);
        });
    });
});
