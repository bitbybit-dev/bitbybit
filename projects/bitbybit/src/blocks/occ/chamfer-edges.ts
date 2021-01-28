import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createChamferEdgesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_chamfer_edges';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_chamfer_edge_input_shape);
            this.appendValueInput('EdgeList')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_chamfer_edge_input_edge_list.toLowerCase());
            this.appendValueInput('Distance')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_chamfer_edge_input_distance.toLowerCase());
            this.appendValueInput('All')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_chamfer_edge_input_all.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_chamfer_edge_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'offset');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.ChamferDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            distance: (JavaScript as any).valueToCode(block, 'Distance', (JavaScript as any).ORDER_ATOMIC),
            edgeList: (JavaScript as any).valueToCode(block, 'EdgeList', (JavaScript as any).ORDER_ATOMIC),
            all: (JavaScript as any).valueToCode(block, 'All', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_chamfer_edge_input_shape,
            resources.block_occ_chamfer_edge_input_distance,
            resources.block_occ_chamfer_edge_input_edge_list,
            resources.block_occ_chamfer_edge_input_all,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.chamferEdges(inputs)`, true
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
            getRequired(resources, resources.block_occ_chamfer_edge_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_chamfer_edge_input_distance),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_occ_chamfer_edge_input_edge_list),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_occ_chamfer_edge_input_all),
        ]
    }
    ];
}


