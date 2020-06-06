import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, body: string) {
    return `
/// Component: "${componentName}", Block ID: "${block.id}"
(() => {
    ${body}
})();
/// End Component: "${componentName}", Block ID: "${block.id}"
`;
}
