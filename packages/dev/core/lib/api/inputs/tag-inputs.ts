import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for 3D text labels: the text, its position in the scene, color, size, offset and whether
 * it stays screen-facing. Used for dimensions, part numbers, debugging output and any annotation that
 * should follow the geometry as the camera moves.
 */
export namespace Tag {
    /**
     * Feeds `tag.drawTag`: the tag to put on screen, whether it may be changed later and, on a
     * later draw, the tag from before to change in place.
     */
    export class DrawTagDto {
        constructor(tag?: TagDto, updatable?: boolean, tagVariable?: TagDto) {
            if (tag !== undefined) { this.tag = tag; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (tagVariable !== undefined) { this.tagVariable = tagVariable; }
        }
        /**
         * The tag description to show, as `tag.create` builds it
         */
        tag!: TagDto;
        /**
         * When true, a later draw with `tagVariable` changes this tag in place instead of adding
         * another
         */
        updatable = false;
        /**
         * The tag an earlier draw gave back, to change in place; used only when `updatable` is true
         */
        tagVariable?: TagDto | undefined;
    }
    /**
     * Feeds `tag.drawTags`: the tags to put on screen, whether they may be changed later and, on a
     * later draw, the tags from before to change in place.
     */
    export class DrawTagsDto {
        constructor(tags?: TagDto[], updatable?: boolean, tagsVariable?: TagDto[]) {
            if (tags !== undefined) { this.tags = tags; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (tagsVariable !== undefined) { this.tagsVariable = tagsVariable; }
        }
        /**
         * The tag descriptions to show, as `tag.create` builds them
         */
        tags!: TagDto[];
        /**
         * When true, a later draw with `tagsVariable` changes these tags in place, adding and
         * removing to match the new list
         */
        updatable = false;
        /**
         * The tags an earlier draw gave back, to change in place; used only when `updatable` is
         * true
         */
        tagsVariable?: TagDto[] | undefined;
    }
    /**
     * A text label pinned to a 3D position, as `tag.create` builds it and `tag.drawTag` shows it:
     * the text, where it sits, its color and size, and whether it shrinks with distance. `id` and
     * `needsUpdate` are filled in by drawing.
     */
    export class TagDto {

        constructor(text?: string, position?: Base.Point3, colour?: string, size?: number, adaptDepth?: boolean, needsUpdate?: boolean, id?: string) {
            if (text !== undefined) { this.text = text; }
            if (position !== undefined) { this.position = position; }
            if (colour !== undefined) { this.colour = colour; }
            if (size !== undefined) { this.size = size; }
            if (adaptDepth !== undefined) { this.adaptDepth = adaptDepth; }
            if (needsUpdate !== undefined) { this.needsUpdate = needsUpdate; }
            if (id !== undefined) { this.id = id; }
        }

        /**
         * The label's content, shown as plain text
         */
        text!: string;
        /**
         * The point in the scene the label is pinned to; it stays over that point as the camera
         * moves
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Hex color of the label's text
         */
        colour = "#444444";
        /**
         * Font size of the label, in pixels
         */
        size = 12;
        /**
         * When true, a label far from the camera is drawn smaller than one nearby, as if it sat in
         * the scene
         */
        adaptDepth = false;
        /**
         * Set by drawing to ask for a refresh of the label on the next frame; not something to set
         * by hand
         */
        needsUpdate?: boolean | undefined;
        /**
         * Identifier given to the label when it is drawn, which later updates use to find it; not
         * something to set by hand
         */
        id?: string | undefined;
    }
}

