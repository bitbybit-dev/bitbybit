import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occtConstants } from './occt-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createWiresCreateBSplineBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_shapes_wire_create_bspline';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Points')
                .setCheck('Array')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_shapes_wire_create_bspline_input_points);
            this.appendValueInput('Closed')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_shapes_wire_create_bspline_input_closed.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occt_shapes_wire_create_bspline_description);
            this.setHelpUrl(environment.docsUrl + occtConstants.occtShapesWireHelpUrl + '#' + 'createbezier');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.BSplineDto = {
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
            closed: (JavaScript as any).valueToCode(block, 'Closed', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_shapes_wire_create_bspline_input_points,
            resources.block_occt_shapes_wire_create_bspline_input_closed,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occt.shapes.wire.createBSpline(inputs)`, true
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
            getRequired(resources, resources.block_occt_shapes_wire_create_bspline_input_points),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occt_shapes_wire_create_bspline_input_closed),
        ]
    }
    ];
}


