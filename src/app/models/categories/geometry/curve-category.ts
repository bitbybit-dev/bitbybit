import { ResourcesService } from 'src/resources';

export function curveCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_curve}" expanded="true" categorystyle="geometry_category">
        <block type="babylon_draw_curve">
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
        <block type="babylon_draw_curves">
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
        <category name="${resources.block_toolbox_category_create}"  expanded="true" categorystyle="geometry_category">
            <block type="verb_geometry_nurbs_curve_by_points">
                <value name="Degree">
                    <shadow type="math_number">
                        <field name="NUM">3</field>
                    </shadow>
                </value>
            </block>
            <block type="verb_geometry_nurbs_curve_by_knots_control_points_weights">
            </block>
            <block type="verb_geometry_bezier_curve_by_points">
            </block>
            <category name="${resources.block_toolbox_category_geom_circle}"  expanded="true" categorystyle="geometry_category">
                <block type="verb_geometry_nurbs_curve_circle">
                    <value name="Center">
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
                    <value name="XAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
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
                    <value name="YAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="verb_geometry_nurbs_curve_arc">
                    <value name="Center">
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
                    <value name="XAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
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
                    <value name="YAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="MinAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="MaxAngle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_geom_ellipse}"  expanded="true" categorystyle="geometry_category">
                <block type="verb_geometry_nurbs_curve_ellipse">
                    <value name="Center">
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
                    <value name="XAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
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
                    <value name="YAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                </block>
                <block type="verb_geometry_nurbs_curve_ellipse_arc">
                    <value name="Center">
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
                    <value name="XAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
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
                    <value name="YAxis">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">0</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="MinAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="MaxAngle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>
            </category>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <block type="verb_geometry_nurbs_curve_divide_by_arc_length_points">
            </block>
            <block type="verb_geometry_nurbs_curve_divide_by_arc_length_params">
            </block>
            <block type="verb_geometry_nurbs_curve_divide_by_equal_arc_length_points">
            </block>
            <block type="verb_geometry_nurbs_curve_divide_by_equal_arc_length_params">
            </block>
            <block type="verb_geometry_nurbs_curve_split">
            </block>
            <block type="verb_geometry_nurbs_curve_closest_point">
            </block>
            <block type="verb_geometry_nurbs_curve_closest_points">
            </block>
            <block type="verb_geometry_nurbs_curve_closest_param">
            </block>
            <block type="verb_geometry_nurbs_curve_closest_params">
            </block>
            <block type="verb_geometry_nurbs_curve_start_point">
            </block>
            <block type="verb_geometry_nurbs_curve_end_point">
            </block>
            <block type="verb_geometry_nurbs_curve_point_at_param">
            </block>
            <block type="verb_geometry_nurbs_curve_length">
            </block>
            <block type="verb_geometry_nurbs_curve_degree">
            </block>
            <block type="verb_geometry_nurbs_curve_knots">
            </block>
            <block type="verb_geometry_nurbs_curve_weights">
            </block>
            <block type="verb_geometry_nurbs_curve_control_points">
            </block>
            <block type="verb_geometry_nurbs_curve_length_at_param">
            </block>
            <block type="verb_geometry_nurbs_curve_param_at_length">
            </block>
            <block type="verb_geometry_nurbs_curve_clone">
            </block>
            <block type="verb_geometry_nurbs_curve_domain">
            </block>
            <block type="verb_geometry_nurbs_curve_transform">
            </block>
            <block type="verb_geometry_nurbs_curve_derivatives">
            </block>
            <block type="verb_geometry_nurbs_curve_reverse">
            </block>
            <block type="verb_geometry_nurbs_curve_tangent">
            </block>
            <block type="verb_geometry_nurbs_curve_tessellate">
            </block>
            <block type="verb_geometry_nurbs_curves_points_at_param">
            </block>
            <block type="verb_geometry_nurbs_curves_start_points">
            </block>
            <block type="verb_geometry_nurbs_curves_end_points">
            </block>
            <block type="verb_geometry_nurbs_curves_transform">
            </block>
            <block type="verb_geometry_nurbs_curves_divide_by_arc_length_points">
            </block>
            <block type="verb_geometry_nurbs_curves_divide_by_equal_arc_length_points">
            </block>
            <category name="${resources.block_toolbox_category_geom_circle}" expanded="true" categorystyle="geometry_category">
                <block type="verb_geometry_nurbs_curve_circle_center">
                </block>
                <block type="verb_geometry_nurbs_curve_circle_radius">
                </block>
                <block type="verb_geometry_nurbs_curve_circle_x_axis">
                </block>
                <block type="verb_geometry_nurbs_curve_circle_y_axis">
                </block>
                <block type="verb_geometry_nurbs_curve_circle_min_angle">
                </block>
                <block type="verb_geometry_nurbs_curve_circle_max_angle">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_geom_ellipse}" expanded="true" categorystyle="geometry_category">
                <block type="verb_geometry_nurbs_curve_ellipse_center">
                </block>
                <block type="verb_geometry_nurbs_curve_ellipse_x_axis">
                </block>
                <block type="verb_geometry_nurbs_curve_ellipse_y_axis">
                </block>
                <block type="verb_geometry_nurbs_curve_ellipse_min_angle">
                </block>
                <block type="verb_geometry_nurbs_curve_ellipse_max_angle">
                </block>
            </category>
        </category>
    </category>
`;
}
