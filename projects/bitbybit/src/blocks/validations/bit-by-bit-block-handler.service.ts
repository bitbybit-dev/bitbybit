import { Block, Workspace, WorkspaceSvg } from 'blockly';
import { ValidationEntityInterface } from './validation-entity.interface';

export class BitByBitBlockHandlerService {

    static runningBlockId: string;

    static handleBlock(workspace: Workspace, id: string, inputs: any): void {
        const block = workspace.getBlockById(id) as { validationModel: ValidationEntityInterface[] } & Block;
        BitByBitBlockHandlerService.runningBlockId = id;
        BitByBitBlockHandlerService.runtimeValidation(block, inputs);
    }

    /**
     * If we detect that some inputs are promises, we will await their responses and continue
     */
    static async inputAwaiter(inputs: any, workspace: Workspace, blockId: string): Promise<any> {
        const inputProps = Object.keys(inputs);
        const promises = [];
        inputProps.forEach((propName) => {
            if (inputs[propName].then) {
                inputs[propName].then(r => {
                    inputs[propName] = r;
                    return r;
                });
                promises.push(inputs[propName]);
            }
        });
        if (promises.length > 0) {
            BitByBitBlockHandlerService.startedAsyncTask(workspace, blockId, '#eeeeff');
        }
        if (promises.length > 0) {
            const promise = Promise.all(promises).then((s) => {
                BitByBitBlockHandlerService.finishedAsyncTask(workspace, blockId);
                return s;
            });
            return promise;
        } else {
            return null;
        }
    }

    static finishedAsyncTask(workspace: Workspace, blockId: string): void {
        const block = workspace.getBlockById(blockId);
        block.setColour('#ffffff');
    }

    static startedAsyncTask(workspace: Workspace, blockId: string, colour: string): void {
        const block = workspace.getBlockById(blockId);
        block.setColour(colour);
    }

    static runtimeValidation(block: { validationModel: ValidationEntityInterface[] } & Block, inputs: any) {
        if (block && block.validationModel) {
            const validationModel = block.validationModel.map(model => {
                return {
                    entity: inputs[model.entity],
                    validations: model.validations,
                };
            });
            BitByBitBlockHandlerService.validate(
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

    static handleBlockException(block: Block, e) {
        block.setColour('ffab91');
        block.setWarningText('Block failed when computing, check if data provided is correct. ' + e);
    }

}
