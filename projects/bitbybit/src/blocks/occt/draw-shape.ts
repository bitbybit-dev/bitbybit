import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyPromiseIndicator, createStandardContextIIFE } from '../_shared';
import { makeRequiredValidationModelForInputs, HS, ValidationEntityInterface, getRequired } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from '../../../../bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createDrawShapeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occt_draw_shape';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_shape);
            this.appendValueInput('Precision')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_precision.toLowerCase());
            this.appendValueInput('DrawFaces')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_draw_faces.toLowerCase());
            this.appendValueInput('FaceOpacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_face_opacity.toLowerCase());
            this.appendValueInput('FaceColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_face_colour.toLowerCase());
            this.appendValueInput('DrawFaceIndexes')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_draw_face_indexes.toLowerCase());
            this.appendValueInput('FaceIndexHeight')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_face_index_height.toLowerCase());
            this.appendValueInput('FaceIndexColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_face_index_colour.toLowerCase());
            this.appendValueInput('DrawEdges')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_draw_edges.toLowerCase());
            this.appendValueInput('EdgeOpacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_edge_opacity.toLowerCase());
            this.appendValueInput('EdgeColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_edge_colour.toLowerCase());
            this.appendValueInput('EdgeWidth')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_edge_width.toLowerCase());
            this.appendValueInput('DrawEdgeIndexes')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_draw_edge_indexes.toLowerCase());
            this.appendValueInput('EdgeIndexHeight')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_edge_index_height.toLowerCase());
            this.appendValueInput('EdgeIndexColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_occt_draw_shape_input_edge_index_colour.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_occt_draw_shape_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'drawshape');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: OCC.DrawShapeDto = {
            shape: (JavaScript as any).valueToCode(block, 'OccShape', (JavaScript as any).ORDER_ATOMIC),
            faceOpacity: (JavaScript as any).valueToCode(block, 'FaceOpacity', (JavaScript as any).ORDER_ATOMIC),
            edgeOpacity: (JavaScript as any).valueToCode(block, 'EdgeOpacity', (JavaScript as any).ORDER_ATOMIC),
            faceColour: (JavaScript as any).valueToCode(block, 'FaceColour', (JavaScript as any).ORDER_ATOMIC),
            edgeColour: (JavaScript as any).valueToCode(block, 'EdgeColour', (JavaScript as any).ORDER_ATOMIC),
            edgeWidth: (JavaScript as any).valueToCode(block, 'EdgeWidth', (JavaScript as any).ORDER_ATOMIC),
            drawEdges: (JavaScript as any).valueToCode(block, 'DrawEdges', (JavaScript as any).ORDER_ATOMIC),
            drawFaces: (JavaScript as any).valueToCode(block, 'DrawFaces', (JavaScript as any).ORDER_ATOMIC),
            precision: (JavaScript as any).valueToCode(block, 'Precision', (JavaScript as any).ORDER_ATOMIC),
            drawEdgeIndexes: (JavaScript as any).valueToCode(block, 'DrawEdgeIndexes', (JavaScript as any).ORDER_ATOMIC),
            edgeIndexHeight: (JavaScript as any).valueToCode(block, 'EdgeIndexHeight', (JavaScript as any).ORDER_ATOMIC),
            edgeIndexColour: (JavaScript as any).valueToCode(block, 'EdgeIndexColour', (JavaScript as any).ORDER_ATOMIC),
            drawFaceIndexes: (JavaScript as any).valueToCode(block, 'DrawFaceIndexes', (JavaScript as any).ORDER_ATOMIC),
            faceIndexHeight: (JavaScript as any).valueToCode(block, 'FaceIndexHeight', (JavaScript as any).ORDER_ATOMIC),
            faceIndexColour: (JavaScript as any).valueToCode(block, 'FaceIndexColour', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_occt_draw_shape_input_shape,
            resources.block_occt_draw_shape_input_precision,
            resources.block_occt_draw_shape_input_draw_faces,
            resources.block_occt_draw_shape_input_face_opacity,
            resources.block_occt_draw_shape_input_face_colour,
            resources.block_occt_draw_shape_input_draw_face_indexes,
            resources.block_occt_draw_shape_input_face_index_height,
            resources.block_occt_draw_shape_input_face_index_colour,
            resources.block_occt_draw_shape_input_draw_edges,
            resources.block_occt_draw_shape_input_edge_opacity,
            resources.block_occt_draw_shape_input_edge_colour,
            resources.block_occt_draw_shape_input_edge_width,
            resources.block_occt_draw_shape_input_draw_edge_indexes,
            resources.block_occt_draw_shape_input_edge_index_height,
            resources.block_occt_draw_shape_input_edge_index_colour,
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.occt.drawShape(inputs)`, true
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {
    return [
        {
            entity: keys[0],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_shape),
            ]
        }, {
            entity: keys[1],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_precision),
            ]
        }, {
            entity: keys[2],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_draw_faces),
            ]
        }, {
            entity: keys[3],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_face_opacity),
            ]
        }, {
            entity: keys[4],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_face_colour),
            ]
        }, {
            entity: keys[5],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_draw_face_indexes),
            ]
        }, {
            entity: keys[6],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_face_index_height),
            ]
        }, {
            entity: keys[7],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_face_index_colour),
            ]
        }, {
            entity: keys[8],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_draw_edges),
            ]
        }, {
            entity: keys[9],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_edge_opacity),
            ]
        }, {
            entity: keys[10],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_edge_colour),
            ]
        }, {
            entity: keys[11],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_edge_width),
            ]
        }, {
            entity: keys[12],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_draw_edge_indexes),
            ]
        }, {
            entity: keys[13],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_edge_index_height),
            ]
        }, {
            entity: keys[14],
            validations: [
                getRequired(resources, resources.block_occt_draw_shape_input_edge_index_colour),
            ]
        }
    ];
}
