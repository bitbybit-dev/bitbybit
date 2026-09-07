import { describe, it, expect, beforeEach } from "vitest";
import { Tag } from "./tag";
import { ContextBase } from "../context";
import * as Inputs from "../inputs";

const TEXT = "Corner A";
const POSITION: Inputs.Base.Point3 = [1, 2, 3];
const COLOUR = "#336699";
const SIZE = 14;
const CANVAS_ZONE_CLASS = "canvasZone";
const SECOND_TEXT = "Corner B";
const THIRD_TEXT = "Corner C";

const aTag = (text = TEXT): Inputs.Tag.TagDto =>
    new Inputs.Tag.TagDto(text, POSITION, COLOUR, SIZE, true);

describe("Tag", () => {
    let tag: Tag;
    let context: ContextBase;

    beforeEach(() => {
        document.body.innerHTML = `<div class="${CANVAS_ZONE_CLASS}"></div>`;
        context = new ContextBase();
        tag = new Tag(context);
    });

    describe("create", () => {
        it("should carry the described properties onto a new tag", () => {
            // Arrange
            const inputs = aTag();

            // Act
            const created = tag.create(inputs);

            // Assert
            expect(created.text).toBe(TEXT);
            expect(created.position).toEqual(POSITION);
            expect(created.colour).toBe(COLOUR);
            expect(created.size).toBe(SIZE);
            expect(created.adaptDepth).toBe(true);
        });

        it("should return a new object rather than the one it was given", () => {
            // Arrange
            const inputs = aTag();

            // Act
            const created = tag.create(inputs);
            created.text = SECOND_TEXT;

            // Assert
            expect(inputs.text).toBe(TEXT);
        });

        it("should not carry an identity across, since only drawing assigns one", () => {
            // Arrange
            const inputs = aTag();
            inputs.id = "an-id-from-somewhere-else";

            // Act
            const created = tag.create(inputs);

            // Assert
            expect(created.id).toBeUndefined();
        });
    });

    describe("drawTag", () => {
        it("should put a span in the canvas zone and record the tag", () => {
            // Arrange
            const inputs = new Inputs.Tag.DrawTagDto(aTag());

            // Act
            const drawn = tag.drawTag(inputs);

            // Assert
            expect(context.tagBag).toHaveLength(1);
            expect(drawn.needsUpdate).toBe(true);
            const span = document.querySelector(`.${CANVAS_ZONE_CLASS} span`);
            expect(span?.textContent).toBe(TEXT);
            expect(span?.id).toBe(drawn.id);
        });

        it("should give each drawn tag its own identity", () => {
            // Act
            const first = tag.drawTag(new Inputs.Tag.DrawTagDto(aTag()));
            const second = tag.drawTag(new Inputs.Tag.DrawTagDto(aTag(SECOND_TEXT)));

            // Assert
            expect(second.id).not.toBe(first.id);
            expect(context.tagBag).toHaveLength(2);
            expect(document.querySelectorAll(`.${CANVAS_ZONE_CLASS} span`)).toHaveLength(2);
        });

        it("should update the recorded tag in place rather than add another", () => {
            // Arrange
            const first = tag.drawTag(new Inputs.Tag.DrawTagDto(aTag()));
            const replacement = aTag(SECOND_TEXT);
            const inputs = new Inputs.Tag.DrawTagDto(replacement, true, first);

            // Act
            tag.drawTag(inputs);

            // Assert
            expect(context.tagBag).toHaveLength(1);
            expect(context.tagBag[0]!.text).toBe(SECOND_TEXT);
            expect(context.tagBag[0]!.needsUpdate).toBe(true);
            expect(document.querySelectorAll(`.${CANVAS_ZONE_CLASS} span`)).toHaveLength(1);
        });
    });

    describe("drawTags", () => {
        it("should draw one span per tag and record them all", () => {
            // Arrange
            const inputs = new Inputs.Tag.DrawTagsDto([aTag(), aTag(SECOND_TEXT)]);

            // Act
            const drawn = tag.drawTags(inputs);

            // Assert
            expect(drawn).toHaveLength(2);
            expect(context.tagBag).toHaveLength(2);
            expect(document.querySelectorAll(`.${CANVAS_ZONE_CLASS} span`)).toHaveLength(2);
            expect(drawn.map((t) => t.text)).toEqual([TEXT, SECOND_TEXT]);
        });

        it("should update the recorded tags in place when handed the variable it drew before", () => {
            // Arrange
            const drawn = tag.drawTags(new Inputs.Tag.DrawTagsDto([aTag(), aTag(SECOND_TEXT)]));
            const replacements = [aTag(THIRD_TEXT), aTag(THIRD_TEXT)];

            // Act
            tag.drawTags(new Inputs.Tag.DrawTagsDto(replacements, true, drawn));

            // Assert
            expect(context.tagBag).toHaveLength(2);
            expect(context.tagBag.map((t) => t.text)).toEqual([THIRD_TEXT, THIRD_TEXT]);
            expect(document.querySelectorAll(`.${CANVAS_ZONE_CLASS} span`)).toHaveLength(2);
        });

        it("should take away the span of a tag the new list no longer has", () => {
            // Arrange
            const drawn = tag.drawTags(new Inputs.Tag.DrawTagsDto([aTag(), aTag(SECOND_TEXT)]));

            // Act
            tag.drawTags(new Inputs.Tag.DrawTagsDto([aTag(THIRD_TEXT)], true, drawn));

            // Assert
            expect(context.tagBag).toHaveLength(1);
            expect(context.tagBag[0]!.text).toBe(THIRD_TEXT);
            expect(document.querySelectorAll(`.${CANVAS_ZONE_CLASS} span`)).toHaveLength(1);
        });

        it("should drop a recorded tag that never got an identity, rather than fail on its missing span", () => {
            // Arrange
            const neverDrawn = aTag(SECOND_TEXT);
            context.tagBag.push(neverDrawn);

            // Act
            tag.drawTags(new Inputs.Tag.DrawTagsDto([], true, [neverDrawn]));

            // Assert
            expect(context.tagBag).toHaveLength(0);
        });
    });
});
