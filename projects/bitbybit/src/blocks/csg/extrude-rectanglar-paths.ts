import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createExtrudeRectangularPathsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_extrude_rectangular_paths';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Paths')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rectangular_paths_input_paths);
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rectangular_paths_input_size.toLowerCase());
            this.appendValueInput('Height')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_csg_extrude_rectangular_paths_input_height.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_extrude_rectangular_paths_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            paths: (JavaScript as any).valueToCode(block, 'Paths', (JavaScript as any).ORDER_ATOMIC),
            size: (JavaScript as any).valueToCode(block, 'Size', (JavaScript as any).ORDER_ATOMIC),
            height: (JavaScript as any).valueToCode(block, 'Height', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_2d_paths, resources.block_size, resources.block_height
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const extrusions = BitByBit.CSG.extrusions.extrudeRectangular({height: inputs.height, size: inputs.size}, ...inputs.paths);
            if (!extrusions.length){
                extrusions = [extrusions];
            }
            return extrusions;
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
            getRequired(resources, resources.block_2d_paths),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_size),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_height),
        ]
    }];
}
