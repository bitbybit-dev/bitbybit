import { Entity } from "playcanvas";
import { GUI } from "lil-gui";

export type Current = {
  groups: Entity[] | undefined;
  ground: Entity | undefined;
  gui: GUI | undefined;
};

export const current: Current = {
  groups: undefined,
  ground: undefined,
  gui: undefined,
};
