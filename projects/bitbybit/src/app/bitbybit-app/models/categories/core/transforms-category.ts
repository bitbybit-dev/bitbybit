import { ResourcesService } from '../../../../../resources';

export function transformsCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_core_transforms}" categorystyle="verb_core_category">
        <block type="babylon_transformation_scale_uniform">
            <value name="Scale">
                <block type="math_number">
                    <field name="NUM">2</field>
                </block>
            </value>
        </block>
        <block type="babylon_transformation_scale_center_uniform">
            <value name="Scale">
                <block type="math_number">
                    <field name="NUM">2</field>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
        <block type="babylon_transformation_scale_xyz">
            <value name="ScaleXYZ">
                <block type="verb_core_vector">
                    <value name="X">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Y">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Z">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
            </value>
        </block>
        <block type="babylon_transformation_scale_center_xyz">
            <value name="ScaleXYZ">
                <block type="verb_core_vector">
                    <value name="X">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Y">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Z">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
       <block type="babylon_transformation_translation_xyz">
            <value name="Translation">
                <block type="verb_core_vector">
                    <value name="X">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Y">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                    <value name="Z">
                        <block type="math_number">
                            <field name="NUM">2</field>
                        </block>
                    </value>
                </block>
            </value>
        </block>
        <block type="babylon_transformation_rotation_center_axis">
            <value name="Angle">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Axis">
                <block type="verb_core_vector">
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
            <value name="Center">
                <block type="verb_core_vector">
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
        <block type="babylon_transformation_rotation_yaw_pitch_roll">
            <value name="Yaw">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Pitch">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Roll">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
        <block type="babylon_transformation_rotation_center_x">
            <value name="Angle">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
        <block type="babylon_transformation_rotation_center_y">
            <value name="Angle">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
        <block type="babylon_transformation_rotation_center_z">
            <value name="Angle">
                <block type="math_number">
                    <field name="NUM">45</field>
                </block>
            </value>
            <value name="Center">
                <block type="verb_core_vector">
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
`;
}
