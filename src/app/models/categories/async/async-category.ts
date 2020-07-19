import { ResourcesService } from 'src/resources';

export function asyncCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_async}" categorystyle="verb_core_category">
        <block type="base_async_then">
        </block>
        <block type="base_async_then_chain">
        </block>
        <block type="base_async_catch">
        </block>
        <block type="base_async_execute_later">
            <value name="Timeout">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="base_async_execute_at_interval">
            <value name="Interval">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="base_async_execute_at_interval_with_handler">
            <value name="Interval">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="base_async_cancel_interval">
        </block>
    </category>
`;
}
