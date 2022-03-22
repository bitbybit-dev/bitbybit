
import { Scene } from '@babylonjs/core';
import { Workspace } from 'blockly';
import { BitByBitBlocklyHelperService } from '../../lib/bit-by-bit-blockly-helper.service';


export class Context {

    scene: Scene;
    blocklyWorkspace: Workspace;
    verb: any;
    occ: any;

    bitByBitBlocklyHelperService = BitByBitBlocklyHelperService;

    constructor() {}
}
