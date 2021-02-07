import { ResourcesService } from '../../../../../resources';

export function lineCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_line}"  categorystyle="geometry_category">
        <category name="${resources.block_toolbox_category_draw}"  categorystyle="geometry_category">
            <block type="babylon_draw_line">
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
            <block type="babylon_draw_line">
                <value name="Line">
                    <block type="base_geometry_line">
                        <value name="StartPoint">
                            <block type="base_geometry_point">
                                <value name="X">
                                    <block type="math_number">
                                        <field name="NUM">-1</field>
                                    </block>
                                </value>
                                <value name="Y">
                                    <block type="math_number">
                                        <field name="NUM">-1</field>
                                    </block>
                                </value>
                                <value name="Z">
                                    <block type="math_number">
                                        <field name="NUM">-1</field>
                                    </block>
                                </value>
                            </block>
                        </value>
                        <value name="EndPoint">
                            <block type="base_geometry_point">
                                <value name="X">
                                    <block type="math_number">
                                        <field name="NUM">1</field>
                                    </block>
                                </value>
                                <value name="Y">
                                    <block type="math_number">
                                        <field name="NUM">1</field>
                                    </block>
                                </value>
                                <value name="Z">
                                    <block type="math_number">
                                        <field name="NUM">1</field>
                                    </block>
                                </value>
                            </block>
                        </value>
                    </block>
                </value>
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
            <block type="babylon_draw_lines">
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
            <block type="base_geometry_line">
            </block>
            <block type="base_geometry_line">
                <value name="StartPoint">
                    <block type="base_geometry_point">
                        <value name="X">
                            <block type="math_number">
                                <field name="NUM">-1</field>
                            </block>
                        </value>
                        <value name="Y">
                            <block type="math_number">
                                <field name="NUM">-1</field>
                            </block>
                        </value>
                        <value name="Z">
                            <block type="math_number">
                                <field name="NUM">-1</field>
                            </block>
                        </value>
                    </block>
                </value>
                <value name="EndPoint">
                    <block type="base_geometry_point">
                        <value name="X">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Y">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Z">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                    </block>
                </value>
            </block>
            <block type="base_geometry_lines">
            </block>
            <block type="base_geometry_lines_between_points">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
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
