import { hexChannels, hexOfChannels } from "./color-forms";
import {
    CHANNEL_MAX, CSS_NAMED_COLORS, LONG_HEX_DIGITS, LONG_HEX_WITH_ALPHA_DIGITS, PERCENT, RGB_CHANNELS, RGB_WITH_ALPHA, SHORT_HEX_DIGITS, SHORT_HEX_WITH_ALPHA_DIGITS,
} from "./css-colors.constants";

interface CssNumber {
    readonly value: number;
    readonly percent: boolean;
}

const HEX_COLOR = /^#([a-f\d]+)$/i;
const RGB_FUNCTION = /^rgba?\(([^()]*)\)$/i;
const CSS_NUMBER = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)(%?)$/i;
const SPACES = /\s+/;
const DIGITS_WITHOUT_ALPHA: ReadonlyMap<number, number> = new Map([
    [SHORT_HEX_DIGITS, SHORT_HEX_DIGITS],
    [SHORT_HEX_WITH_ALPHA_DIGITS, SHORT_HEX_DIGITS],
    [LONG_HEX_DIGITS, LONG_HEX_DIGITS],
    [LONG_HEX_WITH_ALPHA_DIGITS, LONG_HEX_DIGITS],
]);

const hexOfDigits = (digits: string): string | undefined => {
    const kept = DIGITS_WITHOUT_ALPHA.get(digits.length);
    const channels = kept === undefined ? undefined : hexChannels(digits.slice(0, kept));
    return channels === undefined ? undefined : hexOfChannels(channels);
};

const cssNumberOf = (text: string): CssNumber | undefined => {
    const match = CSS_NUMBER.exec(text.trim());
    if (!match) {
        return undefined;
    }
    const value = parseFloat(match[1]!);
    return Number.isFinite(value) ? { value, percent: match[2] === "%" } : undefined;
};

const channelOf = (number: CssNumber): number => {
    const scaled = number.percent ? number.value / PERCENT * CHANNEL_MAX : number.value;
    return Math.min(CHANNEL_MAX, Math.max(0, Math.round(scaled)));
};

const rgbArguments = (text: string): string[] | undefined => {
    if (text.includes(",")) {
        const parts = text.split(",");
        return parts.length === RGB_CHANNELS || parts.length === RGB_WITH_ALPHA ? parts : undefined;
    }
    const [channels, alpha, ...rest] = text.split("/");
    const values = channels!.trim().split(SPACES);
    if (rest.length > 0 || values.length !== RGB_CHANNELS) {
        return undefined;
    }
    return alpha === undefined ? values : values.concat(alpha);
};

const rgbHex = (text: string): string | undefined => {
    const numbers = (rgbArguments(text) ?? []).map(cssNumberOf);
    if (numbers.length === 0 || numbers.some(number => number === undefined)) {
        return undefined;
    }
    return hexOfChannels([channelOf(numbers[0]!), channelOf(numbers[1]!), channelOf(numbers[2]!)]);
};

export function cssColorHex(text: string): string | undefined {
    const trimmed = text.trim();
    const hex = HEX_COLOR.exec(trimmed);
    if (hex) {
        return hexOfDigits(hex[1]!);
    }
    const rgb = RGB_FUNCTION.exec(trimmed);
    if (rgb) {
        return rgbHex(rgb[1]!);
    }
    return CSS_NAMED_COLORS.get(trimmed.toLowerCase());
}
