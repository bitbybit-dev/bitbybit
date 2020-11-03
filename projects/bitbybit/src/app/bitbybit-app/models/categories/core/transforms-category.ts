import { ResourcesService } from '../../../../../resources';

export function transformsCategory() {
    const resources = ResourcesService.getResources();
    return `
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
        <block type="babylon_transformation_rotation_yaw_pitch_roll">
            <value name="Yaw">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Pitch">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
            <value name="Roll">
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
`;
}
