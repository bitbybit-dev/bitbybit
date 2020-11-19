import { ResourcesService } from '../../../../../resources';

export function pointCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_point}"  categorystyle="geometry_category">
        <block type="babylon_draw_point">
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
                </block>
            </value>
            <value name="Size">
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
        <block type="babylon_draw_point">
            <value name="Point">
                <block type="base_geometry_point">
                    <value name="X">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="Y">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="Z">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                </block>
            </value>
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
                </block>
            </value>
            <value name="Size">
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
        <block type="babylon_draw_points">
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
                </block>
            </value>
            <value name="Size">
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
        <category name="${resources.block_toolbox_category_create}"  categorystyle="geometry_category">
            <block type="base_geometry_point">
            </block>
            <block type="base_geometry_point">
                <value name="X">
                    <block type="math_number">
                        <field name="NUM">0</field>
                    </block>
                </value>
                <value name="Y">
                    <block type="math_number">
                        <field name="NUM">0</field>
                    </block>
                </value>
                <value name="Z">
                    <block type="math_number">
                        <field name="NUM">0</field>
                    </block>
                </value>
            </block>
            <block type="base_geometry_point_2d">
            </block>
            <block type="base_geometry_point_2d">
                <value name="X">
                    <block type="math_number">
                        <field name="NUM">0</field>
                    </block>
                </value>
                <value name="Y">
                    <block type="math_number">
                        <field name="NUM">0</field>
                    </block>
                </value>
            </block>
            <block type="base_geometry_point_list">
                <value name="Point">
                    <block type="base_geometry_point">
                        <value name="X">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Y">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Z">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                    </block>
                </value>
                <value name="AmountOfPoints">
                    <block type="math_number">
                        <field name="NUM">10</field>
                    </block>
                </value>
            </block>
            <block type="base_geometry_point_spiral">
                <value name="Factor">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="Radius">
                    <block type="math_number">
                        <field name="NUM">6</field>
                    </block>
                </value>
                <value name="NumberPoints">
                    <block type="math_number">
                        <field name="NUM">200</field>
                    </block>
                </value>
                <value name="Phi">
                    <block type="math_number">
                        <field name="NUM">0.9</field>
                    </block>
                </value>
                <value name="Widening">
                    <block type="math_number">
                        <field name="NUM">3</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
            <block type="base_geometry_point_transform">
            </block>
            <block type="base_geometry_points_transform">
            </block>
            <block type="base_geometry_point_x">
            </block>
            <block type="base_geometry_point_y">
            </block>
            <block type="base_geometry_point_z">
            </block>
            <block type="base_geometry_point_distance">
            </block>
            <block type="base_geometry_point_closest_from_points">
            </block>
            <block type="base_geometry_point_closest_from_points_index">
            </block>
            <block type="base_geometry_point_closest_from_points_distance">
            </block>
        </category>
    </category>
`;
}
