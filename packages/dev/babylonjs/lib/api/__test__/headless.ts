import * as BABYLON from "@babylonjs/core";
import { Context } from "../context";

/**
 * A real BabylonJS scene on the engine the library ships for running without a browser. The API
 * classes reach the scene through the context, exactly as they do in an application, so a suite
 * built on this asserts what the engine ends up holding rather than which call was made.
 *
 * The scene carries what an attached one carries: the shadow generator list the drawing paths record
 * into, a camera named the one the camera API adjusts, and the root transform node.
 */
export type HeadlessScene = {
    engine: BABYLON.NullEngine;
    scene: BABYLON.Scene;
    context: Context;
    canvas: HTMLCanvasElement;
    dispose: () => void;
};

export function createHeadlessScene(): HeadlessScene {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    const engine = new BABYLON.NullEngine();
    const originalGetRenderingCanvas = engine.getRenderingCanvas.bind(engine);
    engine.getRenderingCanvas = () => canvas;

    const scene = new BABYLON.Scene(engine);
    scene.metadata = { shadowGenerators: [] };
    new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    new BABYLON.TransformNode("root", scene);

    const context = new Context();
    context.scene = scene;
    context.engine = engine;

    return {
        engine,
        scene,
        context,
        canvas,
        dispose: (): void => {
            engine.getRenderingCanvas = originalGetRenderingCanvas;
            scene.dispose();
            engine.dispose();
            canvas.remove();
        },
    };
}

/** A shadow generator on a light of its own, recorded where the drawing paths look for it. */
export function addShadowGenerator(scene: BABYLON.Scene): BABYLON.ShadowGenerator {
    const light = new BABYLON.PointLight("shadowLight", new BABYLON.Vector3(0, 5, 0), scene);
    const generator = new BABYLON.ShadowGenerator(512, light);
    scene.metadata.shadowGenerators.push(generator);
    return generator;
}
