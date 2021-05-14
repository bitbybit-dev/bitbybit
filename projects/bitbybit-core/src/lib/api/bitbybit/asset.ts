import { Injectable } from '@angular/core';
import * as Inputs from '../inputs/inputs';
import { AssetManager } from '../../asset-manager';

@Injectable()
export class Asset {

    constructor(
        private readonly assetManager: AssetManager,
    ) {
    }

    /**
     * Gets the asset file
     * <div>
     *  <img src="../assets/images/blockly-images/asset/get.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_asset_get.assetget.html#get
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File> {
        return this.assetManager.getAsset(inputs.fileName);
    }
}
