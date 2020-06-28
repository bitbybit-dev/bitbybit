import { ResourcesService } from 'src/resources';

export function sceneCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_scene}" categorystyle="scene_category">
        <block type="babylon_draw_grid">
            <value name="Width">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="Height">
                <shadow type="math_number">
                    <field name="NUM">400</field>
                </shadow>
            </value>
            <value name="Subdivisions">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="MajorUnitFrequency">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
            <value name="MinorUnitVisibility">
                <shadow type="math_number">
                    <field name="NUM">0.45</field>
                </shadow>
            </value>
            <value name="GridRatio">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="Opacity">
                <shadow type="math_number">
                    <field name="NUM">0.5</field>
                </shadow>
            </value>
            <value name="BackFaceCulling">
                <shadow type="logic_boolean">
                    <field name="BOOL">FALSE</field>
                </shadow>
            </value>
            <value name="MainColor">
                <shadow type="colour_picker">
                    <field name="COLOUR">#000</field>
                </shadow>
            </value>
            <value name="LineColor">
                <shadow type="colour_picker">
                    <field name="COLOUR">#555</field>
                </shadow>
            </value>
        </block>
        <block type="babylon_scene_background_colour">
            <value name="Colour">
                <shadow type="colour_picker">
                    <field name="COLOUR">#eee</field>
                </shadow>
            </value>
        </block>
    </category>
`;
}
