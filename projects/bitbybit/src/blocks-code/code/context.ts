import { Injectable } from '@angular/core';
import { Scene } from '@babylonjs/core';
import { Workspace } from 'blockly';
import { BitByBitBlocklyHelperService } from '../../blocks/_shared/bit-by-bit-blockly-helper.service';

@Injectable()
export class Context {

    scene: Scene;
    blocklyWorkspace: Workspace;
    bitByBitBlocklyHelperService = BitByBitBlocklyHelperService;

    constructor() {}
}
