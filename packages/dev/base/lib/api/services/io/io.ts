import { Drawing } from "./drawing";
import { Dxf } from "./dxf";
import { Svg } from "./svg";

/**
 * Drawings as data, with no kernel: `drawing` builds one from segments, paths and layered parts and
 * converts SVG files to DXF and back, `dxf` writes it as a DXF file and reads one back, and `svg` does
 * the same for SVG.
 */
export class IoBitByBit {

    public drawing: Drawing;

    public dxf: Dxf;

    public svg: Svg;

    constructor() {
        this.dxf = new Dxf();
        this.svg = new Svg();
        this.drawing = new Drawing(() => this.dxf, () => this.svg);
    }

}