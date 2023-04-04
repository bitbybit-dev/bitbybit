import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace Color {
    export class HexDto {
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color = '#0000ff';
    }
    export class HexDtoMapped {
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color = '#0000ff';
        /**
         * From min bound
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        from: number = 0;
        /**
         * To max bound
         * @default 255
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        to: number = 255;
    }
    export class RGBDto {
        /**
         * Red value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        r: number = 255;
        /**
         * Green value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        g: number = 255;
        /**
        * Blue value component
        * @default 255
        * @minimum 0
        * @maximum 255
        * @step 1
        */
        b: number = 255;
    } 
    export class RGBObjectDto {
        /**
         * Red value component
         * @default undefined
         */
        rgb: Base.ColorRGB;
    }
}
