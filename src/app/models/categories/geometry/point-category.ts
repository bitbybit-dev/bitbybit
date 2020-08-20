import { ResourcesService } from 'src/resources';

export function pointCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_point}" expanded="true" categorystyle="geometry_category">
        <block type="babylon_draw_point">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Size">
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
        <block type="babylon_draw_point">
            <value name="Point">
                <shadow type="base_geometry_point">
                    <value name="X">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Y">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Z">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                </shadow>
            </value>
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Size">
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
        <block type="babylon_draw_points">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Size">
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
            <block type="base_geometry_point">
            </block>
            <block type="base_geometry_point">
                <value name="X">
                    <shadow type="math_number">
                        <field name="NUM">0</field>
                    </shadow>
                </value>
                <value name="Y">
                    <shadow type="math_number">
                        <field name="NUM">0</field>
                    </shadow>
                </value>
                <value name="Z">
                    <shadow type="math_number">
                        <field name="NUM">0</field>
                    </shadow>
                </value>
            </block>
            <block type="base_geometry_point_list">
                <value name="Point">
                    <shadow type="base_geometry_point">
                        <value name="X">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Y">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Z">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                    </shadow>
                </value>
                <value name="AmountOfPoints">
                    <shadow type="math_number">
                        <field name="NUM">10</field>
                    </shadow>
                </value>
            </block>
            <block type="base_geometry_point_spiral">
                <value name="Factor">
                    <shadow type="math_number">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
                <value name="Radius">
                    <shadow type="math_number">
                        <field name="NUM">6</field>
                    </shadow>
                </value>
                <value name="NumberPoints">
                    <shadow type="math_number">
                        <field name="NUM">200</field>
                    </shadow>
                </value>
                <value name="Phi">
                    <shadow type="math_number">
                        <field name="NUM">0.9</field>
                    </shadow>
                </value>
                <value name="Widening">
                    <shadow type="math_number">
                        <field name="NUM">3</field>
                    </shadow>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <block type="base_geometry_point_transform">
            </block>
            <block type="base_geometry_points_transform">
            </block>
            <block type="base_geometry_point_distance">
            </block>
            <block type="base_geometry_point_x">
            </block>
            <block type="base_geometry_point_y">
            </block>
            <block type="base_geometry_point_z">
            </block>
            <block type="base_geometry_point_closest_from_points">
            </block>
        </category>
    </category>
`;
}
