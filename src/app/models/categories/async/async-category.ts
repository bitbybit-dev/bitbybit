import { ResourcesService } from 'src/resources';

export function asyncCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_async}" categorystyle="verb_core_category">
        <block type="base_promises_then">
        </block>
        <block type="base_promises_then_chain">
        </block>
        <block type="base_promises_catch">
        </block>
    </category>
`;
}
