import { BLUE_OFFSET, GREEN_OFFSET, GREEN_PLACE, HEX_LEAD, HUE_DEGREES_PER_STEP, HUE_FALL_START, HUE_RISE_START, HUE_STEPS, RED_OFFSET, RED_PLACE } from "./color-forms.constants";

const HEX_RADIX = 16;
const LONG_HEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const SHORT_HEX = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

export function hexChannels(text: string): [number, number, number] | undefined {
    const long = LONG_HEX.exec(text);
    if (long) {
        return [parseInt(long[1]!, HEX_RADIX), parseInt(long[2]!, HEX_RADIX), parseInt(long[3]!, HEX_RADIX)];
    }
    const short = SHORT_HEX.exec(text);
    if (!short) {
        return undefined;
    }
    const doubled = (digit: string): number => parseInt(digit + digit, HEX_RADIX);
    return [doubled(short[1]!), doubled(short[2]!), doubled(short[3]!)];
}

export function hexOfChannels(channels: readonly [number, number, number]): string {
    return `#${(HEX_LEAD + channels[0] * RED_PLACE + channels[1] * GREEN_PLACE + channels[2]).toString(HEX_RADIX).substring(1)}`;
}

export function hslChannels(hue: number, saturation: number, lightness: number): [number, number, number] {
    const reach = saturation * Math.min(lightness, 1 - lightness);
    const channel = (offset: number): number => {
        const step = ((offset + hue / HUE_DEGREES_PER_STEP) % HUE_STEPS + HUE_STEPS) % HUE_STEPS;
        return lightness - reach * Math.max(-1, Math.min(step - HUE_RISE_START, HUE_FALL_START - step, 1));
    };
    return [channel(RED_OFFSET), channel(GREEN_OFFSET), channel(BLUE_OFFSET)];
}
