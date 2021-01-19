import { simplifyDeclaration } from './simplify-declaration';

export const timeString = simplifyDeclaration(`
/**
 * Time functions help to create various interactions which happen in time
 */
export declare class Time {
    /**
     * Registers a function to render loop.
     * <div>
     *  <img src="../assets/images/blockly-images/time/registerRenderFunction.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.time.html#registerrenderfunction
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void;
}

`);
