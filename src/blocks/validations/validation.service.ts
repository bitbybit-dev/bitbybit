import { ValidationEntityInterface } from './validation-entity.interface';
import { WorkspaceSvg, Block, Workspace } from 'blockly';

export class BlockValidationService {
    static validate(block: Block, workspace: Workspace | WorkspaceSvg, validationEntityModel: ValidationEntityInterface[]) {
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
            const errorText = `Block failed - \n${errors.join(',\n')}.`;
            block.setWarningText(errorText);
            (workspace as WorkspaceSvg).centerOnBlock(block.id);
            throw new Error(errorText);
        } else {
            block.setColour('ffffff');
            block.setWarningText(null);
        }
    }
}
