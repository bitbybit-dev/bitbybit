import { FieldImage } from 'blockly';

export function createDummyPromiseIndicator() {
    return new FieldImage(
        'assets/blocks/async.svg',
        16,
        16,
        '');
}
