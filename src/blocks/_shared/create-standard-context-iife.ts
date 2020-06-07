import { Block } from 'blockly';

export function createStandardContextIIFE(block: Block, componentName: string, inputs: any, returns: boolean, body: string) {
    return `
(() => {
    /* Component: "${componentName}", Block ID: "${block.id}" */
    /* Assigning Inputs */
    const inputs = {};
    ${Object.keys(inputs).map(key => assignInputs(key, inputs)).join(`;
    `)};
    const currentBlock = blocklyWorkspace.getBlockById('${block.id}');
    const validationModel = currentBlock.validationModel.map(model => {
        return {
            entity: inputs[model.entity],
            validations: model.validations,
        }
    });

    /* Runtime Input Validation */
    BlockValidationService.validate(
        currentBlock,
        currentBlock.workspace,
        validationModel
    );

    try {
        ${body}
    } catch (e) {
        currentBlock.setColour('ffab91');
        currentBlock.setWarningText('Block failed when computing, check if data provided is correct. ' + e);
    }
    /* End Component: "${componentName}", Block ID: "${block.id}" */
})()${returns ? '' : ';'}
`;
}
function assignInputs(key: string, inputs: any): string {
    return `inputs['${key}'] = ${inputs[key]}`;
}

