import { ResourcesService } from '../../../../../resources';

export function nodeCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_core_node}"  categorystyle="verb_core_category">
        <category name="${resources.block_toolbox_category_draw}"  categorystyle="geometry_category">
            <block type="babylon_draw_node">
                <value name="ColorX">
                    <block type="colour_picker">
                        <field name="COLOUR">#FF0000</field>
                    </block>
                </value>
                <value name="ColorY">
                    <block type="colour_picker">
                        <field name="COLOUR">#00FF00</field>
                    </block>
                </value>
                <value name="ColorZ">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000FF</field>
                    </block>
                </value>
                <value name="Size">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
            </block>
            <block type="babylon_draw_nodes">
                <value name="ColorX">
                    <block type="colour_picker">
                        <field name="COLOUR">#FF0000</field>
                    </block>
                </value>
                <value name="ColorY">
                    <block type="colour_picker">
                        <field name="COLOUR">#00FF00</field>
                    </block>
                </value>
                <value name="ColorZ">
                    <block type="colour_picker">
                        <field name="COLOUR">#0000FF</field>
                    </block>
                </value>
                <value name="Size">
                    <block type="math_number">
                        <field name="NUM">1</field>
                    </block>
                </value>
            </block>
        </category>
        <category name="${resources.block_toolbox_category_create}" categorystyle="geometry_category">
            <block type="base_geometry_node_from_rotation">
                <value name="Origin">
                    <block type="base_geometry_point">
                        <value name="X">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Y">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Z">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                    </block>
                </value>
                <value name="Rotation">
                    <block type="base_geometry_point">
                        <value name="X">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Y">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                        <value name="Z">
                            <block type="math_number">
                                <field name="NUM">-0</field>
                            </block>
                        </value>
                    </block>
                </value>
                <value name="Parent">
                    <block type="base_geometry_node_get_root">
                    </block>
                </value>
            </block>
            <block type="base_geometry_node_world">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
            <category name="${resources.block_toolbox_category_apply_transform}" categorystyle="geometry_category">
                <block type="base_geometry_node_rotate">
                </block>
                <block type="base_geometry_node_rotate_around">
                </block>
                <block type="base_geometry_node_translate">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_apply_get}" categorystyle="geometry_category">
                <block type="base_geometry_node_get_root">
                </block>
                <block type="base_geometry_node_get_parent">
                </block>
                <block type="base_geometry_node_get_children">
                </block>
                <block type="base_geometry_node_get_rotation">
                </block>
                <block type="base_geometry_node_get_rotation_transformation">
                </block>
                <block type="base_geometry_node_get_position_expressed_in_local_space">
                </block>
                <block type="base_geometry_node_get_absolute_position">
                </block>
                <block type="base_geometry_node_get_absolute_rotation_transformation">
                </block>
                <block type="base_geometry_node_get_absolute_up_vector">
                </block>
                <block type="base_geometry_node_get_absolute_forward_vector">
                </block>
                <block type="base_geometry_node_get_absolute_right_vector">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_apply_set}" categorystyle="geometry_category">
                <block type="base_geometry_node_set_absolute_position">
                </block>
                <block type="base_geometry_node_set_direction">
                </block>
                <block type="base_geometry_node_set_parent">
                </block>
            </category>
        </category>
    </category>
`;
}
