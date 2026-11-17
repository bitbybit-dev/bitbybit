import { describe, expect, it } from "vitest";
import { normalizeSvg } from "./svg-normalizer";
import type { SvgScene, SvgStyle } from "./svg-scene-types";
import { parseOpacity } from "./svg-style";

const SIZE = "width=\"5\" height=\"5\"";
const sceneOf = (body: string): SvgScene => normalizeSvg(`<svg>${body}</svg>`);
const stylesOf = (body: string): SvgStyle[] => sceneOf(body).elements.map((e) => e.style);

describe("svg style cascade", () => {
    it("should let an important declaration in the style attribute beat a later plain one of the same property", () => {
        // Act
        const styles = stylesOf(`<rect fill="green" style="fill: red !important; fill: blue" ${SIZE}/>`);

        // Assert
        expect(styles).toEqual([{ fill: "red" }]);
    });

    it("should take the parent's value for a property set to inherit, and leave it unset when the parent sets none", () => {
        // Act
        const styles = stylesOf(`<g fill="red"><rect fill="inherit" ${SIZE}/></g><rect fill="inherit" ${SIZE}/>`);

        // Assert
        expect(styles).toEqual([{ fill: "red" }, {}]);
    });

    it("should take the parent's value for an inherited property set to unset, and the initial value for one that is not inherited", () => {
        // Act
        const scene = sceneOf(`<g fill="red"><rect fill="unset" ${SIZE}/></g><rect clip-path="url(#c)" style="clip-path: unset" ${SIZE}/>`);

        // Assert
        expect(scene.elements.map((e) => e.style)).toEqual([{ fill: "red" }, {}]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should drop the inherited value of a property set to initial", () => {
        // Act
        const styles = stylesOf(`<g fill="red" stroke="blue"><rect fill="initial" stroke="initial" ${SIZE}/></g>`);

        // Assert
        expect(styles).toEqual([{}]);
    });

    it("should resolve a color of currentColor to the parent's color, and paint currentColor black where no color is set", () => {
        // Act
        const styles = stylesOf(`<g color="blue"><rect color="currentColor" fill="currentColor" ${SIZE}/></g><rect color="currentColor" stroke="currentColor" ${SIZE}/>`);

        // Assert
        expect(styles).toEqual([{ fill: "blue" }, { stroke: "black" }]);
    });

    it("should read a stroke opacity and the nonzero fill rule", () => {
        // Act
        const styles = stylesOf(`<rect stroke-opacity="25%" fill-rule="nonzero" ${SIZE}/>`);

        // Assert
        expect(styles).toEqual([{ strokeOpacity: 0.25, fillRule: "nonzero" }]);
    });

    it("should leave an opacity unset when its value is not a number", () => {
        // Act
        const styles = stylesOf(`<rect opacity="half" fill-opacity="x" ${SIZE}/>`);

        // Assert
        expect(styles).toEqual([{}]);
    });
});

describe("parseOpacity", () => {
    it("should read a number or a percentage held between 0 and 1, and nothing from text that is no number", () => {
        // Act
        const read = ["0.5", " 40% ", "2", "-1", "none"].map(parseOpacity);

        // Assert
        expect(read).toEqual([0.5, 0.4, 1, 0, undefined]);
    });
});
