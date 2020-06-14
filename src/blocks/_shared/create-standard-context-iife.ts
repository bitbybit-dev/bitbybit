import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, inputs: any, returns: boolean, body: string) {
    return `
(() => {
    /* Component: "${componentName}" */
    /* Assigning Inputs */
    const inputs = {};
    ${Object.keys(inputs).map(key => assignInputs(key, inputs)).join(`;
    `)};
    const currentBlock = blocklyWorkspace.getBlockById('${block.id}');
    BlockValidationService.runtimeValidation(currentBlock, inputs);

    try {
        ${body}
    } catch (e) {
        BlockValidationService.handleBlockException(currentBlock, e)
    }
    /* End Component: "${componentName}" */
})()${returns ? '' : ';'}
`;
}
function assignInputs(key: string, inputs: any): string {
    return `inputs['${key}'] = ${inputs[key]}`;
}

