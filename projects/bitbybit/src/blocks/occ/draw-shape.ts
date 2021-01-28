import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createDummyAsyncLoadingIndicator2, createStandardContextIIFE } from '../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { occConstants } from './occ-constants';
import { OCC } from '../../../../bitbybit-core/src/lib/api/inputs/occ-inputs';

export function createDrawShapeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'occ_draw_shape';

    Blocks[blockSelector] = {
        init(): void {
            createDummyAsyncLoadingIndicator2(this, resources);
            this.appendValueInput('OccShape')
                .setCheck('OccShape')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw shape');
            this.appendValueInput('FaceOpacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Face Opacity');
            this.appendValueInput('EdgeOpacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Edge Opacity');
            this.appendValueInput('FaceColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('Face Colour');
            this.appendValueInput('EdgeColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('Edge Colour');
            this.appendValueInput('EdgeWidth')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Edge Width');
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField('Updatable');
            this.appendValueInput('DrawEdges')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw Edges');
            this.appendValueInput('DrawFaces')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw Faces');
            this.appendValueInput('Precision')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Precision');
            this.appendValueInput('DrawEdgeIndexes')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw Edge Indexes');
            this.appendValueInput('EdgeIndexHeight')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Edge Index Height');
            this.appendValueInput('EdgeIndexColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('Edge Index Colour');
            this.appendValueInput('DrawFaceIndexes')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw Face Indexes');
            this.appendValueInput('FaceIndexHeight')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('Face Index Height');
            this.appendValueInput('FaceIndexColour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('Face Index Colour');
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_jscad_intersect_objects_description);
            this.setHelpUrl(environment.docsUrl + occConstants.occHelpUrl + '#' + 'createbox');
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
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            drawEdges: (JavaScript as any).valueToCode(block, 'DrawEdges', (JavaScript as any).ORDER_ATOMIC),
            drawFaces: (JavaScript as any).valueToCode(block, 'DrawFaces', (JavaScript as any).ORDER_ATOMIC),
            shapeMesh: (JavaScript as any).valueToCode(block, 'ShapeMesh', (JavaScript as any).ORDER_ATOMIC),
            linesMesh: (JavaScript as any).valueToCode(block, 'LinesMesh', (JavaScript as any).ORDER_ATOMIC),
            precision: (JavaScript as any).valueToCode(block, 'Precision', (JavaScript as any).ORDER_ATOMIC),
            drawEdgeIndexes: (JavaScript as any).valueToCode(block, 'DrawEdgeIndexes', (JavaScript as any).ORDER_ATOMIC),
            edgeIndexHeight: (JavaScript as any).valueToCode(block, 'EdgeIndexHeight', (JavaScript as any).ORDER_ATOMIC),
            edgeIndexColour: (JavaScript as any).valueToCode(block, 'EdgeIndexColour', (JavaScript as any).ORDER_ATOMIC),
            drawFaceIndexes: (JavaScript as any).valueToCode(block, 'DrawFaceIndexes', (JavaScript as any).ORDER_ATOMIC),
            faceIndexHeight: (JavaScript as any).valueToCode(block, 'FaceIndexHeight', (JavaScript as any).ORDER_ATOMIC),
            faceIndexColour: (JavaScript as any).valueToCode(block, 'FaceIndexColour', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.occ.drawShape(inputs)`, true
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [];
}


