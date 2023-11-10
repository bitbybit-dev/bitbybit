
import * as BABYLON from "@babylonjs/core";
import { BitByBitContextHelperService } from "../../lib/bit-by-bit-context-helper.service";


export class Context {

    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    havokPlugin: BABYLON.HavokPlugin;
    blocklyWorkspace: any;
    verb: any;
    occ: any;
    jsonpath: any;

    BitByBitContextHelperService = BitByBitContextHelperService;
}
