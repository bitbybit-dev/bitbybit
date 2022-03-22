
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';
import * as Inputs from '../inputs/inputs';

/**
 * Time functions help to create various interactions which happen in time
 */

export class Time {

    /**
     * Registers a function to render loop
     * <div>
     *  <img src="../assets/images/blockly-images/time/registerRenderFunction.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.Time.html#registerRenderFunction
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void {
        BitByBitBlocklyHelperService.renderLoopBag.push((timePassedMs) => {
            update(timePassedMs);
        });
    }

    /**
     * Registers a function that listens to iframe events from external third party applications
     * <div>
     *  <img src="../assets/images/blockly-images/time/listenToIFrame.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.Time.html#listenToIFrame
     * @param update The function to call in render loop
     */
    listenToIFrame(listener: (data: any) => void): void {
        BitByBitBlocklyHelperService.iframeListenerBag.push({
            fn: listener,
        });
    }

    /**
     * Post message to parent iframe of external third party applications
     * <div>
     *  <img src="../assets/images/blockly-images/time/postFromIFrame.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.Time.html#postFromIFrame
     * @param data that will be transmitted
     */
    postFromIFrame(inputs: Inputs.Time.PostFromIframe): void {
        parent.parent.postMessage(inputs.data, inputs.targetOrigin);
    }
}
