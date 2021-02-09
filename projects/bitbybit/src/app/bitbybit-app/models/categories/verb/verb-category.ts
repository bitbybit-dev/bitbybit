import { ResourcesService } from '../../../../../resources';
import { curveCategory } from '../geometry/curve-category';
import { surfaceCategory } from '../geometry/surface-category';
import { intersectCategory } from '../intersect/intersect-category';

export function verbCategory(): string {
    const resources = ResourcesService.getResources();
    return `
    <category name="${resources.block_toolbox_category_geom_verbnurbs}"  categorystyle="geometry_category">
        ${curveCategory()}
        ${surfaceCategory()}
        ${intersectCategory()}
    </category>
`;
}