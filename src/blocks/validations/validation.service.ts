import { ValidationModel } from './validation.model';

export class BlockValidationService {
    static validate(block: any, validationModel: { entity: any, validations: ValidationModel[] }[]) {
        const errors = [];

        validationModel.forEach(validation => {
            validation.validations.forEach(val => {
                if (!val.validationFunc(validation.entity, val.validationData)) {
                    errors.push(val.errorText);
                }
            });
        });

        if (errors.length > 0) {
            block.setColour('ffab91');
            const errorText = `\n${errors.join(',\n')}.`;
            block.setWarningText(errorText);
            throw new Error(errorText);
        }
    }
}
