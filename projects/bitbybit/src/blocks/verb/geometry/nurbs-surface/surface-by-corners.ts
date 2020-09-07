import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createSurfaceByCornersBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_by_corners';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point1')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_corners_input_point1);
            this.appendValueInput('Point2')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_corners_input_point2.toLowerCase());
            this.appendValueInput('Point3')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_corners_input_point3.toLowerCase());
            this.appendValueInput('Point4')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_corners_input_point4.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_surface_by_corners_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point1: JavaScript.valueToCode(block, 'Point1', JavaScript.ORDER_ATOMIC),
            point2: JavaScript.valueToCode(block, 'Point2', JavaScript.ORDER_ATOMIC),
            point3: JavaScript.valueToCode(block, 'Point3', JavaScript.ORDER_ATOMIC),
            point4: JavaScript.valueToCode(block, 'Point4', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_point, resources.block_point, resources.block_point
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return verb.geom.NurbsSurface.byCorners(inputs.point1, inputs.point2, inputs.point3, inputs.point4);`);
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
            getRequired(resources, resources.block_point),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_point),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_point),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_point),
        ]
    }];
}
