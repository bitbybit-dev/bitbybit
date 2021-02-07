import { ResourcesService } from '../../../../../resources';

export function solidCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_solid}"  categorystyle="geometry_category">
        <block type="babylon_draw_csg_mesh">
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
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
        <block type="babylon_draw_csg_meshes">
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
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
        <block type="babylon_draw_2d_path">
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
        <block type="csg_io_solid_to_stl_download">
            <value name="FileName">
                <block type="text">
                    <field name="TEXT">bitbybit-model</field>
                </block>
            </value>
        </block>
        <block type="csg_io_solids_to_stl_download">
            <value name="FileName">
                <block type="text">
                    <field name="TEXT">bitbybit-model</field>
                </block>
            </value>
        </block>
            <category name="${resources.block_toolbox_category_2d_path}" categorystyle="geometry_category">
                <category name="${resources.block_toolbox_category_create}" categorystyle="geometry_category">
                    <block type="csg_primitive_2d_path_from_points">
                        <value name="Closed">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="csg_primitive_2d_path_from_polyline">
                        <value name="Closed">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="csg_primitive_2d_path_from_curve">
                        <value name="Closed">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                    </block>
                    <block type="csg_primitive_2d_path_empty">
                    </block>
                </category>
                <category name="${resources.block_toolbox_category_apply}" categorystyle="geometry_category">
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
                        </value>
                        <value name="RadiusX">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="RadiusZ">
                            <block type="math_number">
                                <field name="NUM">1</field>
                            </block>
                        </value>
                        <value name="XAxisRotation">
                            <block type="math_number">
                                <field name="NUM">0</field>
                            </block>
                        </value>
                        <value name="Clockwise">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                        <value name="Large">
                            <block type="logic_boolean">
                                <field name="BOOL">FALSE</field>
                            </block>
                        </value>
                        <value name="Segments">
                            <block type="math_number">
                                <field name="NUM">16</field>
                            </block>
                        </value>
                    </block>
                </category>
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
                    </value>
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_2d_rectangle">
                    <value name="Center">
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
                    </value>
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_2d_rounded_rectangle">
                    <value name="Center">
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
                    </value>
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="RoundRadius">
                        <block type="math_number">
                            <field name="NUM">0.3</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">32</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_2d_circle">
                    <value name="Center">
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
                    </value>
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">16</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_2d_ellipse">
                    <value name="Center">
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
                    </value>
                    <value name="Radius">
                        <block type="base_geometry_point_2d">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">16</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_2d_star">
                    <value name="Center">
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
                    </value>
                    <value name="Vertices">
                        <block type="math_number">
                            <field name="NUM">5</field>
                        </block>
                    </value>
                    <value name="Density">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="OuterRadius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="InnerRadius">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="StartAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_3d_solid}" categorystyle="geometry_category">
                <block type="csg_primitive_cube">
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
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cubes_on_center_points">
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cuboid">
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
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cuboids_on_center_points">
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cuboid">
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
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="RoundRadius">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">16</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cuboids_on_center_points">
                    <value name="Width">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Length">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="RoundRadius">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">16</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_sphere">
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
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_spheres_on_center_points">
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cylinder">
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
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cylinders_on_center_points">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cylinder">
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
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="RoundRadius">
                        <block type="math_number">
                            <field name="NUM">0.4</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_rounded_cylinders_on_center_points">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="RoundRadius">
                        <block type="math_number">
                            <field name="NUM">0.4</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cylinder_elliptic">
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
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="StartRadius">
                        <block type="base_geometry_point_2d">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="EndRadius">
                        <block type="base_geometry_point_2d">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_cylinders_elliptic_on_center_points">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="StartRadius">
                        <block type="base_geometry_point_2d">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="EndRadius">
                        <block type="base_geometry_point_2d">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_ellipsoid">
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
                    <value name="Radius">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">3</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_ellipsoids_on_center_points">
                    <value name="Radius">
                        <block type="base_geometry_point">
                            <value name="X">
                                <block type="math_number">
                                    <field name="NUM">3</field>
                                </block>
                            </value>
                            <value name="Y">
                                <block type="math_number">
                                    <field name="NUM">2</field>
                                </block>
                            </value>
                            <value name="Z">
                                <block type="math_number">
                                    <field name="NUM">1</field>
                                </block>
                            </value>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_geodesic_sphere">
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
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Frequency">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_geodesic_spheres_on_center_points">
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Frequency">
                        <block type="math_number">
                            <field name="NUM">24</field>
                        </block>
                    </value>
                </block>
                <block type="csg_primitive_torus">
                    <value name="Center">
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
                    </value>
                    <value name="InnerRadius">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="OuterRadius">
                        <block type="math_number">
                            <field name="NUM">4</field>
                        </block>
                    </value>
                    <value name="InnerSegments">
                        <block type="math_number">
                            <field name="NUM">32</field>
                        </block>
                    </value>
                    <value name="OuterSegments">
                        <block type="math_number">
                            <field name="NUM">32</field>
                        </block>
                    </value>
                    <value name="InnerRotation">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="OuterRotation">
                        <block type="math_number">
                            <field name="NUM">360</field>
                        </block>
                    </value>
                    <value name="StartAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_extrusion}" categorystyle="geometry_category">
                <block type="csg_extrude_linear_polygon">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="TwistAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="TwistSteps">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_extrude_linear_polygon_objects">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="TwistAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="TwistSteps">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_points">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_path">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_extrude_rectangular_paths">
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Size">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                </block>
                <block type="csg_extrude_rotate_polygon">
                    <value name="Angle">
                        <block type="math_number">
                            <field name="NUM">90</field>
                        </block>
                    </value>
                    <value name="StartAngle">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_3d_text}" categorystyle="geometry_category">
                <block type="csg_text_vector_cylindrical_text">
                    <value name="ExtrusionHeight">
                        <block type="math_number">
                            <field name="NUM">0.2</field>
                        </block>
                    </value>
                    <value name="ExtrusionSize">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">16</field>
                        </block>
                     </value>
                    <value name="XOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="YOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="LineSpacing">
                        <block type="math_number">
                            <field name="NUM">1.4</field>
                        </block>
                    </value>
                    <value name="LetterSpacing">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Align">
                        <block type="csg_text_align_type">
                            <field name="TextAlignType">'left'</field>
                        </block>
                    </value>
                    <value name="ExtrudeOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="InputText">
                        <block type="text">
                            <field name="TEXT">abc</field>
                        </block>
                    </value>
                </block>
                <block type="csg_text_vector_spherical_text">
                    <value name="Radius">
                        <block type="math_number">
                            <field name="NUM">0.1</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">10</field>
                        </block>
                     </value>
                    <value name="XOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="YOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="Height">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="LineSpacing">
                        <block type="math_number">
                            <field name="NUM">1.4</field>
                        </block>
                    </value>
                    <value name="LetterSpacing">
                        <block type="math_number">
                            <field name="NUM">1</field>
                        </block>
                    </value>
                    <value name="Align">
                        <block type="csg_text_align_type">
                            <field name="TextAlignType">'left'</field>
                        </block>
                    </value>
                    <value name="ExtrudeOffset">
                        <block type="math_number">
                            <field name="NUM">0</field>
                        </block>
                    </value>
                    <value name="InputText">
                        <block type="text">
                            <field name="TEXT">abc</field>
                        </block>
                    </value>
                </block>
            </category>
            <category name="${resources.block_toolbox_category_apply_transform}"  categorystyle="geometry_category">
                <block type="csg_transform">
                </block>
                <block type="csg_transform_solids">
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
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_expand_paths">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_expand_polygon">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_expand_polygons">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_expand_solid">
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_expand_solids">
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_offset_path">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_offset_paths">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_offset_polygon">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
                <block type="csg_expansions_offset_polygons">
                    <value name="Corners">
                        <block type="csg_corner_type">
                        <field name="CornerType">'edge'</field>
                        </block>
                    </value>
                    <value name="Segments">
                        <block type="math_number">
                            <field name="NUM">12</field>
                        </block>
                    </value>
                    <value name="Delta">
                        <block type="math_number">
                            <field name="NUM">0.5</field>
                        </block>
                    </value>
                </block>
            </category>
    </category>
`;
}
