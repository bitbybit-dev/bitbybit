
import { Scene } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../lib/bit-by-bit-blockly-helper.service';


export class Context {

    scene: Scene;
    blocklyWorkspace: any;
    verb: any;
    occ: any;

    bitByBitBlocklyHelperService = BitByBitBlocklyHelperService;

    constructor() {}
}
