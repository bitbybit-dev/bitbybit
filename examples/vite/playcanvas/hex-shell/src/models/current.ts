import { Entity } from "playcanvas";
import { GUI } from "lil-gui";

export type Current = {
  group1: Entity | undefined;
  group2: Entity | undefined;
  dimensions: Entity | undefined;
  light1: Entity | undefined;
  ground: Entity | undefined;
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
