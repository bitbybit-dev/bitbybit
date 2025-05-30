import { DirectionalLight, Group, Mesh } from "three";
import { GUI } from "lil-gui";

export type Current = {
  group1: Group | undefined;
  group2: Group | undefined;
  dimensions: Group | undefined;
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
