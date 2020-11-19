import { ResourcesService } from '../../../../../resources';

export function tagCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_tag}"  categorystyle="geometry_category">
        <block type="base_geometry_draw_text_tags">
            <value name="Updatable">
                <block type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </block>
            </value>
        </block>
        <block type="base_geometry_draw_text_tag">
            <value name="Updatable">
                <block type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </block>
            </value>
        </block>
        <block type="base_geometry_text_tag">
            <value name="Text">
                <block type="text">
                    <field name="TEXT">abc</field>
                </block>
            </value>
            <value name="Position">
                <block type="base_geometry_point">
                    <value name="X">
                        <block type="math_number">
                            <field name="NUM">-0</field>
                        </block>
                    </value>
                    <value name="Y">
                        <block type="math_number">
                            <field name="NUM">-0</field>
                        </block>
                    </value>
                    <value name="Z">
                        <block type="math_number">
                            <field name="NUM">-0</field>
                        </block>
                    </value>
                </block>
            </value>
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
                </block>
            </value>
            <value name="Size">
                <block type="math_number">
                    <field name="NUM">12</field>
                </block>
            </value>
            <value name="AdaptDepth">
                <block type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </block>
            </value>
        </block>
    </category>
`;
}
