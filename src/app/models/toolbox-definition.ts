import { ResourcesService } from 'src/resources'

export function toolboxDefinition() {
    const resources = ResourcesService.getResources();
    return `
    <xml id="toolbox" style="display: none">
    <category name="${resources.block_toolbox_category_scene}" categorystyle="scene_category">
        <block type="babylon_draw_grid">
            <value name="Width">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="Height">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="Subdivisions">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="MajorUnitFrequency">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="MinorUnitVisibility">
                <shadow type="math_number">
                    <field name="NUM">0.45</field>
                </shadow>
            </value>
            <value name="GridRatio">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="Opacity">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="BackFaceCulling">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
            <value name="MainColor">
                <shadow type="colour_picker">
                    <field name="COLOUR">#000</field>
                </shadow>
            </value>
            <value name="LineColor">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
        </block>
        <block type="babylon_scene_background_colour">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#eee</field>
                </shadow>
            </value>
        </block>
    </category>
    <sep></sep>
    <category name="${resources.block_toolbox_category_core_types}" categorystyle="verb_core_category">
        <block type="verb_core_interval">
        </block>
        <block type="verb_core_interval">
            <value name="Min">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Max">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        <block type="verb_core_interval_get_min">
        </block>
        <block type="verb_core_interval_get_max">
        </block>
        <block type="verb_core_uv">
        </block>
        <block type="verb_core_uv">
            <value name="U">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="V">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="verb_core_uv_get_u">
        </block>
        <block type="verb_core_uv_get_v">
        </block>
    </category>
    <category name="${resources.block_toolbox_category_core_transforms}" categorystyle="verb_core_category">
        <block type="babylon_transformation_scale_uniform">
            <value name="Scale">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="babylon_transformation_scale_center_uniform">
            <value name="Scale">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
            <value name="Center">
                <shadow type="verb_core_vector">
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
       </block>
        <block type="babylon_transformation_scale_xyz">
            <value name="ScaleXYZ">
                <shadow type="verb_core_vector">
                    <value name="X">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Y">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Z">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </shadow>
            </value>
        </block>
        <block type="babylon_transformation_scale_center_xyz">
            <value name="ScaleXYZ">
                <shadow type="verb_core_vector">
                    <value name="X">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Y">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Z">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </shadow>
            </value>
            <value name="Center">
                <shadow type="verb_core_vector">
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
       </block>
       <block type="babylon_transformation_translation_xyz">
            <value name="Translation">
                <shadow type="verb_core_vector">
                    <value name="X">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Y">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Z">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </shadow>
            </value>
        </block>
        <block type="babylon_transformation_rotation_center_axis">
            <value name="Angle">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Axis">
                <shadow type="verb_core_vector">
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
            <value name="Center">
                <shadow type="verb_core_vector">
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
        </block>
        <block type="babylon_transformation_rotation_center_x">
            <value name="Angle">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Center">
                <shadow type="verb_core_vector">
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
        </block>
        <block type="babylon_transformation_rotation_center_y">
            <value name="Angle">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Center">
                <shadow type="verb_core_vector">
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
        </block>
        <block type="babylon_transformation_rotation_center_z">
            <value name="Angle">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Center">
                <shadow type="verb_core_vector">
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
        </block>
    </category>
    <category name="${resources.block_toolbox_category_core_vector}" categorystyle="verb_core_category">
        <block type="verb_core_vector">
        </block>
        <block type="verb_core_vector">
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
        <block type="verb_core_vector_angle_between">
        </block>
        <block type="verb_core_vector_angle_between_normalized_2d">
        </block>
        <block type="verb_core_vector_positive_angle_between">
        </block>
        <block type="verb_core_vector_signed_angle_between">
        </block>
        <block type="verb_core_vector_distance">
        </block>
        <block type="verb_core_vector_distance_squared">
        </block>
        <block type="verb_core_vector_on_ray">
        </block>
        <block type="verb_core_vector_lerp">
        </block>
        <block type="verb_core_vector_sum">
        </block>
        <block type="verb_core_vector_add">
        </block>
        <block type="verb_core_vector_sub">
        </block>
        <block type="verb_core_vector_mul">
        </block>
        <block type="verb_core_vector_div">
        </block>
        <block type="verb_core_vector_dot">
        </block>
        <block type="verb_core_vector_cross">
        </block>
        <block type="verb_core_vector_add_all">
        </block>
        <block type="verb_core_vector_is_zero">
        </block>
        <block type="verb_core_vector_norm">
        </block>
        <block type="verb_core_vector_norm_squared">
        </block>
        <block type="verb_core_vector_domain">
        </block>
        <block type="verb_core_vector_min">
        </block>
        <block type="verb_core_vector_max">
        </block>
        <block type="verb_core_vector_negate">
        </block>
        <block type="verb_core_vector_range">
        </block>
        <block type="verb_core_vector_span">
        </block>
        <block type="verb_core_vector_all">
        </block>
        <block type="verb_core_vector_finite">
        </block>
        <block type="verb_core_vector_normalized">
        </block>
    </category>
    <sep></sep>
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
        </category>
    </category>
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
        </category>
    </category>
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
    <category name="${resources.block_toolbox_category_geom_surface}" expanded="true" categorystyle="geometry_category">
        <block type="babylon_draw_surface">
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
        </block>
        <block type="babylon_draw_surfaces">
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
        </block>
        <category name="${resources.block_toolbox_category_create}"  expanded="true" categorystyle="geometry_category">
            <block type="verb_geometry_nurbs_surface_by_corners">
            </block>
            <block type="verb_geometry_nurbs_surface_by_lofting_curves">
            </block>
            <block type="verb_geometry_nurbs_surface_by_knots_control_points_weights">
            </block>
            <category name="${resources.block_toolbox_category_geom_sphere}" categorystyle="geometry_category">
                <block type="verb_geometry_spherical_surface">
                </block>
            </category>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <block type="verb_geometry_nurbs_surface_normal">
            </block>
            <block type="verb_geometry_nurbs_surface_point">
            </block>
            <block type="verb_geometry_nurbs_surface_closest_param">
            </block>
            <block type="verb_geometry_nurbs_surface_closest_point">
            </block>
            <block type="verb_geometry_nurbs_surface_boundaries">
            </block>
            <block type="verb_geometry_nurbs_surface_isocurve">
            </block>
            <block type="verb_geometry_nurbs_surface_reverse">
            </block>
            <block type="verb_geometry_nurbs_surface_split">
            </block>
            <block type="verb_geometry_nurbs_surface_transform">
            </block>
            <block type="verb_geometry_nurbs_surface_clone">
            </block>
            <block type="verb_geometry_nurbs_surface_control_points">
            </block>
            <block type="verb_geometry_nurbs_surface_weights">
            </block>
            <block type="verb_geometry_nurbs_surface_degree_u">
            </block>
            <block type="verb_geometry_nurbs_surface_degree_v">
            </block>
            <block type="verb_geometry_nurbs_surface_knots_u">
            </block>
            <block type="verb_geometry_nurbs_surface_knots_v">
            </block>
            <block type="verb_geometry_nurbs_surface_domain_u">
            </block>
            <block type="verb_geometry_nurbs_surface_domain_v">
            </block>
            <block type="verb_geometry_nurbs_surface_derivatives">
            </block>
            <category name="${resources.block_toolbox_category_geom_sphere}" expanded="true" categorystyle="geometry_category">
                <block type="verb_geometry_spherical_surface_center">
                </block>
                <block type="verb_geometry_spherical_surface_radius">
                </block>
            </category>
        </category>
    </category>
    <sep></sep>
    <category name="${resources.block_toolbox_category_loop}" categorystyle="control_category">
        <block type="controls_repeat_ext">
            <value name="TIMES">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="controls_whileUntil">
        </block>
        <block type="controls_for"></block>
        <block type="controls_forEach">
        </block>
        <block type="controls_flow_statements">
        </block>
    </category>
    <category name="${resources.block_toolbox_category_logic}" categorystyle="logic_category">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
        <block type="logic_negate"></block>
        <block type="logic_null"></block>
        <block type="logic_ternary"></block>
    </category>
    <category name="${resources.block_toolbox_category_math}" categorystyle="math_category">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_single"></block>
    </category>
    <category name="${resources.block_toolbox_category_lists}" categorystyle="lists_category">
        <block type="lists_create_with">
            <mutation items="0"></mutation>
        </block>
        <block type="lists_create_with"></block>
        <block type="lists_repeat">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM">5</field>
                </shadow>
            </value>
        </block>
        <block type="lists_length"></block>
        <block type="lists_isEmpty"></block>
        <block type="lists_indexOf">
            <value name="VALUE">
                <block type="variables_get">
                    <field name="VAR">{listVariable}</field>
                </block>
            </value>
        </block>
        <block type="lists_getIndex">
            <value name="VALUE">
                <block type="variables_get">
                    <field name="VAR">{listVariable}</field>
                </block>
            </value>
        </block>
        <block type="lists_setIndex">
            <value name="LIST">
                <block type="variables_get">
                    <field name="VAR">{listVariable}</field>
                </block>
            </value>
        </block>
        <block type="lists_getSublist">
            <value name="LIST">
                <block type="variables_get">
                    <field name="VAR">{listVariable}</field>
                </block>
            </value>
        </block>
        <block type="lists_split">
            <value name="DELIM">
                <shadow type="text">
                    <field name="TEXT">,</field>
                </shadow>
            </value>
        </block>
        <block type="lists_sort"></block>
    </category>
    <category name="${resources.block_toolbox_category_colour}" categorystyle="colour_category">
        <block type="colour_picker">
            <field name="COLOUR">#FEF8DD</field>
        </block>
        <block type="colour_random"></block>
        <block type="colour_rgb">
            <value name="RED">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
            <value name="GREEN">
                <shadow type="math_number">
                    <field name="NUM">50</field>
                </shadow>
            </value>
            <value name="BLUE">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="colour_blend">
            <value name="COLOUR1">
                <shadow type="colour_picker">
                    <field name="COLOUR">#FEF8DD</field>
                </shadow>
            </value>
            <value name="COLOUR2">
                <shadow type="colour_picker">
                    <field name="COLOUR">#ACDDDE</field>
                </shadow>
            </value>
            <value name="RATIO">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
        </block>
    </category>
    <category name="${resources.block_toolbox_category_text}" categorystyle="text_category">
        <block type="text"></block>
        <block type="text_join"></block>
        <block type="text_append">
            <value name="TEXT">
                <shadow type="text"></shadow>
            </value>
        </block>
        <block type="text_length">
            <value name="VALUE">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="text_isEmpty">
            <value name="VALUE">
                <shadow type="text">
                    <field name="TEXT"></field>
                </shadow>
            </value>
        </block>
        <block type="text_indexOf">
            <value name="VALUE">
                <block type="variables_get">
                    <field name="VAR">{textVariable}</field>
                </block>
            </value>
            <value name="FIND">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="text_charAt">
            <value name="VALUE">
                <block type="variables_get">
                    <field name="VAR">{textVariable}</field>
                </block>
            </value>
        </block>
        <block type="text_getSubstring">
            <value name="STRING">
                <block type="variables_get">
                    <field name="VAR">{textVariable}</field>
                </block>
            </value>
        </block>
        <block type="text_changeCase">
            <value name="TEXT">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="text_trim">
            <value name="TEXT">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="text_print">
            <value name="TEXT">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="text_prompt_ext">
            <value name="TEXT">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
    </category>
    <category name="${resources.block_toolbox_category_variables}" categorystyle="variables_category" custom="VARIABLE"></category>
    <category name="${resources.block_toolbox_category_functions}" categorystyle="functions_category" custom="PROCEDURE"></category>
</xml>
`
}