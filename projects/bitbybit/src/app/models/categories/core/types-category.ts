import { ResourcesService } from '../../../../resources';

export function typesCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_core_types}" categorystyle="verb_core_category">
        <block type="verb_core_interval">
        </block>
        <block type="verb_core_interval">
            <value name="Min">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Max">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        <block type="verb_core_interval_get_min">
        </block>
        <block type="verb_core_interval_get_max">
        </block>
        <block type="verb_core_uv">
        </block>
        <block type="verb_core_uv">
            <value name="U">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="V">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="verb_core_uv_get_u">
        </block>
        <block type="verb_core_uv_get_v">
        </block>
    </category>
`;
}
