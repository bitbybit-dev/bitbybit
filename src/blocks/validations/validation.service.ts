import { ValidationEntityInterface } from './validation-entity.interface';

export class BlockValidationService {
    static validate(block: any, validationEntityModel: ValidationEntityInterface[]) {
        const errors = [];

        validationEntityModel.forEach(validation => {
            validation.validations.forEach(val => {
                if (!val.validationFunc(validation.entity, val.validationData)) {
                    errors.push(val.errorText);
                }
            });
        });

        if (errors.length > 0) {
            block.setColour('ffab91');
            const errorText = `Block with id "${block.id}" failed - \n${errors.join(',\n')}.`;
            block.setWarningText(errorText);
            throw new Error(errorText);
        }
    }
}
