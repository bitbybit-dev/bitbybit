import { ALIGN_RIGHT, Block, Blocks, FieldDropdown } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createExpansionsOffsetPolygonBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_expansions_offset_polygon';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polygon')
                .setCheck('Polygon')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_offset_polygon_input_polygon);
            this.appendValueInput('Delta')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_offset_polygon_input_delta.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_offset_polygon_input_segments.toLowerCase());
            this.appendValueInput('Corners')
                .setCheck('String')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_expansions_offset_polygon_input_corners.toLowerCase());
            this.setOutput(true, 'Polygon');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_expansions_offset_polygon_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polygon: JavaScript.valueToCode(block, 'Polygon', JavaScript.ORDER_ATOMIC),
            delta: JavaScript.valueToCode(block, 'Delta', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
            corners: JavaScript.valueToCode(block, 'Corners', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polygon, resources.block_delta, resources.block_segments, resources.block_corners
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const result = BitByBit.CSG.expansions.offset({
                delta: inputs.delta,
                corners: inputs.corners,
                segments: inputs.segments,
            }, inputs.polygon);
            return result;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_polygon),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_delta),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_corners),
        ]
    }];
}
