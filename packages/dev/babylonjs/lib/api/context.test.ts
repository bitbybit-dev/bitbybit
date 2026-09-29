import { MockScene, instanceOf } from "./__mocks__/babylonjs.mock";
import { describe, it, expect, beforeEach, vi } from "vitest";
vi.mock("@babylonjs/core", async () => {
    const { createBabylonJSMock } = await vi.importActual<typeof import("./__mocks__/babylonjs.mock")>("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { Context } from "./context";
import * as Inputs from "./inputs";
import * as BABYLON from "@babylonjs/core";
import { partialMock } from "./__mocks__/test-helpers";

describe("Context unit tests", () => {
    let context: Context;

    beforeEach(() => {
        context = new Context();
    });

    describe("Constructor initialization", () => {
        it("should create a Context instance", () => {
            expect(context).toBeDefined();
            expect(context).toBeInstanceOf(Context);
        });

        it("should be able to have scene property assigned", () => {
            const mockScene = instanceOf(new MockScene(), BABYLON.Scene);
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });

        it("should be able to have engine property assigned", () => {
            const mockEngine = partialMock<BABYLON.Engine>({
                dispose: vi.fn(),
                runRenderLoop: vi.fn()
            });
            context.engine = mockEngine;
            expect(context.engine).toBe(mockEngine);
        });

        it("should be able to have havokPlugin property assigned", () => {
            const mockHavokPlugin = partialMock<BABYLON.HavokPlugin>({
                name: "havok",
                setGravity: vi.fn()
            });
            context.havokPlugin = mockHavokPlugin;
            expect(context.havokPlugin).toBe(mockHavokPlugin);
        });
    });

    describe("getSamplingMode", () => {
        beforeEach(() => {
            context.scene = instanceOf(new MockScene(), BABYLON.Scene);
        });

        it("should return NEAREST_SAMPLINGMODE for nearest enum", () => {
            const result = context.getSamplingMode(Inputs.BabylonTexture.samplingModeEnum.nearest);
            expect(result).toBe(BABYLON.Texture.NEAREST_SAMPLINGMODE);
        });

        it("should return BILINEAR_SAMPLINGMODE for bilinear enum", () => {
            const result = context.getSamplingMode(Inputs.BabylonTexture.samplingModeEnum.bilinear);
            expect(result).toBe(BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        });

        it("should return TRILINEAR_SAMPLINGMODE for trilinear enum", () => {
            const result = context.getSamplingMode(Inputs.BabylonTexture.samplingModeEnum.trilinear);
            expect(result).toBe(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
        });

        it("should return NEAREST_SAMPLINGMODE as default", () => {
            const invalidMode: string = "invalid";
            const result = context.getSamplingMode(invalidMode as Inputs.BabylonTexture.samplingModeEnum);
            expect(result).toBe(BABYLON.Texture.NEAREST_SAMPLINGMODE);
        });

        it("should handle all valid sampling mode enums", () => {
            const samplingModes = [
                Inputs.BabylonTexture.samplingModeEnum.nearest,
                Inputs.BabylonTexture.samplingModeEnum.bilinear,
                Inputs.BabylonTexture.samplingModeEnum.trilinear
            ];

            samplingModes.forEach(mode => {
                const result = context.getSamplingMode(mode);
                expect(typeof result).toBe("number");
                expect(result).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe("Property assignment", () => {
        it("should allow setting scene property", () => {
            const mockScene = instanceOf(new MockScene(), BABYLON.Scene);
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });

        it("should allow setting engine property", () => {
            const mockEngine = partialMock<BABYLON.Engine>({
                dispose: vi.fn(),
                runRenderLoop: vi.fn()
            });
            context.engine = mockEngine;
            expect(context.engine).toBe(mockEngine);
        });

        it("should allow setting havokPlugin property", () => {
            const mockHavokPlugin = partialMock<BABYLON.HavokPlugin>({
                name: "havok",
                setGravity: vi.fn()
            });
            context.havokPlugin = mockHavokPlugin;
            expect(context.havokPlugin).toBe(mockHavokPlugin);
        });
    });

    describe("Multiple contexts", () => {
        it("should create independent context instances", () => {
            const context1 = new Context();
            const context2 = new Context();
            
            expect(context1).not.toBe(context2);
        });

        it("should have independent scenes", () => {
            const context1 = new Context();
            const context2 = new Context();
            
            const scene1 = instanceOf(new MockScene(), BABYLON.Scene);
            const scene2 = instanceOf(new MockScene(), BABYLON.Scene);
            
            context1.scene = scene1;
            context2.scene = scene2;
            
            expect(context1.scene).not.toBe(context2.scene);
        });
    });

    describe("Context inheritance", () => {
        it("should inherit from ContextBase", () => {
            expect(context).toBeDefined();
            const mockScene = instanceOf(new MockScene(), BABYLON.Scene);
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });
    });

    describe("WebGPU Engine support", () => {
        it("should support WebGPU Engine type", () => {
            const mockWebGPUEngine = partialMock<BABYLON.WebGPUEngine>({
                dispose: vi.fn(),
                runRenderLoop: vi.fn(),
                initAsync: vi.fn()
            });
            
            context.engine = mockWebGPUEngine;
            expect(context.engine).toBe(mockWebGPUEngine);
        });
    });
});
