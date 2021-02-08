import { ResourcesService } from '../../../../../resources';

export function occCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_occ}"  categorystyle="geometry_category">
        <category name="${resources.block_toolbox_category_occ_draw}"  categorystyle="geometry_category">
            <block type="occt_draw_shape">
                <value name="FaceOpacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="EdgeOpacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="FaceColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000ff</field>
                    </block>
                </value>
                <value name="EdgeColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#bbbbff</field>
                    </block>
                </value>
                <value name="EdgeWidth">
                    <block type="math_number">
                        <field name="NUM">2</field>
                    </block>
                </value>
                <value name="DrawEdges">
                    <block type="logic_boolean">
                        <field name="BOOL">TRUE</field>
                    </block>
                </value>
                <value name="DrawFaces">
                    <block type="logic_boolean">
                        <field name="BOOL">TRUE</field>
                    </block>
                </value>
                <value name="Precision">
                    <block type="math_number">
                        <field name="NUM">0.5</field>
                    </block>
                </value>
                <value name="DrawEdgeIndexes">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
                <value name="EdgeIndexHeight">
                    <block type="math_number">
                        <field name="NUM">0.06</field>
                    </block>
                </value>
                <value name="EdgeIndexColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#bbbbff</field>
                    </block>
                </value>
                <value name="DrawFaceIndexes">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
                <value name="FaceIndexHeight">
                    <block type="math_number">
                        <field name="NUM">0.06</field>
                    </block>
                </value>
                <value name="FaceIndexColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000ff</field>
                    </block>
                </value>
            </block>
            <block type="occt_draw_shape_mesh">
                <value name="FaceOpacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="EdgeOpacity">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
                <value name="FaceColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000ff</field>
                    </block>
                </value>
                <value name="EdgeColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#bbbbff</field>
                    </block>
                </value>
                <value name="EdgeWidth">
                    <block type="math_number">
                        <field name="NUM">2</field>
                    </block>
                </value>
                <value name="DrawEdges">
                    <block type="logic_boolean">
                        <field name="BOOL">TRUE</field>
                    </block>
                </value>
                <value name="DrawFaces">
                    <block type="logic_boolean">
                        <field name="BOOL">TRUE</field>
                    </block>
                </value>
                <value name="Precision">
                    <block type="math_number">
                        <field name="NUM">0.5</field>
                    </block>
                </value>
                <value name="DrawEdgeIndexes">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
                <value name="EdgeIndexHeight">
                    <block type="math_number">
                        <field name="NUM">0.06</field>
                    </block>
                </value>
                <value name="EdgeIndexColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#bbbbff</field>
                    </block>
                </value>
                <value name="DrawFaceIndexes">
                    <block type="logic_boolean">
                        <field name="BOOL">FALSE</field>
                    </block>
                </value>
                <value name="FaceIndexHeight">
                    <block type="math_number">
                        <field name="NUM">0.06</field>
                    </block>
                </value>
                <value name="FaceIndexColour">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000ff</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_occ_io}"  categorystyle="geometry_category">
            <block type="occt_io_shape_to_step_file">
                <value name="FileName">
                    <block type="text">
                        <field name="TEXT">bitbybit-shape.step</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_occ_shapes}"  categorystyle="geometry_category">
            <category name="${resources.block_toolbox_category_occ_edge}"  categorystyle="geometry_category">
                <block type="occt_shapes_edge_fillet_edges">
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">0.3</field>
                        </block>
                    </value>
                </block>
                <block type="occt_shapes_edge_chamfer_edges">
                    <value name="Distance">
                        <block type="math_number">
                            <field name="NUM">0.3</field>
                        </block>
                    </value>
                </block>
                <block type="occt_shapes_edge_get_edge">
                    <value name="Index">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                </block>
            </category>
                <category name="${resources.block_toolbox_category_occ_wire}"  categorystyle="geometry_category">
                    <block type="occt_shapes_wire_create_bspline">
                        <value name="Closed">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="occt_shapes_wire_create_bezier">
                        <value name="Closed">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="occt_shapes_wire_create_circle">
                        <value name="Radius">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Center">
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
                    </block>
                    <block type="occt_shapes_wire_create_polygon">
                    </block>
                    <block type="occt_shapes_wire_get_wire">
                        <value name="Index">
                            <block type="math_number">
                                <field name="NUM">0</field>
                            </block>
                        </value>
                    </block>
                </category>
                <category name="${resources.block_toolbox_category_occ_face}"  categorystyle="geometry_category">
                    <block type="occt_shapes_face_create_circle_face">
                        <value name="Radius">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Center">
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
                    </block>
                    <block type="occt_shapes_face_create_polygon">
                    </block>
                    <block type="occt_shapes_face_create_face_from_wire">
                        <value name="Planar">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="occt_shapes_face_get_face">
                        <value name="Index">
                            <block type="math_number">
                                <field name="NUM">0</field>
                            </block>
                        </value>
                    </block>
                </category>
                <category name="${resources.block_toolbox_category_occ_create_solid}"  categorystyle="geometry_category">
                    <block type="occt_shapes_solid_create_box">
                        <value name="Width">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Length">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Height">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Center">
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
                    </block>
                    <block type="occt_shapes_solid_create_sphere">
                        <value name="Radius">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Center">
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
                    </block>
                    <block type="occt_shapes_solid_create_cylinder">
                        <value name="Radius">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Height">
                            <block type="math_number">
                                <field name="NUM">2</field>
                            </block>
                        </value>
                        <value name="Center">
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
                    </block>
                    <block type="occt_shapes_solid_create_cone">
                        <value name="RadiusOne">
                            <block type="math_number">
                                <field name="NUM">2</field>
                            </block>
                        </value>
                        <value name="RadiusTwo">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="Height">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                    </block>
                </category>
                <category name="${resources.block_toolbox_category_occ_apply_compound}"  categorystyle="geometry_category">
                    <block type="occt_shapes_compound_make_compound">
                    </block>
                </category>
            </category>
            <category name="${resources.block_toolbox_category_occ_operation}"  categorystyle="geometry_category">
                <block type="occt_operations_offset">
                    <value name="Distance">
                        <block type="math_number">
                            <field name="NUM">0.3</field>
                        </block>
                    </value>
                    <value name="Tolerance">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                </block>
                <block type="occt_operations_extrude">
                    <value name="Direction">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                        </block>
                    </value>
                </block>
                <block type="occt_operations_make_thick_solid_simple">
                    <value name="Offset">
                        <block type="math_number">
                            <field name="NUM">0.3</field>
                        </block>
                    </value>
                </block>
                <block type="occt_operations_rotated_extrude">
                    <value name="Angle">
                        <block type="math_number">
                            <field name="NUM">90</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="occt_operations_loft">
                    <value name="MakeSolid">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
                <block type="occt_operations_pipe">
                </block>
                <block type="occt_operations_revolve">
                    <value name="Direction">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Angle">
                        <block type="math_number">
                            <field name="NUM">360</field>
                        </block>
                    </value>
                    <value name="Copy">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_occ_boolean}"  categorystyle="geometry_category">
                <block type="occt_booleans_union">
                    <value name="KeepEdges">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
                <block type="occt_booleans_difference">
                    <value name="KeepEdges">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
                <block type="occt_booleans_intersection">
                    <value name="KeepEdges">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_occ_transform}"  categorystyle="geometry_category">
                <block type="occt_transforms_rotate">
                    <value name="Angle">
                        <block type="math_number">
                            <field name="NUM">90</field>
                        </block>
                    </value>
                    <value name="Axis">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                        </block>
                    </value>
                </block>
                <block type="occt_transforms_scale">
                    <value name="Factor">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="occt_transforms_translate">
                    <value name="Translation">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                        </block>
                    </value>
                </block>
                <block type="occt_transforms_transform">
                    <value name="Translation">
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
                    <value name="RotationAxis">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">0</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="RotationAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="ScaleFactor">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
            </category>
    </category>
`;
}