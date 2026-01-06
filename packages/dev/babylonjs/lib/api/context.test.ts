jest.mock("@babylonjs/core", () => {
    const { createBabylonJSMock } = jest.requireActual("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { Context } from "./context";
import * as Inputs from "./inputs";
import * as BABYLON from "@babylonjs/core";

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
            // Properties are not initialized in constructor, but can be assigned
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            const mockScene = new MockScene() as unknown as BABYLON.Scene;
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });

        it("should be able to have engine property assigned", () => {
            const mockEngine = {
                dispose: jest.fn(),
                runRenderLoop: jest.fn()
            } as unknown as BABYLON.Engine;
            context.engine = mockEngine;
            expect(context.engine).toBe(mockEngine);
        });

        it("should be able to have havokPlugin property assigned", () => {
            const mockHavokPlugin = {
                name: "havok",
                setGravity: jest.fn()
            } as unknown as BABYLON.HavokPlugin;
            context.havokPlugin = mockHavokPlugin;
            expect(context.havokPlugin).toBe(mockHavokPlugin);
        });
    });

    describe("getSamplingMode", () => {
        beforeEach(() => {
            // Initialize scene for testing
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            context.scene = new MockScene() as unknown as BABYLON.Scene;
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
            // Pass an invalid value to test default case
            const result = context.getSamplingMode("invalid" as any);
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
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            const mockScene = new MockScene() as unknown as BABYLON.Scene;
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });

        it("should allow setting engine property", () => {
            const mockEngine = {
                dispose: jest.fn(),
                runRenderLoop: jest.fn()
            } as unknown as BABYLON.Engine;
            context.engine = mockEngine;
            expect(context.engine).toBe(mockEngine);
        });

        it("should allow setting havokPlugin property", () => {
            const mockHavokPlugin = {
                name: "havok",
                setGravity: jest.fn()
            } as unknown as BABYLON.HavokPlugin;
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
            
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            const scene1 = new MockScene() as unknown as BABYLON.Scene;
            const scene2 = new MockScene() as unknown as BABYLON.Scene;
            
            context1.scene = scene1;
            context2.scene = scene2;
            
            expect(context1.scene).not.toBe(context2.scene);
        });
    });

    describe("Context inheritance", () => {
        it("should inherit from ContextBase", () => {
            // ContextBase properties should be accessible
            expect(context).toBeDefined();
            // Context should be able to have additional properties assigned
            const MockScene = jest.requireActual("./__mocks__/babylonjs.mock").MockScene;
            const mockScene = new MockScene() as unknown as BABYLON.Scene;
            context.scene = mockScene;
            expect(context.scene).toBe(mockScene);
        });
    });

    describe("WebGPU Engine support", () => {
        it("should support WebGPU Engine type", () => {
            const mockWebGPUEngine = {
                dispose: jest.fn(),
                runRenderLoop: jest.fn(),
                initAsync: jest.fn()
            } as unknown as BABYLON.WebGPUEngine;
            
            context.engine = mockWebGPUEngine;
            expect(context.engine).toBe(mockWebGPUEngine);
        });
    });
});
