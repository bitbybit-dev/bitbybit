import { ResourcesService } from 'src/resources';

export function vectorCategory() {
    const resources = ResourcesService.getResources();
    return `
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
`;
}
