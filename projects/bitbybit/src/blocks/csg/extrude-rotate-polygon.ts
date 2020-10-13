import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createExtrudeRotatePolygonBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_extrude_rotate_polygon';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polygon')
                .setCheck('Polygon')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rotate_polygon_input_polygon);
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rotate_polygon_input_angle.toLowerCase());
            this.appendValueInput('StartAngle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rotate_polygon_input_start_angle.toLowerCase());
            this.appendValueInput('Segments')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rotate_polygon_input_segments.toLowerCase());
            this.setOutput(true, 'CsgMesh');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_extrude_rectangular_path_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polygon: JavaScript.valueToCode(block, 'Polygon', JavaScript.ORDER_ATOMIC),
            angle: JavaScript.valueToCode(block, 'Angle', JavaScript.ORDER_ATOMIC),
            startAngle: JavaScript.valueToCode(block, 'StartAngle', JavaScript.ORDER_ATOMIC),
            segments: JavaScript.valueToCode(block, 'Segments', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polygon, resources.block_angle, resources.block_start_angle, resources.block_segments
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const options = {
                angle: BitByBit.BABYLON.Angle.FromDegrees(inputs.angle).radians(),
                startAngle: BitByBit.BABYLON.Angle.FromDegrees(inputs.startAngle).radians(),
                overflow: 'cap',
                segments: inputs.segments
            };
            const extrusion = BitByBit.CSG.extrusions.extrudeRotate(options, inputs.polygon);
            return extrusion;
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
            getRequired(resources, resources.block_angle),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_start_angle),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_segments),
        ]
    }];
}
