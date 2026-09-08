import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonEngine } from "./engine";

describe("BabylonEngine", () => {
    let headless: HeadlessScene;
    let service: BabylonEngine;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonEngine(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("getEngine", () => {
        it("should hand back the engine the context is running on", () => {
            // Assert
            expect(service.getEngine()).toBe(headless.engine);
        });
    });

    describe("getRenderingCanvas", () => {
        it("should hand back the canvas that engine draws into", () => {
            // Assert
            expect(service.getRenderingCanvas()).toBe(headless.canvas);
        });
    });
});
