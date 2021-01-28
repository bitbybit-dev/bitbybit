import { ResourcesService } from '../../../../../resources';

export function occCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_occ}"  categorystyle="geometry_category">
        <block type="occ_draw_shape">
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
                    <field name="NUM">0.05</field>
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
        <category name="${resources.block_toolbox_category_occ_create}"  categorystyle="geometry_category">
            <category name="${resources.block_toolbox_category_occ_create_solid}"  categorystyle="geometry_category">
                <block type="occ_shapes_create_box">
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
                <block type="occ_shapes_create_sphere">
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
                <block type="occ_shapes_create_cylinder">
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
                <block type="occ_shapes_create_cone">
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
            <category name="${resources.block_toolbox_category_occ_create_wire}"  categorystyle="geometry_category">
                <block type="occ_wires_create_bspline">
                    <value name="Closed">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
                <block type="occ_wires_create_bezier">
                    <value name="Closed">
                        <block type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </block>
                    </value>
                </block>
                <block type="occ_wires_create_circle">
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
            </category>
            <category name="${resources.block_toolbox_category_occ_create_face}"  categorystyle="geometry_category">
                <block type="occ_faces_create_circle">
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
            </category>
        </category>
        <category name="${resources.block_toolbox_category_occ_apply}"  categorystyle="geometry_category">
            <block type="occ_offset">
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
            <block type="occ_extrude">
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
        </category>
    </category>
`;
}