import { Block } from 'blockly';
import { HS } from '../validations';

// Async component inputs need to be awaited before body is executed and if body itself is async it also should show loading indicators
export function createStandardContextIIFE(
    block: Block,
    componentName: string,
    inputs: any,
    returns: boolean,
    body: string,
    async?: boolean): string {
    const filteredKeys = Object.keys(inputs).filter(key => inputs[key] !== '');

    return `
(() => {
    const inputs = {
        ${filteredKeys.map(key => key.includes('statement_') ? assignStatements(key, inputs) : assignInputs(key, inputs)).join(`,
        `)}
    };
${async ? `async function awaiter() {
    await BitByBit.HS.inputAwaiter(inputs, BitByBit.blocklyWorkspace, '${block.id}');
    BitByBit.HS.handleBlock(BitByBit.blocklyWorkspace, '${block.id}', inputs);
    BitByBit.HS.startedAsyncTask(BitByBit.blocklyWorkspace, '${block.id}', '#ddddff');
    ${returns ? 'return ' : ''}${body}.then((r) => {BitByBit.HS.finishedAsyncTask(BitByBit.blocklyWorkspace, '${block.id}'); return r;});
}
${returns ? 'return ' : ''} awaiter();` : `
BitByBit.HS.handleBlock(BitByBit.blocklyWorkspace, '${block.id}', inputs)
${body}`}
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

