export function toolboxDefinition() {
    return `
<xml id="toolbox" style="display: none">
    <category name="Scene" categorystyle="scene_category">
        <block type="functions_activate_grid">
            <value name="width">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="height">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="subdivisions">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="major_unit_frequency">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="minor_unit_visibility">
                <shadow type="math_number">
                    <field name="NUM">0.45</field>
                </shadow>
            </value>
            <value name="grid_ratio">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="opacity">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="back_face_culling">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
            <value name="main_color">
                <shadow type="colour_picker">
                    <field name="COLOUR">#000</field>
                </shadow>
            </value>
            <value name="line_color">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
        </block>
        <block type="functions_scene_colour">
            <value name="colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#eee</field>
                </shadow>
            </value>
        </block>
    </category>
    <category name="Points" categorystyle="geometry_category">
        <block type="geometry_point">
        </block>
        <block type="geometry_point">
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
        <block type="functions_drawpoint">
        </block>
        <block type="functions_drawpoint">
            <value name="Point">
                <shadow type="geometry_point">
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
        <block type="functions_drawpoints">
        </block>
        <block type="geometry_point_distance">
        </block>
    </category>
    <category name="Lines" categorystyle="geometry_category">
        <block type="geometry_line">
        </block>
        <block type="geometry_line">
            <value name="start_point">
                <shadow type="geometry_point">
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
            <value name="end_point">
                <shadow type="geometry_point">
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
        <block type="functions_draw_line">
        </block>
        <block type="functions_draw_line">
            <value name="Line">
                <shadow type="geometry_line">
                    <value name="start_point">
                        <shadow type="geometry_point">
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
                    <value name="end_point">
                        <shadow type="geometry_point">
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
        <block type="functions_draw_lines">
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
        <block type="functions_line_length">
        </block>
    </category>
    <category name="Polyline" categorystyle="geometry_category">
        <block type="geometry_polyline">
        </block>
        <block type="functions_draw_polyline">
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
        <block type="functions_polyline_length">
        </block>
    </category>
    <category name="Curves" categorystyle="geometry_category">
        <block type="geometry_curve_by_points">
            <value name="Degree">
                <shadow type="math_number">
                    <field name="NUM">3</field>
                </shadow>
            </value>
        </block>
        <block type="geometry_curve_by_knots_control_points_weights">
        </block>
        <block type="functions_draw_curve">
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
        <block type="functions_curve_divide_by_arc_length_points">
        </block>
        <block type="functions_curve_divide_by_arc_length_params">
        </block>
        <block type="functions_curve_divide_by_equal_arc_length_points">
        </block>
        <block type="functions_curve_divide_by_equal_arc_length_params">
        </block>
        <block type="functions_curve_split">
        </block>
        <block type="functions_curve_closest_point">
        </block>
        <block type="functions_curve_closest_points">
        </block>
        <block type="functions_curve_closest_param">
        </block>
        <block type="functions_curve_closest_params">
        </block>
        <block type="functions_curve_length">
        </block>
        <block type="functions_curve_length_at_param">
        </block>
        <block type="functions_curve_param_at_length">
        </block>
    </category>
    <sep></sep>
    <category name="Loop" categorystyle="control_category">
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
    <category name="Logic" categorystyle="logic_category">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_boolean"></block>
        <block type="logic_negate"></block>
        <block type="logic_null"></block>
        <block type="logic_ternary"></block>
    </category>
    <category name="Math" categorystyle="math_category">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
        <block type="math_single"></block>
    </category>
    <category name="Lists" categorystyle="lists_category">
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
    <category name="Colour" categorystyle="colour_category">
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
    <category name="Text" categorystyle="text_category">
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
    <category name="Variables" categorystyle="variables_category" custom="VARIABLE"></category>
    <category name="Functions" categorystyle="functions_category" custom="PROCEDURE"></category>
</xml>
`
}