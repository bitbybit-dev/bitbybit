import { Mesh } from "@babylonjs/core";
import { BaseTypes } from "../bitbybit/base-types";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Tag {
    export class DrawTagDto {
        constructor(tag?: TagDto, updatable?: boolean, tagVariable?: TagDto) {
            if (tag !== undefined) { this.tag = tag; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (tagVariable !== undefined) { this.tagVariable = tagVariable; }
        }
        /**
         * Text tag to draw
         */
        tag: TagDto;
        /**
         * Indicates that it is updatable tag
         */
        updatable = false;
        /**
         * Optional existing tag in case it needs updating
         */
        tagVariable?: TagDto;
    }
    export class DrawTagsDto {
        constructor(tags?: TagDto[], updatable?: boolean, tagsVariable?: TagDto[]) {
            if (tags !== undefined) { this.tags = tags; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (tagsVariable !== undefined) { this.tagsVariable = tagsVariable; }
        }
        /**
         * Text tag to draw
         */
        tags: TagDto[];
        /**
         * Indicates that it is updatable tag
         */
        updatable = false;
        /**
         * Optional existing tag in case it needs updating
         */
        tagsVariable?: TagDto[];
    }
    /**
     * Class representing a tag
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
         * Text of the tag
         */
        text: string;
        /**
         * Position of the tag
         */
        position: Base.Point3 = [0, 0, 0];
        /**
         * Colour of the tag
         */
        colour = "#444444";
        /**
         * Text size
         */
        size = 12;
        /**
         * Make tags that are further away smaller
         */
        adaptDepth = false;
        /**
         * Indicates if tag needs updating
         */
        needsUpdate?: boolean;
        /**
         * Unique id of the tag
         */
        id?: string;
    }
}

