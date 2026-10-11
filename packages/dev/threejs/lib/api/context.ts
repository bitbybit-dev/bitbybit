import { ContextBase } from "@bitbybit-dev/core";
import type * as THREEJS from "three";

export class Context extends ContextBase {
    scene!: THREEJS.Scene;
}
