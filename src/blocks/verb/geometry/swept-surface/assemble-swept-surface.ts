import { createSweptSurfaceBlock } from './swept-surface';
import { createSweptSurfaceProfileBlock } from './swept-surface-profile';
import { createSweptSurfaceRailBlock } from './swept-surface-rail';

export function assembleSweptSurfaceBlocks() {
    createSweptSurfaceBlock();
    createSweptSurfaceRailBlock();
    createSweptSurfaceProfileBlock();
}
