import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, body: string) {
    return `
/// Component: "${componentName}", Block ID: "${block.id}"
(() => {
    try {
        ${body}
    } catch (e) {
        const blockWithError = blocklyWorkspace.getBlockById("${block.id}");
        blockWithError.setColour('ffab91');
        blockWithError.setWarningText('Block failed when computing, check if data provided is correct. ' + e);
    }
})();
/// End Component: "${componentName}", Block ID: "${block.id}"
`;
}
