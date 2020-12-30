// tslint:disable-next-line: no-namespace
export namespace Point {
    export class TransformPointDto {
        /**
         * Point to transform
         */
        point: number[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
}
