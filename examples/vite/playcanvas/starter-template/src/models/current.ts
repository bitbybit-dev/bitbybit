import * as pc from "playcanvas";
import { GUI } from "lil-gui";

export type Current = {
  group1: pc.Entity | undefined;
  group2: pc.Entity | undefined;
  dimensions: pc.Entity | undefined;
  light1: pc.Entity | undefined;
  ground: pc.Entity | undefined;
  gui: GUI | undefined;
};
