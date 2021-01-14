// textTag: (JavaScript as any).valueToCode(block, 'TextTag', (JavaScript as any).ORDER_ATOMIC),
//             updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
import { Mesh } from '@babylonjs/core';
import { BaseTypes } from '../bitbybit/base-types';

// tslint:disable-next-line: no-namespace
export namespace Tag {
    export class DrawTagDto {
        /**
         * Text tag to draw
         */
        textTag: BaseTypes.TagDto;
        /**
         * Indicates that it is updatable tag
         */
        updatable: boolean;
        /**
         * Optional existing tag in case it needs updating
         */
        tagVariable?: BaseTypes.TagDto;
    }
    export class DrawTagsDto {
        /**
         * Text tag to draw
         */
        textTags: BaseTypes.TagDto[];
        /**
         * Indicates that it is updatable tag
         */
        updatable: boolean;
        /**
         * Optional existing tag in case it needs updating
         */
        tagsVariable?: BaseTypes.TagDto[];
    }
}
