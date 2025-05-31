import { Mesh } from "@babylonjs/core";
import { GUI } from "lil-gui";

export type Current = {
  groups: Mesh[] | undefined;
  ground: Mesh | undefined;
  gui: GUI | undefined;
};

export const current: Current = {
  groups: undefined,
  ground: undefined,
  gui: undefined,
};
