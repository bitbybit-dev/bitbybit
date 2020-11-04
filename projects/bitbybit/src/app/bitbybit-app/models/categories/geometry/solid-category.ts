import { ResourcesService } from '../../../../../resources';

export function solidCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_solid}"  categorystyle="geometry_category">
        <block type="babylon_draw_csg_mesh">
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
            <value name="Updatable">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
        <block type="babylon_draw_csg_meshes">
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
            <value name="Updatable">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
        <block type="babylon_draw_2d_path">
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
        <block type="csg_io_solid_to_stl_download">
            <value name="FileName">
                <shadow type="text">
                    <field name="TEXT">bitbybit-model</field>
                </shadow>
            </value>
        </block>
        <block type="csg_io_solids_to_stl_download">
            <value name="FileName">
                <shadow type="text">
                    <field name="TEXT">bitbybit-model</field>
                </shadow>
            </value>
        </block>
        <category name="${resources.block_toolbox_category_create}"  categorystyle="geometry_category">
            <category name="${resources.block_toolbox_category_2d_path}" categorystyle="geometry_category">
                <block type="csg_primitive_2d_path_from_points">
                    <value name="Closed">
                        <shadow type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_path_from_polyline">
                    <value name="Closed">
                        <shadow type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_path_from_curve">
                    <value name="Closed">
                        <shadow type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_path_empty">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_2d_polygon}" categorystyle="geometry_category">
                <block type="csg_primitive_2d_polygon_from_points">
                </block>
                <block type="csg_primitive_2d_polygon_from_polyline">
                </block>
                <block type="csg_primitive_2d_polygon_from_curve">
                </block>
                <block type="csg_primitive_2d_polygon_from_path">
                </block>
                <block type="csg_primitive_2d_square">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_rectangle">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_rounded_rectangle">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="RoundRadius">
                        <shadow type="math_number">
                            <field name="NUM">0.3</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">32</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_circle">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_ellipse">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="base_geometry_point_2d">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_2d_star">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="Vertices">
                        <shadow type="math_number">
                            <field name="NUM">5</field>
                        </shadow>
                    </value>
                    <value name="Density">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="OuterRadius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="InnerRadius">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="StartAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_3d_solid}" categorystyle="geometry_category">
                <block type="csg_primitive_cube">
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
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cubes_on_center_points">
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cuboid">
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
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cuboids_on_center_points">
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cuboid">
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
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="RoundRadius">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cuboids_on_center_points">
                    <value name="Width">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Length">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="RoundRadius">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_sphere">
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
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_spheres_on_center_points">
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cylinder">
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
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cylinders_on_center_points">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cylinder">
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
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="RoundRadius">
                        <shadow type="math_number">
                            <field name="NUM">0.4</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cylinders_on_center_points">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="RoundRadius">
                        <shadow type="math_number">
                            <field name="NUM">0.4</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cylinder_elliptic">
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
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="StartRadius">
                        <shadow type="base_geometry_point_2d">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="EndRadius">
                        <shadow type="base_geometry_point_2d">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_cylinders_elliptic_on_center_points">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="StartRadius">
                        <shadow type="base_geometry_point_2d">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="EndRadius">
                        <shadow type="base_geometry_point_2d">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_ellipsoid">
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
                    <value name="Radius">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">3</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_ellipsoids_on_center_points">
                    <value name="Radius">
                        <shadow type="base_geometry_point">
                            <value name="X">
                                <shadow type="math_number">
                                    <field name="NUM">3</field>
                                </shadow>
                            </value>
                            <value name="Y">
                                <shadow type="math_number">
                                    <field name="NUM">2</field>
                                </shadow>
                            </value>
                            <value name="Z">
                                <shadow type="math_number">
                                    <field name="NUM">1</field>
                                </shadow>
                            </value>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_geodesic_sphere">
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
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Frequency">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_geodesic_spheres_on_center_points">
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Frequency">
                        <shadow type="math_number">
                            <field name="NUM">24</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_primitive_torus">
                    <value name="Center">
                        <shadow type="base_geometry_point_2d">
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
                    <value name="InnerRadius">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="OuterRadius">
                        <shadow type="math_number">
                            <field name="NUM">4</field>
                        </shadow>
                    </value>
                    <value name="InnerSegments">
                        <shadow type="math_number">
                            <field name="NUM">32</field>
                        </shadow>
                    </value>
                    <value name="OuterSegments">
                        <shadow type="math_number">
                            <field name="NUM">32</field>
                        </shadow>
                    </value>
                    <value name="InnerRotation">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="OuterRotation">
                        <shadow type="math_number">
                            <field name="NUM">360</field>
                        </shadow>
                    </value>
                    <value name="StartAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_extrusion}" categorystyle="geometry_category">
                <block type="csg_extrude_linear_polygon">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="TwistAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="TwistSteps">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_extrude_linear_polygon_objects">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="TwistAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="TwistSteps">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_points">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_path">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_paths">
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">2</field>
                        </shadow>
                    </value>
                    <value name="Size">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_extrude_rotate_polygon">
                    <value name="Angle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                    <value name="StartAngle">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_3d_text}" categorystyle="geometry_category">
                <block type="csg_text_vector_cylindrical_text">
                    <value name="ExtrusionHeight">
                        <shadow type="math_number">
                            <field name="NUM">0.2</field>
                        </shadow>
                    </value>
                    <value name="ExtrusionSize">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                     </value>
                    <value name="XOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="YOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="LineSpacing">
                        <shadow type="math_number">
                            <field name="NUM">1.4</field>
                        </shadow>
                    </value>
                    <value name="LetterSpacing">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Align">
                        <shadow type="csg_text_align_type">
                            <field name="TextAlignType">'left'</field>
                        </shadow>
                    </value>
                    <value name="ExtrudeOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="InputText">
                        <shadow type="text">
                            <field name="TEXT">abc</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_text_vector_spherical_text">
                    <value name="Radius">
                        <shadow type="math_number">
                            <field name="NUM">0.1</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">10</field>
                        </shadow>
                     </value>
                    <value name="XOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="YOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Height">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="LineSpacing">
                        <shadow type="math_number">
                            <field name="NUM">1.4</field>
                        </shadow>
                    </value>
                    <value name="LetterSpacing">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="Align">
                        <shadow type="csg_text_align_type">
                            <field name="TextAlignType">'left'</field>
                        </shadow>
                    </value>
                    <value name="ExtrudeOffset">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="InputText">
                        <shadow type="text">
                            <field name="TEXT">abc</field>
                        </shadow>
                    </value>
                </block>
            </category>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
            <block type="csg_colour">
                <value name="Colour">
                    <shadow type="colour_picker">
                        <field name="COLOUR">#555</field>
                    </shadow>
                </value>
            </block>
            <block type="csg_transform">
            </block>
            <block type="csg_transform_solids">
            </block>
            <category name="${resources.block_toolbox_category_2d_path}" categorystyle="geometry_category">
                <block type="csg_primitive_2d_path_close">
                </block>
                <block type="csg_primitive_2d_path_append_points">
                </block>
                <block type="csg_primitive_2d_path_append_polyline">
                </block>
                <block type="csg_primitive_2d_path_append_curve">
                </block>
                <block type="csg_primitive_2d_path_append_arc">
                    <value name="EndPoint">
                        <shadow type="base_geometry_point_2d">
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
                        </shadow>
                    </value>
                    <value name="RadiusX">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="RadiusZ">
                        <shadow type="math_number">
                            <field name="NUM">1</field>
                        </shadow>
                    </value>
                    <value name="XAxisRotation">
                        <shadow type="math_number">
                            <field name="NUM">0</field>
                        </shadow>
                    </value>
                    <value name="Clockwise">
                        <shadow type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </shadow>
                    </value>
                    <value name="Large">
                        <shadow type="logic_boolean">
                            <field name="BOOL">FALSE</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">16</field>
                        </shadow>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_boolean}" categorystyle="geometry_category">
                <block type="csg_boolean_subtract">
                </block>
                <block type="csg_boolean_subtract_objects">
                </block>
                <block type="csg_boolean_subtract_objects_from_solid">
                </block>
                <block type="csg_boolean_union">
                </block>
                <block type="csg_boolean_union_objects">
                </block>
                <block type="csg_boolean_intersect">
                </block>
                <block type="csg_boolean_intersect_objects">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_hull}" categorystyle="geometry_category">
                <block type="csg_hull_paths">
                </block>
                <block type="csg_hull_polygons">
                </block>
                <block type="csg_hull_solids">
                </block>
                <block type="csg_hull_chain_paths">
                </block>
                <block type="csg_hull_chain_polygons">
                </block>
                <block type="csg_hull_chain_solids">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_expansions}" categorystyle="geometry_category">
                <block type="csg_expansions_expand_path">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_expand_paths">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_expand_polygon">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_expand_polygons">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_expand_solid">
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_expand_solids">
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_offset_path">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_offset_paths">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_offset_polygon">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
                <block type="csg_expansions_offset_polygons">
                    <value name="Corners">
                        <shadow type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </shadow>
                    </value>
                    <value name="Segments">
                        <shadow type="math_number">
                            <field name="NUM">12</field>
                        </shadow>
                    </value>
                    <value name="Delta">
                        <shadow type="math_number">
                            <field name="NUM">0.5</field>
                        </shadow>
                    </value>
                </block>
            </category>
        </category>
    </category>
`;
}
