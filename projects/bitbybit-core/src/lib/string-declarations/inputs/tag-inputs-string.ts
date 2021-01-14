import { simplifyDeclaration } from '../simplify-declaration';

export const tagInputsString = simplifyDeclaration(`
import { BaseTypes } from '../bitbybit/base-types';
export declare namespace Tag {
    class DrawTagDto {
        /**
         * Text tag to draw
         */
        tag: BaseTypes.TagDto;
        /**
         * Indicates that it is updatable tag
         */
        updatable: boolean;
        /**
         * Optional existing tag in case it needs updating
         */
        tagVariable?: BaseTypes.TagDto;
    }
    class DrawTagsDto {
        /**
         * Text tag to draw
         */
        tags: BaseTypes.TagDto[];
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
`);
