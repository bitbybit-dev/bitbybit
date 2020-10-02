import { ALIGN_RIGHT, Block, Blocks, VARIABLE_CATEGORY_NAME, FieldVariable } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawCsgPolygonBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_csg_primitive_2d_polygon';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('CsgPolygon')
                .setCheck('Polygon')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_draw_csg_primitive_2d_polygon_input_polygon)
                .appendField(new FieldVariable(resources.block_babylon_draw_csg_primitive_2d_polygon_input_polygon_variable), 'DrawnCsgPolygonMesh')
                .appendField(resources.block_babylon_draw_csg_primitive_2d_polygon_input_polygon_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_surface_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            polygon: JavaScript.valueToCode(block, 'CsgPolygon', JavaScript.ORDER_ATOMIC),
            colour: JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC),
            opacity: JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC),
            updatable: JavaScript.valueToCode(block, 'Updatable', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_mesh, resources.block_colour, resources.block_opacity
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            let vertices = [];

            if(inputs.polygon.sides){
                const allVerts = BitByBit.CSG.geometries.geom2.toPoints(inputs.polygon);
                vertices = allVerts.map(vert => {
                    return new BitByBit.BABYLON.Vector2(vert[0], vert[1]);
                }).reverse();
                console.log('vertices', vertices);
            } else if(inputs.polygon.vertices){
                vertices = inputs.polygon.vertices.map(vert => {
                    return new BitByBit.BABYLON.Vector2(vert[0], vert[1]);
                }).reverse();
            }

            inputs.csgPolygon = ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnCsgPolygonMesh'), VARIABLE_CATEGORY_NAME)};

            const createMesh = () => {
                const meshBuilder = new BitByBit.BABYLON.PolygonMeshBuilder("csgPolygonMesh${Math.random}", vertices, BitByBit.scene);
                inputs.csgPolygon = meshBuilder.build(inputs.updatable);
                inputs.csgPolygon.material = new BitByBit.BABYLON.StandardMaterial();

                ${JavaScript.variableDB_.getName(block.getFieldValue('DrawnCsgPolygonMesh'), VARIABLE_CATEGORY_NAME)} = inputs.csgPolygon;
            }

            if(inputs.csgPolygon && inputs.updatable){
                inputs.csgPolygon.dispose();
                createMesh();
            } else {
                createMesh();
            }

            inputs.csgPolygon.material.alpha = inputs.opacity;
            inputs.csgPolygon.material.diffuseColor = BitByBit.BABYLON.Color3.FromHexString(inputs.colour);
            inputs.csgPolygon.material.specularColor = new BitByBit.BABYLON.Color3(1, 1, 1);
            inputs.csgPolygon.material.ambientColor = new BitByBit.BABYLON.Color3(1, 1, 1);
            inputs.csgPolygon.material.backFaceCulling = false;
            inputs.csgPolygon.isPickable = false;
`);
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_mesh)
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },
    {
        entity: keys[2],
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    }];
}
