import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, inputs: any, returns: boolean, body: string) {
    const filteredKeys = Object.keys(inputs).filter(key => inputs[key] !== '' );

    return `
(() => {
    const inputs = {
        ${filteredKeys.map(key => key.includes('statement_') ? assignStatements(key, inputs) : assignInputs(key, inputs)).join(`,
        `)}
    };
    BitByBit.BitByBitBlockHandlerService.handleBlock(BitByBit.blocklyWorkspace, '${block.id}', inputs)
    ${body}
})()${returns ? '' : ';'}
`;
}
function assignInputs(key: string, inputs: any): string {
    return `'${key}': ${inputs[key]}`;
}

function assignStatements(key: string, inputs: any): string {
    return `'${key}': () => {
        ${inputs[key]}
    }
`;
}

