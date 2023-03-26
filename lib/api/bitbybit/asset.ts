
import * as Inputs from '../inputs/inputs';
import { AssetManager } from '../../asset-manager';

export class Asset {
    public readonly assetManager: AssetManager;
    constructor() {
        this.assetManager = new AssetManager();
    }

    /**
     * Gets the asset file
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File> {
        return this.assetManager.getAsset(inputs.fileName);
    }

    /**
     * Gets the local asset file stored in your browser.
     * @param inputs asset name to get from local assets
     * @returns Blob of asset
     */
    getLocalFile(inputs: Inputs.Asset.GetAssetDto): Promise<File | File[]> {
        return this.assetManager.getLocalAsset(inputs.fileName);
    }

}
