import { ResourcesService } from '../../../../resources';

export function tagCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_tag}" expanded="true" categorystyle="geometry_category">
        <block type="base_geometry_draw_text_tags">
            <value name="Updatable">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
        <block type="base_geometry_draw_text_tag">
            <value name="Updatable">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
        <block type="base_geometry_text_tag">
            <value name="Text">
                <shadow type="text">
                    <field name="TEXT">abc</field>
                </shadow>
            </value>
            <value name="Position">
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
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
            <value name="Size">
                <shadow type="math_number">
                    <field name="NUM">12</field>
                </shadow>
            </value>
            <value name="AdaptDepth">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
        </block>
    </category>
`;
}
