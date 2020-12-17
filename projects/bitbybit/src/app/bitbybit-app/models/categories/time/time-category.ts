import { ResourcesService } from '../../../../../resources';

export function timeCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_time}" categorystyle="verb_core_category">
        <block type="base_time_update">
        </block>
        <block type="base_time_then">
        </block>
        <block type="base_time_then_chain">
        </block>
        <block type="base_time_catch">
        </block>
        <block type="base_time_execute_later">
            <value name="Timeout">
                <block type="math_number">
                    <field name="NUM">2</field>
                </block>
            </value>
        </block>
        <block type="base_time_execute_at_interval">
            <value name="Interval">
                <block type="math_number">
                    <field name="NUM">2</field>
                </block>
            </value>
        </block>
        <block type="base_time_execute_at_interval_with_handler">
            <value name="Interval">
                <block type="math_number">
                    <field name="NUM">2</field>
                </block>
            </value>
        </block>
        <block type="base_time_clear_interval">
        </block>
        <block type="base_time_clear_timeout">
        </block>
    </category>
`;
}
