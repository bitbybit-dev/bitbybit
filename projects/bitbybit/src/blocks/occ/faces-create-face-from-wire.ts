import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from 'projects/bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createFacesCreateFaceFromWireBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_faces_create_face_from_wire';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_faces_create_face_from_wire_input_wire);
            this.appendValueInput('Planar')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occ_faces_create_face_from_wire_input_planar.toLowerCase());
            this.setOutput(true, 'OccShape');
            this.setColour('#fff');
            this.setTooltip(resources.block_occ_faces_create_face_from_wire_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'createfacefromwire');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.FaceFromWireDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            planar: (JavaScript as any).valueToCode(block, 'Planar', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occ_faces_create_face_from_wire_input_wire,
            resources.block_occ_faces_create_face_from_wire_input_planar,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `bitbybit.occ.createFaceFromWire(inputs)`, true
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
            getRequired(resources, resources.block_occ_faces_create_face_from_wire_input_wire),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_occ_faces_create_face_from_wire_input_planar),
        ]
    }
    ];
}


