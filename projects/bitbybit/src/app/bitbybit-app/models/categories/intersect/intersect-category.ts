import { ResourcesService } from '../../../../../resources';

export function intersectCategory() {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_intersect}"  categorystyle="geometry_category">
        <category name="${resources.block_toolbox_category_create}"  categorystyle="geometry_category">
            <block type="verb_geometry_intersect_curve_curve">
            </block>
            <block type="verb_geometry_intersect_curve_surface">
            </block>
            <block type="verb_geometry_intersect_surface_surface">
            </block>
        </category>
        <category name="${resources.block_toolbox_category_apply}"  categorystyle="geometry_category">
            <block type="verb_geometry_intersect_curve_curve_first_params">
            </block>
            <block type="verb_geometry_intersect_curve_curve_first_points">
            </block>
            <block type="verb_geometry_intersect_curve_curve_second_params">
            </block>
            <block type="verb_geometry_intersect_curve_curve_second_points">
            </block>
            <block type="verb_geometry_intersect_curve_surface_curve_params">
            </block>
            <block type="verb_geometry_intersect_curve_surface_curve_points">
            </block>
            <block type="verb_geometry_intersect_curve_surface_surface_params">
            </block>
            <block type="verb_geometry_intersect_curve_surface_surface_points">
            </block>
        </category>
    </category>
`;
}
