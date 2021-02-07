import { ResourcesService } from '../../../../../resources';

export function polylineCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_polyline}"  categorystyle="geometry_category">
        <category name="${resources.block_toolbox_category_draw}"  categorystyle="geometry_category">
            <block type="babylon_draw_polyline">
                <value name="Colour">
                    <block type="colour_picker">
                        <field name="COLOUR">#555</field>
                    </block>
                </value>
                <value name="Width">
                    <block type="math_number">
                        <field name="NUM">3</field>
                    </block>
                </value>
                <value name="Opacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="Updatable">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
            </block>
            <block type="babylon_draw_polylines">
                <value name="Colour">
                    <block type="colour_picker">
                        <field name="COLOUR">#555</field>
                    </block>
                </value>
                <value name="Width">
                    <block type="math_number">
                        <field name="NUM">3</field>
                    </block>
                </value>
                <value name="Opacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="Updatable">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_create}"  categorystyle="geometry_category">
            <block type="base_geometry_polyline">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
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
