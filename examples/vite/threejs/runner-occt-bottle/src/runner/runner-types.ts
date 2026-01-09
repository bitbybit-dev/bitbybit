// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./bitbybit-0.21.0.d.ts" />
import type * as THREEJS from "three";

class ExternalThreeJS {
  /**
   * Potentially scene can be created outside the context of the runner. In this case, you can provide your scene here.
   */
  scene?: THREEJS.Scene;
  /**
   * Potentially scene can be created outside the context of the runner. In this case, you must provide your camera here.
   */
  camera?: THREEJS.Camera;
  /**
   * Potentially scene can be created outside the context of the runner. In this case, you must provide your renderer
   */
  renderer?: THREEJS.WebGLRenderer;
}

export interface RunOptionsInterface {
  /**
   * The id of the HTML canvas element where the scene will be rendered.
   */
  canvasId?: string;
  /**
   * In order to draw bitbybit HTML tags correctly we need to know the class name of surrounding canvas div. Default is "canvasZone" if not provided.
   */
  canvasZoneClass?: string;
  /**
   * JSCAD kernel is enabled by default if this property is emitted. If you will set it to false it will be disabled.
   */
  enableJSCAD?: boolean;
  /**
   * Manifold kernel is enabled by default if this property is emitted. If you will set it to false it will be disabled.
   */
  enableManifold?: boolean;
  /**
   * OCCT kernel is enabled by default if this property is emitted. If you will set it to false it will be disabled.
   */
  enableOCCT?: boolean;
  /**
   * Currently only blockly supports handling key events. If you do not write games or simulations that react to key events you can disable that feature.
   */
  enableKeyEventListeners?: boolean;
  /**
   * The camera position that will be set when the scene is created.
   */
  cameraPosition?: [number, number, number];
  /**
   * The camera target that will be set when the scene is created.
   */
  cameraTarget?: [number, number, number];
  /**
   * The background color of the scene. Default is white.
   */
  backgroundColor?: string;
  /**
   * Load the fonts that are provided in the array. If you will not provide this property all the fonts will be loaded by default.
   */
  loadFonts?: fontsEnum[];
  /**
   * URL to use for CDN of the runner. By default when this is not provided we're using jsdelivr, but if you'd like to host these assets yourself or use our fallback CDN - that's totally fine.
   */
  cdnUrl?: string;
  /**
   * If you have created the scene outside the runner, you can provide it here.
   */
  externalThreeJSSettings?: ExternalThreeJS;
}

// Runner result interface
export interface RunnerResult {
  bitbybit: Bit.BitByBitBase;
  Bit: typeof Bit;
  camera: THREEJS.Camera;
  scene: THREEJS.Scene;
  renderer: THREEJS.WebGLRenderer;
  THREEJS: typeof THREEJS;
}

// BitByBit Runner interface
export interface BitByBitRunner {
  run(options: RunOptionsInterface): Promise<RunnerResult>;
  executeScript<T>(script: string, inputs?: any): T;
  resetRunnerContext(disposeScene?: boolean): void;
}

// Global window interface extension
declare global {
  interface Window {
    bitbybitRunner: {
      getRunnerInstance(): BitByBitRunner;
    };
  }
}

/**
 * The fonts that are available for the runner to load.
 */
export const fontsEnum = {
  Aboreto: "Aboreto",
  Bungee: "Bungee",
  IndieFlower: "IndieFlower",
  Lugrasimo: "Lugrasimo",
  Orbitron: "Orbitron",
  Roboto: "Roboto",
  RobotoSlab: "RobotoSlab",
  Silkscreen: "Silkscreen",
  Tektur: "Tektur",
  Workbench: "Workbench",
} as const;

export type fontsEnum = (typeof fontsEnum)[keyof typeof fontsEnum];
