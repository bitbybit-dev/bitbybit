import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occtConstants } from './occt-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createChamferEdgesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_shapes_edge_chamfer_edges';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_shapes_edge_chamfer_edges_input_shape);
            this.appendValueInput('EdgeList')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_shapes_edge_chamfer_edges_input_edge_list.toLowerCase());
            this.appendValueInput('Distance')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_shapes_edge_chamfer_edges_input_distance.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occt_shapes_edge_chamfer_edges_description);
            this.setHelpUrl(environment.docsUrl + occtConstants.occtShapesEdgeHelpUrl + '#' + 'chamferedges');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.ChamferDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            distance: (JavaScript as any).valueToCode(block, 'Distance', (JavaScript as any).ORDER_ATOMIC),
            edgeList: (JavaScript as any).valueToCode(block, 'EdgeList', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_shapes_edge_chamfer_edges_input_shape,
            resources.block_occt_shapes_edge_chamfer_edges_input_distance,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.shapes.edge.chamferEdges(inputs)`, true
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
            getRequired(resources, resources.block_occt_shapes_edge_chamfer_edges_input_shape),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occt_shapes_edge_chamfer_edges_input_distance),
        ]
    }
    ];
}


