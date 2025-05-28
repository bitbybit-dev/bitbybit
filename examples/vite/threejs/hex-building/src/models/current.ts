import { Group, Mesh } from 'three';
import { GUI } from 'lil-gui';

export type Current = {
  groups: Group[] | undefined;
  ground: Mesh | undefined;
  gui: GUI | undefined;
};
