import { defaultBlocklyCategories } from './categories/blockly/default-categories';
import { transformsCategory } from './categories/core/transforms-category';
import { typesCategory } from './categories/core/types-category';
import { nodeCategory } from './categories/core/node-category';
import { vectorCategory } from './categories/core/vector-category';
import { lineCategory } from './categories/geometry/line-category';
import { pointCategory } from './categories/geometry/point-category';
import { polylineCategory } from './categories/geometry/polyline-category';
import { verbCategory } from './categories/verb/verb-category';
import { ioCategory } from './categories/io/io-category';
import { sceneCategory } from './categories/scene/scene-category';
import { tagCategory } from './categories/tag/tag-category';
import { timeCategory } from './categories/time/time-category';
import { solidCategory } from './categories/geometry/solid-category';
import { occCategory } from './categories/occ/occ-category';

export function toolboxDefinition(): string {
    return `
<xml id="toolbox" style="display: none">
    ${sceneCategory()}
    <sep></sep>
    ${typesCategory()}
    ${transformsCategory()}
    ${vectorCategory()}
    ${nodeCategory()}
    <sep></sep>
    ${pointCategory()}
    ${lineCategory()}
    ${polylineCategory()}
    ${verbCategory()}
    ${occCategory()}
    ${solidCategory()}
    <sep></sep>
    ${tagCategory()}
    <sep></sep>
    ${ioCategory()}
    ${timeCategory()}
    <sep></sep>
    ${defaultBlocklyCategories()}
</xml>
`;
}
