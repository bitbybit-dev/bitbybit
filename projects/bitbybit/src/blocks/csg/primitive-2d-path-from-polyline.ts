import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createPrimitive2dPathFromPolylineBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_path_from_polyline';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_from_polyline_input_polyline);
            this.appendValueInput('Closed')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_primitive_2d_path_from_polyline_input_closed.toLowerCase());
            this.setOutput(true, 'Path');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_primitive_2d_path_from_polyline_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: (JavaScript as any).valueToCode(block, 'Polyline', (JavaScript as any).ORDER_ATOMIC),
            closed: (JavaScript as any).valueToCode(block, 'Closed', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline, resources.block_closed
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
            const duplicatePointsRemoved = BitByBit.BitByBitBlocklyHelperService.removeConsecutiveDuplicates(twoDimensionalPoints, BitByBit.BitByBitBlocklyHelperService.tolerance);
            let path2d = BitByBit.CSG.geometries.path2.fromPoints({}, duplicatePointsRemoved);
            if(inputs.closed){
                path2d = BitByBit.CSG.geometries.path2.close(path2d);
            }
            return path2d;
`
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
            getRequired(resources, resources.block_polyline),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_closed),
        ]
    }];
}
