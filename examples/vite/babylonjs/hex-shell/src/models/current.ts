import { DirectionalLight, Mesh } from "@babylonjs/core";
import { GUI } from "lil-gui";

export type Current = {
  group1: Mesh | undefined;
  group2: Mesh | undefined;
  dimensions: Mesh | undefined;
  light1: DirectionalLight | undefined;
  ground: Mesh | undefined;
  gui: GUI | undefined;
};

export const current: Current = {
  group1: undefined,
  group2: undefined,
  dimensions: undefined,
  ground: undefined,
  light1: undefined,
  gui: undefined,
};
