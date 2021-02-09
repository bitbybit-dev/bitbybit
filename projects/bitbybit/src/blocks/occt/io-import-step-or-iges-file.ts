import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occtConstants } from './occt-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createIOImportStepOrIgesFileBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_io_import_step_or_iges_file';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('AssetName')
                .setCheck('String')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_io_import_step_or_iges_file_input_asset_name);
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occt_io_import_step_or_iges_file_description);
            this.setHelpUrl(environment.docsUrl + occtConstants.occtIOHelpUrl + '#' + 'importsteporiges');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.ImportStepIgesDto = {
            assetName: (JavaScript as any).valueToCode(block, 'AssetName', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_io_import_step_or_iges_file_input_asset_name,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.io.importSTEPorIGES(inputs)`, true
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_occt_io_import_step_or_iges_file_input_asset_name),
        ]
    }];
}


