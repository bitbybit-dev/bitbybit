import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, body: string, inputs?: any) {
    return `
/// Component: "${componentName}", Block ID: "${block.id}"
(() => {
    // Assigning Inputs
    const inputs = {};
    ${Object.keys(inputs).map(key => assignInputs(key, inputs)).join(`;
    `)};
    const currentBlock = blocklyWorkspace.getBlockById('${block.id}');
    currentBlock.validationModel.forEach(model => {
        model.entity = inputs[model.entity];
    });

    // Runtime Input Validation
    BlockValidationService.validate(
        currentBlock,
        currentBlock.workspace,
        currentBlock.validationModel
    );

    try {
        ${body}
    } catch (e) {
        currentBlock.setColour('ffab91');
        currentBlock.setWarningText('Block failed when computing, check if data provided is correct. ' + e);
    }
})();
/// End Component: "${componentName}", Block ID: "${block.id}"
`;
}
function assignInputs(key: string, inputs: any): string {
    return `inputs['${key}'] = ${inputs[key]}`;
}

