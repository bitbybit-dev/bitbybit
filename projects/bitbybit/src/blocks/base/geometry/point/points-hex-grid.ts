import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { pointConstants } from './point-constants';
import { Point } from 'projects/bitbybit-core/src/lib/api/inputs/point-inputs';

export function createPointHexGridBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_point_hex_grid';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('NrHexagonsX')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_hex_grid_input_nr_hexagons_x);
            this.appendValueInput('NrHexagonsY')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_hex_grid_input_nr_hexagons_y.toLowerCase());
            this.appendValueInput('RadiusHexagon')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geom_point_hex_grid_input_hexagon_radius.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geom_point_hex_grid_description);
            this.setHelpUrl(environment.docsUrl + pointConstants.helpUrl + '#' + 'spiral');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs: Point.HexGridCentersDto = {
            nrHexagonsX: (JavaScript as any).valueToCode(block, 'NrHexagonsX', (JavaScript as any).ORDER_ATOMIC),
            nrHexagonsY: (JavaScript as any).valueToCode(block, 'NrHexagonsY', (JavaScript as any).ORDER_ATOMIC),
            radiusHexagon: (JavaScript as any).valueToCode(block, 'RadiusHexagon', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_base_geom_point_hex_grid_input_nr_hexagons_x,
            resources.block_base_geom_point_hex_grid_input_nr_hexagons_y,
            resources.block_base_geom_point_hex_grid_input_hexagon_radius
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.point.hexGrid(inputs);`);
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
            getRequired(resources, resources.block_base_geom_point_hex_grid_input_nr_hexagons_x),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_base_geom_point_hex_grid_input_nr_hexagons_y),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_base_geom_point_hex_grid_input_hexagon_radius),
        ]
    }];
}

