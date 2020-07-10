import { createImportTextFileBlock } from './import-text-file';
import { createPrintSaveBlock } from './print-save';
import { createSaveBlock } from './save';

export function assembleIOBlocks() {
    createPrintSaveBlock();
    createSaveBlock();
    createImportTextFileBlock();
}
