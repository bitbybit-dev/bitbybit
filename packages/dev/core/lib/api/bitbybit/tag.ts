import * as Inputs from "../inputs";
import { ContextBase } from "../context";

/**
 * Text labels pinned to 3D positions: a tag is an HTML text element placed over the canvas at the
 * screen position of a point in the scene, and it follows that point as the camera moves. Tags are
 * for showing names, measurements or other data next to geometry. `drawTag` and `drawTags` create
 * the elements and register them for updating; `create` only builds the description.
 */

export class Tag {

    constructor(private readonly context: ContextBase) { }

    /**
     * Builds a tag description from its text, position, color, size and depth behavior, without
     * drawing it; `drawTag` or `drawTags` put it on screen.
     * @param inputs - The text, the position, the color, the size and the depth behavior
     * @returns The tag description, a new object
     * @example
     * ```typescript
     * const tag = bitbybit.tag.create({ text: "Lid", position: [0, 10, 0], colour: "#ffffff", size: 14, adaptDepth: true });
     * ```
     */
    create(inputs: Inputs.Tag.TagDto): Inputs.Tag.TagDto {
        const tag = new Inputs.Tag.TagDto();
        tag.text = inputs.text;
        tag.position = inputs.position;
        tag.colour = inputs.colour;
        tag.size = inputs.size;
        tag.adaptDepth = inputs.adaptDepth;
        return tag;
    }

    /**
     * Puts one tag on screen as a text element pinned to its 3D position, and keeps it following
     * that position.
     *
     * With `updatable` true and a `tagVariable` from an earlier draw, that tag is changed in place
     * instead of a new one being added.
     * @param inputs - The tag, whether it may be updated later and the earlier tag to update
     * @returns The drawn tag, carrying the id that identifies it
     * @ignore true
     * @example
     * ```typescript
     * const tag = bitbybit.tag.create({ text: "Lid", position: [0, 10, 0], colour: "#ffffff", size: 14, adaptDepth: false });
     * const drawn = bitbybit.tag.drawTag({ tag, updatable: false });
     * ```
     */
    drawTag(inputs: Inputs.Tag.DrawTagDto): Inputs.Tag.TagDto {
        if (inputs.tagVariable && inputs.updatable) {
            const tagToUpdate = this.context.tagBag.find(tag => tag.id === inputs.tagVariable!.id)!;
            Object.assign(tagToUpdate, inputs.tag);
            tagToUpdate.needsUpdate = true;
        } else {
            const textNode = document.createElement("span");
            const id = "_tag" + new Date().getTime() + this.context.tagBag.length;
            inputs.tag.id = id;
            textNode.id = id;
            textNode.textContent = inputs.tag.text;
            document.querySelector("." + this.context.canvasZoneClass)!.appendChild(textNode);
            inputs.tag.needsUpdate = true;
            this.context.tagBag.push(inputs.tag);
        }
        return inputs.tag;
    }

    /**
     * Puts several tags on screen, each a text element pinned to its 3D position.
     *
     * With `updatable` true and a `tagsVariable` from an earlier draw, the earlier tags are changed
     * in place: extra tags are added, and tags no longer in the list are removed.
     * @param inputs - The tags, whether they may be updated later and the earlier tags to update
     * @returns The drawn tags, each carrying the id that identifies it
     * @ignore true
     * @example
     * ```typescript
     * const tags = points.map((position, i) => bitbybit.tag.create({ text: "P" + i, position, colour: "#ffffff", size: 12, adaptDepth: false }));
     * const drawn = bitbybit.tag.drawTags({ tags, updatable: false });
     * ```
     */
    drawTags(inputs: Inputs.Tag.DrawTagsDto): Inputs.Tag.TagDto[] {
        if (inputs.tagsVariable && inputs.updatable) {

            if (inputs.tagsVariable.length < inputs.tags.length) {
                for (let i = inputs.tagsVariable.length - 1; i < inputs.tags.length - 1; i++) {
                    const tagToCreate = inputs.tags[i]!;
                    const textNode = document.createElement("span");
                    const id = "_tag" + new Date().getTime() + this.context.tagBag.length;
                    tagToCreate.id = id;
                    textNode.id = id;
                    document.querySelector("." + this.context.canvasZoneClass)!.appendChild(textNode);
                    tagToCreate.needsUpdate = true;
                    this.context.tagBag.push(tagToCreate);
                    inputs.tagsVariable.push(tagToCreate);
                }
            }

            inputs.tagsVariable.forEach((tagFromVar, index) => {
                const tagToUpdate = this.context.tagBag.find(tag => tag.id === tagFromVar.id)!;
                const tagToUpdateWith = inputs.tags[index];
                if (tagToUpdateWith) {
                    Object.assign(tagToUpdate, tagToUpdateWith);
                    tagToUpdate.needsUpdate = true;
                } else {
                    this.context.tagBag = this.context.tagBag.filter(tag => tag.id !== tagToUpdate.id);
                    const id = tagToUpdate.id;
                    if (id !== undefined) {
                        const element = document.getElementById(id)!;
                        element.parentNode!.removeChild(element);
                    }
                }
            });
        } else {
            const tagsToCreate: Inputs.Tag.TagDto[] = [];
            inputs.tags.forEach((tag, _index) => {
                const textNode = document.createElement("span");
                const id = "_tag" + new Date().getTime() + this.context.tagBag.length;
                tag.id = id;
                textNode.id = id;
                textNode.textContent = tag.text;
                document.querySelector("." + this.context.canvasZoneClass)!.appendChild(textNode);
                tag.needsUpdate = true;
                this.context.tagBag.push(tag);
                tagsToCreate.push(tag);
            });
            inputs.tagsVariable = tagsToCreate;
        }
        return inputs.tagsVariable;
    }
}
