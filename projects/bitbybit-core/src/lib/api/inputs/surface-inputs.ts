import { Mesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Surface {
    export class SurfaceDto {
        surface: any;
    }
    export class DrawSurfaceDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable = false;
        /**
         * Surface mesh variable in case it already exists and needs updating
         */
        surfaceMesh?: Mesh;
    }
}
