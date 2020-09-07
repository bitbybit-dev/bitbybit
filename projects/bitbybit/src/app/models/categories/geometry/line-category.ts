import { ResourcesService } from '../../../../resources';

export function lineCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_line}" expanded="true" categorystyle="geometry_category">
        <block type="babylon_draw_line">
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
        <block type="babylon_draw_line">
            <value name="Line">
                <shadow type="base_geometry_line">
                    <value name="StartPoint">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">-1</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">-1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">-1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="EndPoint">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                </shadow>
            </value>
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
        <block type="babylon_draw_lines">
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
            <block type="base_geometry_line">
            </block>
            <block type="base_geometry_line">
                <value name="StartPoint">
                    <shadow type="base_geometry_point">
                        <value name="X">
                            <shadow type="math_number">
                                <field name="NUM">-1</field>
                            </shadow>
                        </value>
                        <value name="Y">
                            <shadow type="math_number">
                                <field name="NUM">-1</field>
                            </shadow>
                        </value>
                        <value name="Z">
                            <shadow type="math_number">
                                <field name="NUM">-1</field>
                            </shadow>
                        </value>
                    </shadow>
                </value>
                <value name="EndPoint">
                    <shadow type="base_geometry_point">
                        <value name="X">
                            <shadow type="math_number">
                                <field name="NUM">1</field>
                            </shadow>
                        </value>
                        <value name="Y">
                            <shadow type="math_number">
                                <field name="NUM">1</field>
                            </shadow>
                        </value>
                        <value name="Z">
                            <shadow type="math_number">
                                <field name="NUM">1</field>
                            </shadow>
                        </value>
                    </shadow>
                </value>
            </block>
            <block type="base_geometry_lines">
            </block>
            <block type="base_geometry_lines_between_points">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <block type="base_geometry_line_transform">
            </block>
            <block type="base_geometry_line_length">
            </block>
            <block type="base_geometry_line_start_point">
            </block>
            <block type="base_geometry_line_end_point">
            </block>
            <block type="base_geometry_line_reverse">
            </block>
            <block type="base_geometry_line_convert_to_nurbs_curve">
            </block>
            <block type="base_geometry_lines_convert_to_nurbs_curves">
            </block>
        </category>
    </category>
`;
}
