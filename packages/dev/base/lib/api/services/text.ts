import * as Inputs from "../inputs";
import { defaultsVectorParams } from "../models/simplex";
import { Point } from "./point";

/**
 * Contains various text methods.
 */
export class TextBitByBit {
    constructor(private readonly point: Point) { 
    }

    /**
     * Creates a text
     * @param inputs a text
     * @returns text
     * @group create
     * @shortname text
     * @drawable false
     */
    create(inputs: Inputs.Text.TextDto): string {
        return inputs.text;
    }

    /**
    * Split the text to multiple pieces by a separator
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname split
    * @drawable false
    */
    split(inputs: Inputs.Text.TextSplitDto): string[] {
        return inputs.text.split(inputs.separator);
    }

    /**
    * Replace all occurrences of a text by another text
    * @param inputs a text
    * @returns text
    * @group transform
    * @shortname replaceAll
    * @drawable false
    */
    replaceAll(inputs: Inputs.Text.TextReplaceDto): string {
        return inputs.text.split(inputs.search).join(inputs.replaceWith);
    }

    /**
    * Join multiple items by a separator into text
    * @param inputs a list of items
    * @returns text
    * @group transform
    * @shortname join
    * @drawable false
    */
    join(inputs: Inputs.Text.TextJoinDto): string {
        return inputs.list.join(inputs.separator);
    }

    /**
    * Transform any item to text
    * @param inputs any item
    * @returns text
    * @group transform
    * @shortname to string
    * @drawable false
    */
    toString<T>(inputs: Inputs.Text.ToStringDto<T>): string {
        return inputs.item.toString();
    }

    /**
    * Transform each item in list to text
    * @param inputs list of items
    * @returns texts
    * @group transform
    * @shortname to strings
    * @drawable false
    */
    toStringEach<T>(inputs: Inputs.Text.ToStringEachDto<T>): string[] {
        return inputs.list.map(i => i.toString());
    }

    /**
     * Format a text with values
     * @param inputs a text and values
     * @returns formatted text
     * @group transform
     * @shortname format
     * @drawable false
     */
    format(inputs: Inputs.Text.TextFormatDto): string {
        return inputs.text.replace(/{(\d+)}/g, (match, number) => {
            return typeof inputs.values[number] !== "undefined" ? inputs.values[number] : match;
        });
    }

    /**
     * Creates a vector segments for character and includes width and height information
     * @param inputs a text
     * @returns width, height and segments as json
     * @group vector
     * @shortname vector char
     * @drawable false
     */
    vectorChar(inputs: Inputs.Text.VectorCharDto): Inputs.Text.VectorCharResultDto {
        const {
            xOffset, yOffset, font, input, height, extrudeOffset
        } = this.vectorParamsChar(inputs);
        let code = input.charCodeAt(0);
        if (!code || !font[code]) {
            code = 63;
        }
        const glyph = [].concat(font[code]);
        const ratio = (height - extrudeOffset) / font.height;
        const extrudeYOffset = (extrudeOffset / 2);
        const width = glyph.shift() * ratio;
        const paths: Inputs.Base.Point3[][] = [];
        let polyline = [];
        for (let i = 0, il = glyph.length; i < il; i += 2) {
            const gx = ratio * glyph[i] + xOffset;
            const gy = ratio * glyph[i + 1] + yOffset + extrudeYOffset;
            if (glyph[i] !== undefined) {
                polyline.push([gx, 0, gy]);
                continue;
            }
            paths.push(polyline as Inputs.Base.Point3[]);
            polyline = [];
            i--;
        }
        if (polyline.length) {
            paths.push(polyline as Inputs.Base.Point3[]);
        }
        return { width, height, paths };
    }

    /**
     * Creates a vector text lines for a given text and includes width and height information
     * @param inputs a text as string
     * @returns segments
     * @group vector
     * @shortname vector text
     * @drawable false
     */
    vectorText(inputs: Inputs.Text.VectorTextDto): Inputs.Text.VectorTextResultDto[] {
        const {
            xOffset, yOffset, height, align, extrudeOffset, lineSpacing, letterSpacing
        } = Object.assign({}, defaultsVectorParams, inputs);

        const text = inputs.text;
        if (typeof text !== "string") throw new Error("text must be a string");

        // NOTE: Just like CSS letter-spacing, the spacing could be positive or negative
        const extraLetterSpacing = (height * letterSpacing);

        // manage the list of lines
        let maxWidth = 0; // keep track of max width for final alignment
        let line = { width: 0, height: 0, chars: [] };
        let lines = [];

        const pushLine = () => {
            maxWidth = Math.max(maxWidth, line.width);

            if (line.chars.length) lines.push(line);
            line = { width: 0, height: 0, chars: [] };
        };

        // convert the text into a list of vector lines
        let x = xOffset;
        let y = yOffset;
        let vchar;
        const il = text.length;
        for (let i = 0; i < il; i++) {
            const character = text[i];
            if (character === "\n") {
                pushLine();

                // reset x and y for a new line
                x = xOffset;
                y -= height * lineSpacing;
                continue;
            }
            // convert the character
            vchar = this.vectorChar({ xOffset: x, yOffset: y, height, extrudeOffset, char: character });

            const width = vchar.width + extraLetterSpacing;
            x += width;

            // update current line
            line.width += width;
            line.height = Math.max(line.height, vchar.height);
            if (character !== " ") {
                line.chars = line.chars.concat(vchar);
            }
        }
        if (line.chars.length) pushLine();

        // align all lines as requested
        lines = lines.map((line) => {
            const diff = maxWidth - line.width;
            if (align === Inputs.Base.horizontalAlignEnum.right) {
                return this.translateLine({ x: diff }, line);
            } else if (align === Inputs.Base.horizontalAlignEnum.center) {
                return this.translateLine({ x: diff / 2 }, line);
            } else {
                return line;
            }
        });
        return lines;
    }

    private vectorParamsChar(inputs: Inputs.Text.VectorCharDto): typeof defaultsVectorParams {
        const params = Object.assign({}, defaultsVectorParams, inputs);
        params.input = inputs.char || params.char;
        return params;
    }

    private translateLine(options, line) {
        const { x, y } = Object.assign({ x: 0, y: 0 }, options);
        line.chars = line.chars.map((vchar) => {
            vchar.paths = vchar.paths.map((path) => {
                const pts = this.point.translatePoints({
                    points: path,
                    translation: [x, 0, y],
                });
                return pts;
            });
            return vchar;
        });
        return line;
    }
}
