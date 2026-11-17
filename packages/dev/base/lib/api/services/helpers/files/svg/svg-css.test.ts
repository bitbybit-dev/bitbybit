import { describe, it, expect } from "vitest";
import { WorkBudget } from "../work-budget";
import { normalizeSvg } from "./svg-normalizer";
import { matchStylesheet, parseDeclarations, parseStylesheets } from "./svg-css";
import { parseXml } from "./svg-xml";

const fillsOf = (svg: string): (string | undefined)[] => normalizeSvg(svg).elements.map((e) => e.style.fill);

describe("svg css", () => {
    it("should apply a class rule from a <style> element", () => {
        // Act
        const fills = fillsOf("<svg><style>.c{fill:none;stroke:#f00}</style><rect class=\"c\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["none"]);
    });

    it("should apply a <style> inside <defs> written as CDATA", () => {
        // Act
        const fills = fillsOf("<svg><defs><style type=\"text/css\"><![CDATA[ #a { fill: red } ]]></style></defs><rect id=\"a\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["red"]);
    });

    it("should match type, universal and grouped selectors", () => {
        // Act
        const fills = fillsOf("<svg><style>* { fill: gray } rect, circle { fill: blue }</style><rect width=\"5\" height=\"5\"/><circle r=\"1\"/><ellipse rx=\"2\" ry=\"1\"/></svg>");

        // Assert
        expect(fills).toEqual(["blue", "blue", "gray"]);
    });

    it("should match descendant and child selectors", () => {
        // Act
        const fills = fillsOf(`<svg><style>.layer rect { fill: red } .layer > circle { fill: blue }</style>
            <g class="layer"><g><rect width="5" height="5"/><circle r="1"/></g><circle r="2"/></g></svg>`);

        // Assert
        expect(fills).toEqual(["red", undefined, "blue"]);
    });

    it("should let the more specific selector win whatever the order", () => {
        // Act
        const fills = fillsOf("<svg><style>#a { fill: red } .c { fill: blue } rect { fill: green }</style><rect id=\"a\" class=\"c\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["red"]);
    });

    it("should let the later of two equally specific rules win", () => {
        // Act
        const fills = fillsOf("<svg><style>.c { fill: red } .d { fill: blue }</style><rect class=\"d c\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["blue"]);
    });

    it("should rank presentation attributes below CSS and CSS below the style attribute", () => {
        // Act
        const fills = fillsOf(`<svg><style>.c { fill: blue }</style>
            <rect class="c" fill="red" width="5" height="5"/>
            <rect class="c" fill="red" style="fill: green" width="5" height="5"/></svg>`);

        // Assert
        expect(fills).toEqual(["blue", "green"]);
    });

    it("should let an important CSS declaration beat the style attribute", () => {
        // Act
        const fills = fillsOf("<svg><style>.c { fill: blue !important }</style><rect class=\"c\" style=\"fill: green\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["blue"]);
    });

    it("should keep a rule's important declaration over a later plain one of the same property", () => {
        // Act
        const fills = fillsOf("<svg><style>rect { fill: blue !important; fill: red; stroke: black }</style><rect style=\"fill: green\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["blue"]);
    });

    it("should let an important declaration beat a plain one of a more specific rule", () => {
        // Act
        const fills = fillsOf("<svg><style>#a { fill: red } rect { fill: blue !important } .c { fill: green !important }</style><rect id=\"a\" class=\"c\" width=\"5\" height=\"5\"/><rect id=\"a\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["green", "blue"]);
    });

    it("should hide an element a CSS rule gives display none", () => {
        // Act
        const scene = normalizeSvg("<svg><style>.h{display:none}</style><rect class=\"h\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements[0]!.style.hidden).toBe(true);
    });

    it("should apply rules inside @media and skip other at-rules", () => {
        // Act
        const fills = fillsOf("<svg><style>@font-face { font-family: x } @media screen { rect { fill: red } }</style><rect width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["red"]);
    });

    it("should match attribute selectors", () => {
        // Act
        const fills = fillsOf("<svg><style>[data-part=\"lid\"] { fill: red } [data-tags~=\"b\"] { fill: blue }</style><rect data-part=\"lid\" width=\"5\" height=\"5\"/><rect data-tags=\"a b\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual(["red", "blue"]);
    });

    it("should match attribute selectors on a value's dash-separated prefix, its start and its end", () => {
        // Arrange
        const rects = ["data-a=\"en\"", "data-a=\"en-GB\"", "data-a=\"english\"", "data-b=\"part\"", "data-b=\"spa\"", "data-c=\"lid\"", "data-c=\"lids\""]
            .map((attribute) => `<rect ${attribute} width="5" height="5"/>`).join("");

        // Act
        const fills = fillsOf(`<svg><style>[data-a|="en"] { fill: red } [data-b^="pa"] { fill: blue } [data-c$=id] { fill: green }</style>${rects}</svg>`);

        // Assert
        expect(fills).toEqual(["red", "red", undefined, "blue", undefined, "green", undefined]);
    });

    it("should never match a start or end attribute selector whose value is empty", () => {
        // Act
        const fills = fillsOf("<svg><style>[data-b^=\"\"] { fill: blue } [data-c$=''] { fill: green }</style><rect data-b=\"x\" data-c=\"y\" width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual([undefined]);
    });

    it("should match an id in an ancestor compound only under the element of that id", () => {
        // Act
        const fills = fillsOf("<svg><style>#a rect { fill: red }</style><g id=\"a\"><rect width=\"5\" height=\"5\"/></g><g id=\"b\"><rect width=\"5\" height=\"5\"/></g></svg>");

        // Assert
        expect(fills).toEqual(["red", undefined]);
    });

    it("should not match a selector of more compounds than the element has ancestors", () => {
        // Act
        const fills = fillsOf("<svg><style>g g rect { fill: red }</style><rect width=\"5\" height=\"5\"/><g><g><rect width=\"5\" height=\"5\"/></g></g></svg>");

        // Assert
        expect(fills).toEqual([undefined, "red"]);
    });

    it("should list the selectors it cannot compile, five by name and the rest by count, and pass over an empty one in a list", () => {
        // Act
        const scene = normalizeSvg("<svg><style>.1a, #, [=x], > rect, g > > rect, g >, rect, { fill: red }</style><rect width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual(["These CSS rules cannot be matched and are not applied: `.1a`, `#`, `[=x]`, `> rect`, `g > > rect` and 1 more."]);
    });

    it("should pass over a @charset statement and an at-rule with no name, the rules inside it included, without a warning", () => {
        // Act
        const scene = normalizeSvg("<svg><style>@charset \"utf-8\"; @ { rect { fill: blue } } circle { fill: red }</style><rect width=\"5\" height=\"5\"/><circle r=\"1\"/></svg>");

        // Assert
        expect(scene.elements.map((e) => e.style.fill)).toEqual([undefined, "red"]);
        expect(scene.warnings).toStrictEqual([]);
    });

    it("should warn once about the selectors it cannot match and still apply the rest", () => {
        // Act
        const scene = normalizeSvg("<svg><style>a:hover, rect { fill: red } p + q { fill: blue } a:hover { fill: x }</style><rect width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual(["These CSS rules cannot be matched and are not applied: `a:hover`, `p + q`."]);
    });

    it("should ignore a stylesheet of another language", () => {
        // Act
        const fills = fillsOf("<svg><style type=\"text/less\">rect { fill: red }</style><rect width=\"5\" height=\"5\"/></svg>");

        // Assert
        expect(fills).toEqual([undefined]);
    });

    it("should try a farther ancestor for a descendant compound when the nearest one leads nowhere", () => {
        // Act
        const fills = fillsOf(`<svg><style>.a > .b .c rect { fill: red } .x .b > rect { fill: blue }</style>
            <g class="a"><g class="b"><g class="b"><g class="c"><rect width="5" height="5"/></g></g></g></g>
            <g class="b"><g class="b x"><g><rect width="5" height="5"/></g></g></g></svg>`);

        // Assert
        expect(fills).toEqual(["red", undefined]);
    });

    it("should match a selector whose child combinator follows a descendant one only through the right ancestor", () => {
        // Act
        const fills = fillsOf(`<svg><style>.a > .b rect { fill: red }</style>
            <g class="a"><g class="c"><g class="b"><rect width="5" height="5"/></g></g></g>
            <g class="b"><g class="a"><g class="b"><g><rect width="5" height="5"/></g></g></g></g></svg>`);

        // Assert
        expect(fills).toEqual([undefined, "red"]);
    });

    it("should split declarations at semicolons outside parentheses and read the important flag", () => {
        // Act
        const declarations = parseDeclarations("fill: url(\"data:a;b\") ; stroke:red ! important; /* c */ opacity: .5");

        // Assert
        expect(declarations).toStrictEqual([
            { property: "fill", value: "url(\"data:a;b\")", important: false },
            { property: "stroke", value: "red", important: true },
            { property: "opacity", value: ".5", important: false },
        ]);
    });

    it("should leave out a declaration with no property or no value", () => {
        // Act
        const declarations = parseDeclarations("fill:; :red; stroke: blue");

        // Assert
        expect(declarations).toStrictEqual([{ property: "stroke", value: "blue", important: false }]);
    });
});

describe("svg css on large and malformed stylesheets", () => {
    const LARGE_INPUT_TIMEOUT = 2_000;
    const chain = (depth: number, inner: string): string => `${"<g>".repeat(depth)}${inner}${"</g>".repeat(depth)}`;

    it("should decide a long descendant selector that fails over a deep chain of groups without trying every placement", () => {
        // Arrange
        const svg = `<svg><style>x ${"g ".repeat(7)}rect { fill: red }</style>${chain(46, "<rect width=\"1\" height=\"1\"/>")}</svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toEqual([undefined]);
    }, LARGE_INPUT_TIMEOUT);

    it("should still match a long descendant selector over a deep chain of groups", () => {
        // Arrange
        const svg = `<svg><style>svg ${"g ".repeat(20)}rect { fill: red }</style>${chain(254, "<rect width=\"1\" height=\"1\"/>")}</svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toEqual(["red"]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a selector with a long run of whitespace in time linear in its length", () => {
        // Arrange
        const svg = `<svg><style>g${" ".repeat(100_000)}rect { fill: red }</style><g><rect width="1" height="1"/></g></svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toEqual(["red"]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a stylesheet full of unterminated comment openings in time linear in its length", () => {
        // Arrange
        const svg = `<svg><style>rect { fill: red } ${"/* ".repeat(100_000)}</style><rect width="1" height="1"/></svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toEqual(["red"]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a stylesheet of many statement at-rules in time linear in its length", () => {
        // Arrange
        const svg = `<svg><style>${"@a;".repeat(400_000)} rect { fill: red }</style><rect width="1" height="1"/></svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toEqual(["red"]);
    }, LARGE_INPUT_TIMEOUT);

    it("should skip at-rules nested deeper than it reads, say so, and apply the rules above them", () => {
        // Arrange
        const svg = `<svg><style>@media screen { rect { fill: red } ${"@media screen {".repeat(20_000)} rect { fill: blue } }</style><rect width="1" height="1"/></svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements[0]!.style.fill).toBe("red");
        expect(scene.warnings).toStrictEqual(["These CSS rules cannot be matched and are not applied: `@media screen`."]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read the words of a long class or attribute list once per element, not once per selector it tries", () => {
        // Arrange
        const words = Array.from({ length: 100_000 }, (_, k) => `w${k}`).join(" ");
        const rects = "<rect width=\"1\" height=\"1\"/>".repeat(900);
        const svg = `<svg><style>.x .w1 rect { fill: red } [data-w~="x"] [data-w~="w2"] rect { fill: blue }</style><g class="${words}" data-w="${words}">${rects}</g></svg>`;

        // Act
        const fills = fillsOf(svg);

        // Assert
        expect(fills).toHaveLength(900);
        expect(fills.every((fill) => fill === undefined)).toBe(true);
    }, LARGE_INPUT_TIMEOUT);

    it("should keep one declaration per property it reads for each element, however many a rule repeats or names", () => {
        // Arrange
        const root = parseXml(`<svg>${"<g/>".repeat(2_000)}</svg>`)!;
        const sheet = parseStylesheets([`* { ${"a: b; ".repeat(2_000)}${"fill: red; ".repeat(2_000)}fill: blue !important; stroke: red }`], new Set(["fill"]));

        // Act
        const matching = matchStylesheet(root, sheet, new WorkBudget(1_000_000));

        // Assert
        expect([...matching.matches.values()].reduce((count, found) => count + found.length, 0)).toBe(2_001);
        expect(matching.exhausted).toBe(false);
    }, LARGE_INPUT_TIMEOUT);

    it("should stop matching a stylesheet whose selectors cost more than it allows over many deep elements, and say so", () => {
        // Arrange
        const rule = `x ${"g ".repeat(247)}rect { fill: red }`;
        const leaves = "<g><rect width=\"1\" height=\"1\"/></g>".repeat(2_000);
        const svg = `<svg><style>${rule.repeat(40)}</style>${chain(249, leaves)}</svg>`;

        // Act
        const scene = normalizeSvg(svg);

        // Assert
        expect(scene.elements).toHaveLength(2_000);
        expect(scene.warnings).toStrictEqual([expect.stringMatching(/^The stylesheet takes more than \d+ steps to match against the document, more than the importer allows for a file of its size; the elements after that point are imported without its rules\.$/)]);
    }, LARGE_INPUT_TIMEOUT);

    it("should decide a long selector once for every sibling under the same deep parent", () => {
        // Arrange
        const rule = `svg ${"g ".repeat(248)}rect { fill: red } x ${"g ".repeat(247)}rect { fill: blue }`;
        const siblings = "<rect width=\"1\" height=\"1\"/>".repeat(4_000);

        // Act
        const scene = normalizeSvg(`<svg><style>${rule}</style>${chain(249, siblings)}</svg>`);

        // Assert
        expect(scene.elements.every((e) => e.style.fill === "red")).toBe(true);
        expect(scene.warnings).toStrictEqual([]);
    }, LARGE_INPUT_TIMEOUT);

    it("should not match an attribute test named after a name every object inherits", () => {
        // Act
        const fills = fillsOf("<svg><style>[constructor] { fill: red } [toString~=\"x\"] { fill: blue }</style><rect width=\"1\" height=\"1\"/></svg>");

        // Assert
        expect(fills).toEqual([undefined]);
    });
});
