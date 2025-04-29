/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";


// tslint:disable-next-line: no-namespace
export namespace Mesh {
    export class SignedDistanceFromPlaneToPointDto {
        constructor(point?: Base.Point3, plane?: Base.TrianglePlane3) {
            if (point !== undefined) { this.point = point; }
            if (plane !== undefined) { this.plane = plane; }
        }
        /**
         * Point from which to find the distance
         * @default undefined
         */
        point?: Base.Point3;
        /**
         * Triangle plane to which the distance is calculated 
         * @default undefined
         */
        plane?: Base.TrianglePlane3;
    }

    export class TriangleDto {
        constructor(triangle?: Base.Triangle3) {
            if (triangle !== undefined) { this.triangle = triangle; }
        }
        /**
         * Triangle to be used
         * @default undefined
         */
        triangle?: Base.Triangle3;
    }
    export class TriangleToleranceDto {
        constructor(triangle?: Base.Triangle3) {
            if (triangle !== undefined) { this.triangle = triangle; }
        }
        /**
         * Triangle to be used
         * @default undefined
         */
        triangle?: Base.Triangle3;
        /**
         * Tolerance for the calculation
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance? = 1e-7;
    }

    export class TriangleTriangleToleranceDto {
        constructor(triangle1?: Base.Triangle3, triangle2?: Base.Triangle3, tolerance?: number) {
            if (triangle1 !== undefined) { this.triangle1 = triangle1; }
            if (triangle2 !== undefined) { this.triangle2 = triangle2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * First triangle
         * @default undefined
         */
        triangle1?: Base.Triangle3;
        /**
         * Second triangle
         * @default undefined
         */
        triangle2?: Base.Triangle3;
        /**
         * Tolerance for the calculation
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance? = 1e-7;
    }
    export class MeshMeshToleranceDto {
        constructor(mesh1?: Base.Mesh3, mesh2?: Base.Mesh3, tolerance?: number) {
            if (mesh1 !== undefined) { this.mesh1 = mesh1; }
            if (mesh2 !== undefined) { this.mesh2 = mesh2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * First mesh
         * @default undefined
         */
        mesh1?: Base.Mesh3;
        /**
         * Second mesh
         * @default undefined
         */
        mesh2?: Base.Mesh3;
        /**
         * Tolerance for the calculation
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance? = 1e-7;
    }
}
