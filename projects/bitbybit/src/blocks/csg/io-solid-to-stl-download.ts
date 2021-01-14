import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

export function createIoSolidToStlDownloadBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_io_solid_to_stl_download';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Solid')
                .setCheck('CsgMesh')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_io_solid_to_stl_input_solid);
            this.appendValueInput('FileName')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_io_solid_to_stl_input_file_name.toLowerCase());
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_io_solid_to_stl_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidHelpUrl + '#' + 'downloadsolidstl');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            solid: (JavaScript as any).valueToCode(block, 'Solid', (JavaScript as any).ORDER_ATOMIC),
            fileName: (JavaScript as any).valueToCode(block, 'FileName', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_solid, resources.block_file_name,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.solid.downloadSolidSTL(inputs);`
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_solid),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_file_name),
        ]
    }];
}
