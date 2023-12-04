import { Mesh } from "@babylonjs/core";
import { BaseTypes } from "../bitbybit/base-types";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace Tag {
    export class DrawTagDto {
        constructor(tag?: TagDto){
            this.tag = tag;
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
        constructor(tags?: TagDto[]){
            this.tags = tags;
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

        constructor(text?: string){
            this.text = text;
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

