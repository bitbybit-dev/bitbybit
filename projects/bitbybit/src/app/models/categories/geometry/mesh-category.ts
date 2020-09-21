import { ResourcesService } from '../../../../resources';

export function meshCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_mesh}" expanded="true" categorystyle="geometry_category">
        <block type="csg_polygon">
        </block>
        <block type="csg_extrude_linear">
        </block>
        <block type="babylon_draw_csg_mesh">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Opacity">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="Updatable">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
    </category>
`;
}
