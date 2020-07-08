import { createPrintSaveBlock } from './print-save';
import { createSaveBlock } from './save';

export function assembleIOBlocks() {
    createPrintSaveBlock();
    createSaveBlock();
}
