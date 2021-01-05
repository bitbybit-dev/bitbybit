import { Injectable } from '@angular/core';
import { Scene } from '@babylonjs/core';
import { Workspace } from 'blockly';
import { BitByBitBlocklyHelperService } from '../../lib/bit-by-bit-blockly-helper.service';

@Injectable()
export class Context {

    scene: Scene;
    blocklyWorkspace: Workspace;
    verb: any;

    bitByBitBlocklyHelperService = BitByBitBlocklyHelperService;

    constructor() {}
}