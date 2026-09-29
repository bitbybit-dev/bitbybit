import { describe, it, expect } from "vitest";
import * as ts from "typescript";
import { MathBitByBit } from "../services/math";

const tagsOf = (file: string, className: string, property: string): Map<string, string> => {
    const path = decodeURIComponent(new URL(file, import.meta.url).pathname);
    const source = ts.createSourceFile(path, ts.sys.readFile(path) ?? "", ts.ScriptTarget.Latest, true);
    const found = new Map<string, string>();
    const visit = (node: ts.Node): void => {
        if (ts.isClassDeclaration(node) && node.name?.text === className) {
            const member = node.members.find((m) => ts.isPropertyDeclaration(m) && ts.isIdentifier(m.name) && m.name.text === property);
            for (const tag of member ? ts.getJSDocTags(member) : []) {
                found.set(tag.tagName.text, ts.getTextOfJSDocComment(tag.comment) ?? "");
            }
            return;
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return found;
};

describe("the bounds of the math inputs", () => {
    it("should stop the decimal places of math.toFixed at 100, the most it formats", () => {
        // Arrange
        const math = new MathBitByBit();

        // Act
        const tags = tagsOf("./math-inputs.ts", "ToFixedDto", "decimalPlaces");
        const atTheBound = (): string => math.toFixed({ number: 1.5, decimalPlaces: 100 });
        const pastTheBound = (): string => math.toFixed({ number: 1.5, decimalPlaces: 101 });

        // Assert
        expect(tags.get("maximum")).toBe("100");
        expect(atTheBound).not.toThrow();
        expect(pastTheBound).toThrow(RangeError);
    });
});
