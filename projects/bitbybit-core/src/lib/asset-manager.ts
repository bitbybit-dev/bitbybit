import { Injectable, NgZone } from '@angular/core';
/**
 * This is a manager of assets.
 */
@Injectable()
export class AssetManager {
    getAsset: (fileName: string) => Promise<File>;
    
    constructor() {
    }
}
