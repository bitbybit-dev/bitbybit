import { ResourcesService } from '../../../../resources';

export function nodeCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_core_node}" expanded="true" categorystyle="verb_core_category">
        <block type="babylon_draw_node">
            <value name="ColorX">
                <shadow type="colour_picker">
                    <field name="COLOUR">#FF0000</field>
                </shadow>
            </value>
            <value name="ColorY">
                <shadow type="colour_picker">
                    <field name="COLOUR">#00FF00</field>
                </shadow>
            </value>
            <value name="ColorZ">
                <shadow type="colour_picker">
                    <field name="COLOUR">#0000FF</field>
                </shadow>
            </value>
            <value name="Size">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        <category name="${resources.block_toolbox_category_create}" categorystyle="geometry_category">
            <block type="base_geometry_node_from_rotation">
                <value name="Origin">
                    <shadow type="base_geometry_point">
                        <value name="X">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Y">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Z">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                    </shadow>
                </value>
                <value name="Rotation">
                    <shadow type="base_geometry_point">
                        <value name="X">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Y">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                        <value name="Z">
                            <shadow type="math_number">
                                <field name="NUM">-0</field>
                            </shadow>
                        </value>
                    </shadow>
                </value>
                <value name="Parent">
                    <shadow type="base_geometry_node_get_root">
                    </shadow>
                </value>
            </block>
            <block type="base_geometry_node_world">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}" expanded="true" categorystyle="geometry_category">
            <category name="${resources.block_toolbox_category_apply_get}" categorystyle="geometry_category">
                <block type="base_geometry_node_get_root">
                </block>
                <block type="base_geometry_node_get_rotation">
                </block>
                <block type="base_geometry_node_get_rotation_quaternion">
                </block>
            </category>
            <category name="${resources.block_toolbox_category_apply_set}" categorystyle="geometry_category">
            </category>
        </category>
    </category>
`;
}
