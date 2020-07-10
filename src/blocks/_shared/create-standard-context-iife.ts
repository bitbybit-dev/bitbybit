import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, inputs: any, returns: boolean, body: string) {
    return `
(() => {
    /* Component: "${componentName}" */
    /* Assigning Inputs */
    const inputs = {};
    ${Object.keys(inputs).filter(key => inputs[key] !== undefined).map(key => key.includes('statement_') ? assignStatements(key, inputs) : assignInputs(key, inputs)).join(`;
    `)};
    BitByBitBlockHandlerService.handleBlock(blocklyWorkspace, '${block.id}', inputs)

    ${body}

    /* End Component: "${componentName}" */
})()${returns ? '' : ';'}
`;
}
function assignInputs(key: string, inputs: any): string {
    return `inputs['${key}'] = ${inputs[key]}`;
}

function assignStatements(key: string, inputs: any): string {
    return `inputs['${key}'] = () => {
        ${inputs[key]}
    }
`;
}

