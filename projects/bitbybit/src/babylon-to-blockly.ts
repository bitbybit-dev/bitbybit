import { BitByBitBlocklyHelperService } from 'projects/bitbybit-core/src/public-api';
import { HS } from './blocks/validations';

export function prepareBabylonForBlockly(): void {
    const windowBlockly = window as any;
    if (!windowBlockly.HS) {
        Object.defineProperty(Float32Array.prototype, 'chunk', {
            value(chunkSize: number) {
                const temporal = [];

                for (let i = 0; i < this.length; i += chunkSize) {
                    temporal.push(this.slice(i, i + chunkSize));
                }

                return temporal;
            }
        });
    }

    windowBlockly.HS = HS;
    windowBlockly.BitByBitBlocklyHelperService = BitByBitBlocklyHelperService;
}
