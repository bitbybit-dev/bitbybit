import { Block, Workspace, WorkspaceSvg } from 'blockly';
import { ValidationEntityInterface } from './validation-entity.interface';

export class BlockValidationService {

    static runtimeValidation(block: { validationModel: ValidationEntityInterface[] } & Block, inputs: any) {
        if (block.validationModel) {
            const validationModel = block.validationModel.map(model => {
                return {
                    entity: inputs[model.entity],
                    validations: model.validations,
                };
            });
            BlockValidationService.validate(
                block,
                inputs,
                validationModel
            );
        }
    }

    static validate(block: Block, inputs: any, validationEntityModel: ValidationEntityInterface[]) {
        const errors = [];

        validationEntityModel.forEach(validation => {
            validation.validations.forEach(val => {
                if (!val.validationFunc(validation.entity, val.validationData, inputs)) {
                    errors.push(val.errorText);
                    block.setColour('ffab91');
                    const errorText = `Block failed - \n${errors.join(',\n')}.`;
                    block.setWarningText(errorText);
                    throw new Error(errorText);
                }
            });
        });

        block.setColour('ffffff');
        block.setWarningText(null);
    }

    static handleBlockException(block: Block, e){
        block.setColour('ffab91');
        block.setWarningText('Block failed when computing, check if data provided is correct. ' + e);
    }
}
