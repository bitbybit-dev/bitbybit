import { ResourcesService } from 'src/resources';

export function polylineCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_polyline}" expanded="true" categorystyle="geometry_category">
        <block type="babylon_draw_polyline">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Width">
                <shadow type="math_number">
                    <field name="NUM">3</field>
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
        <block type="babylon_draw_polylines">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Width">
                <shadow type="math_number">
                    <field name="NUM">3</field>
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
        <category name="${resources.block_toolbox_category_create}" expanded="true" categorystyle="geometry_category">
            <block type="base_geometry_polyline">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <block type="base_geometry_polyline_transform">
            </block>
            <block type="base_geometry_polyline_length">
            </block>
            <block type="base_geometry_polyline_reverse">
            </block>
            <block type="base_geometry_polyline_points">
            </block>
            <block type="base_geometry_polyline_points_count">
            </block>
            <block type="base_geometry_polyline_convert_to_nurbs_curve">
            </block>
        </category>
    </category>
`;
}
