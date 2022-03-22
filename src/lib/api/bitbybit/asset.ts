
import * as Inputs from '../inputs/inputs';
import { AssetManager } from '../../asset-manager';


export class Asset {
    public readonly assetManager: AssetManager;
    constructor() {
        this.assetManager = new AssetManager();
    }

    /**
     * Gets the asset file
     * <div>
     *  <img src="../assets/images/blockly-images/asset/getfile.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_asset_get.Asset.html#getFile
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File> {
        return this.assetManager.getAsset(inputs.fileName);
    }
}
