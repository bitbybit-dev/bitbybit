import { Dxf } from "./helpers/dxf/dxf";

/**
 * Reading and writing files: exporting geometry to the supported formats, importing it back, and
 * the download and upload helpers that move files between the browser and the user's machine.
 */
export class IoBitByBit {

    public dxf:Dxf;
    
    constructor() {
        this.dxf = new Dxf();
    }

}