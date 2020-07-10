import { ResourcesService } from 'src/resources';

export function ioCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_io}" categorystyle="geometry_category">
        <block type="base_io_import_text_file">
        </block>
        <block type="base_io_print_save">
            <value name="Text">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="base_io_save">
            <value name="Text">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
        </block>
        <block type="base_io_http_get">
        </block>
        <block type="base_io_http_post">
        </block>
        <block type="base_io_http_put">
        </block>
        <block type="base_io_http_patch">
        </block>
        <block type="base_io_http_delete">
        </block>
    </category>
`;
}
