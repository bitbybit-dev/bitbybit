import { ResourcesService } from 'src/resources';
import { defaultBlocklyCategories } from './categories/blockly/default-categories';
import { transformsCategory } from './categories/core/transforms-category';
import { typesCategory } from './categories/core/types-category';
import { vectorCategory } from './categories/core/vector-category';
import { curveCategory } from './categories/geometry/curve-category';
import { lineCategory } from './categories/geometry/line-category';
import { pointCategory } from './categories/geometry/point-category';
import { polylineCategory } from './categories/geometry/polyline-category';
import { surfaceCategory } from './categories/geometry/surface-category';
import { sceneCategory } from './categories/scene/scene-category';

export function toolboxDefinition() {
    const resources = ResourcesService.getResources();
    return `
<xml id="toolbox" style="display: none">
    ${sceneCategory()}
    <sep></sep>
    ${typesCategory()}
    ${transformsCategory()}
    ${vectorCategory()}
    <sep></sep>
    ${pointCategory()}
    ${lineCategory()}
    ${polylineCategory()}
    ${curveCategory()}
    ${surfaceCategory()}
    <sep></sep>
    ${defaultBlocklyCategories()}
</xml>
`;
}
