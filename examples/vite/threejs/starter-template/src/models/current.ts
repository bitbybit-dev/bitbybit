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
