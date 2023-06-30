
import { Engine, Scene } from "@babylonjs/core";
import { BitByBitContextHelperService } from "../../lib/bit-by-bit-context-helper.service";


export class Context {

    scene: Scene;
    engine: Engine;
    blocklyWorkspace: any;
    verb: any;
    occ: any;
    jsonpath: any;

    BitByBitContextHelperService = BitByBitContextHelperService;

    constructor() {}
}
