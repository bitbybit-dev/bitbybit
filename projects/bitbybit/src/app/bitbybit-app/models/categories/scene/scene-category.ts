import { ResourcesService } from '../../../../../resources';

export function sceneCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_scene}" categorystyle="scene_category">
        <block type="babylon_draw_grid">
            <value name="Width">
                <block type="math_number">
                    <field name="NUM">400</field>
                </block>
            </value>
            <value name="Height">
                <block type="math_number">
                    <field name="NUM">400</field>
                </block>
            </value>
            <value name="Subdivisions">
                <block type="math_number">
                    <field name="NUM">10</field>
                </block>
            </value>
            <value name="MajorUnitFrequency">
                <block type="math_number">
                    <field name="NUM">10</field>
                </block>
            </value>
            <value name="MinorUnitVisibility">
                <block type="math_number">
                    <field name="NUM">0.45</field>
                </block>
            </value>
            <value name="GridRatio">
                <block type="math_number">
                    <field name="NUM">0.5</field>
                </block>
            </value>
            <value name="Opacity">
                <block type="math_number">
                    <field name="NUM">0.5</field>
                </block>
            </value>
            <value name="BackFaceCulling">
                <block type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </block>
            </value>
            <value name="MainColor">
                <block type="colour_picker">
                    <field name="COLOUR">#000</field>
                </block>
            </value>
            <value name="LineColor">
                <block type="colour_picker">
                    <field name="COLOUR">#555</field>
                </block>
            </value>
        </block>
        <block type="babylon_scene_background_colour">
            <value name="Colour">
                <block type="colour_picker">
                    <field name="COLOUR">#eee</field>
                </block>
            </value>
        </block>
        <block type="babylon_clear_all_drawn">
        </block>
    </category>
`;
}
