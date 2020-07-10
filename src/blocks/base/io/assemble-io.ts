import { createHttpDeleteBlock } from './http-delete';
import { createHttpGetBlock } from './http-get';
import { createHttpPatchBlock } from './http-patch';
import { createHttpPostBlock } from './http-post';
import { createHttpPutBlock } from './http-put';
import { createImportTextFileBlock } from './import-text-file';
import { createPrintSaveBlock } from './print-save';
import { createSaveBlock } from './save';
import { createHttpOptionsBlock } from './http-options';

export function assembleIOBlocks() {
    createPrintSaveBlock();
    createSaveBlock();
    createImportTextFileBlock();
    createHttpGetBlock();
    createHttpPutBlock();
    createHttpPostBlock();
    createHttpDeleteBlock();
    createHttpPatchBlock();
    createHttpOptionsBlock();
}
