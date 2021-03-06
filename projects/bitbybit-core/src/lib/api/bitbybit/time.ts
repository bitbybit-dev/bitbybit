import { Injectable } from '@angular/core';
import { BitByBitBlocklyHelperService } from '../../bit-by-bit-blockly-helper.service';

/**
 * Time functions help to create various interactions which happen in time
 */
@Injectable()
export class Time {

    /**
     * Registers a function to render loop
     * <div>
     *  <img src="../assets/images/blockly-images/time/registerRenderFunction.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.time.html#registerrenderfunction
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void {
        BitByBitBlocklyHelperService.renderLoopBag.push((timePassedMs) => {
            update(timePassedMs);
        });
    }

}
