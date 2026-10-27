const MILLIONTH_PLACES = 6;
const DECIMAL_BASE = 10;

const SMOOTHSTEP_RISE = 3;
const HALF_TURN_DEGREES = 180;

export const smoothstep = (value: number): number => {
    const t = Math.min(1, Math.max(0, value));
    return t * t * (SMOOTHSTEP_RISE - 2 * t);
};

export const roundedTo = (value: number, places: number): number => Math.round(value * Math.pow(DECIMAL_BASE, places)) / Math.pow(DECIMAL_BASE, places);

export const roundedToMillionths = (value: number): number => roundedTo(value, MILLIONTH_PLACES);

export const fractionOf = (value: number): number => value - Math.floor(value);

export const radiansOf = (degrees: number): number => degrees * Math.PI / HALF_TURN_DEGREES;

export const degreesOf = (radians: number): number => radians * HALF_TURN_DEGREES / Math.PI;

export const angleOfCosine = (cosine: number): number => Math.acos(Math.min(1, Math.max(-1, cosine)));

export const interpolated = (start: number, end: number, share: number): number => start + (end - start) * share;

function greatestCommonDivisor(first: number, second: number): number {
    let [a, b] = [first, second];
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

export function fractionText(value: number, denominator: number): string {
    const units = Math.round(Math.abs(value) * denominator);
    const whole = Math.floor(units / denominator);
    const rest = units - whole * denominator;
    const common = greatestCommonDivisor(rest, denominator);
    const sign = value < 0 && units > 0 ? "-" : "";
    if (rest === 0) {
        return `${sign}${String(whole)}`;
    }
    const part = `${String(rest / common)}/${String(denominator / common)}`;
    return whole === 0 ? `${sign}${part}` : `${sign}${String(whole)}-${part}`;
}
