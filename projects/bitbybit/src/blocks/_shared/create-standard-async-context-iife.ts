import { Block } from 'blockly';

export function createStandardAsyncContextIIFE(block: Block, componentName: string, body: string) {
    return `
/// Component: "${componentName}", Block ID: "${block.id}"
(() => {
    const block = BitByBit.blocklyWorkspace.getBlockById('${block.id}');
    block.inputList[0].setVisible(true);
    block.inputList[0].setAlign(0);

    const result = (() => {
        ${body}
    })();

    block.inputList[0].setVisible(false);
    block.inputList[0].setAlign(0);
    return result;
})();
/// End Component: "${componentName}", Block ID: "${block.id}"
`;
}
