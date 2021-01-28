import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createCylinderBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_shapes_create_cylinder';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Radius')
                .setCheck('Number')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cylinder_input_radius);
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cylinder_input_height.toLowerCase());
            this.appendValueInput('Center')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_shapes_create_cylinder_input_center.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_shapes_create_cylinder_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'createcylinder');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.CylinderDto = {
            radius: (JavaScript as any).valueToCode(block, 'Radius', (JavaScript as any).ORDER_ATOMIC),
            height: (JavaScript as any).valueToCode(block, 'Height', (JavaScript as any).ORDER_ATOMIC),
            center: (JavaScript as any).valueToCode(block, 'Center', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_shapes_create_cylinder_input_radius,
            resources.block_occ_shapes_create_cylinder_input_height,
            resources.block_occ_shapes_create_cylinder_input_center,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.createCylinder(inputs)`, true
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
            getRequired(resources, resources.block_occ_shapes_create_cylinder_input_radius),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_shapes_create_cylinder_input_height),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_occ_shapes_create_cylinder_input_center),
        ]
    }
    ];
}


