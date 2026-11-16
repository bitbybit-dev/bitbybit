import { InputError } from "../../../../kernel-calls";
import { WorkBudget } from "../work-budget";
import { DXF_HEX_RADIX, DXF_HEX_WIDTH, DXF_HIGHEST_ASCII } from "./dxf.constants";

export interface DxfTextLimit {
    readonly budget: WorkBudget;
    readonly property: string;
}

const plainDecimalOf = (exponential: string): string => {
    const [mantissa, exponentText] = exponential.split("e") as [string, string];
    const negative = mantissa.startsWith("-");
    const digits = (negative ? mantissa.slice(1) : mantissa).replace(".", "");
    const exponent = Number(exponentText);
    const plain = exponent < 0
        ? `0.${"0".repeat(-exponent - 1)}${digits}`
        : `${digits}${"0".repeat(exponent + 1 - digits.length)}`;
    return negative ? `-${plain}` : plain;
};

export const realText = (value: number): string => {
    if (value === 0) {
        return "0.0";
    }
    const shortest = String(value);
    const text = shortest.includes("e") ? plainDecimalOf(shortest) : shortest;
    return text.includes(".") ? text : `${text}.0`;
};

export const encodedText = (value: string): string => {
    let encoded = "";
    for (let at = 0; at < value.length; at++) {
        const code = value.charCodeAt(at);
        encoded += code > DXF_HIGHEST_ASCII ? `\\U+${code.toString(DXF_HEX_RADIX).toUpperCase().padStart(DXF_HEX_WIDTH, "0")}` : value[at]!;
    }
    return encoded;
};

export class DxfText {
    private readonly pieces: string[] = [];
    private readonly encodedNames = new Map<string, string>();
    private handle: number;

    constructor(firstHandle: number, private readonly limit: DxfTextLimit = { budget: new WorkBudget(Number.POSITIVE_INFINITY), property: "dxf" }) {
        this.handle = firstHandle;
    }

    get budget(): WorkBudget {
        return this.limit.budget;
    }

    refuseWhenSpent(): void {
        if (this.limit.budget.exhausted) {
            throw this.tooLarge();
        }
    }

    pair(code: string, value: string): void {
        if (!this.limit.budget.spend(code.length + value.length + 2)) {
            throw this.tooLarge();
        }
        this.pieces.push(code, value);
    }

    real(code: string, value: number): void {
        this.pair(code, realText(value));
    }

    point(codes: readonly [number, number, number], point: readonly [number, number, number]): void {
        this.real(String(codes[0]), point[0]);
        this.real(String(codes[1]), point[1]);
        this.real(String(codes[2]), point[2]);
    }

    name(code: string, value: string): void {
        let encoded = this.encodedNames.get(value);
        if (encoded === undefined) {
            encoded = encodedText(value);
            this.encodedNames.set(value, encoded);
        }
        this.pair(code, encoded);
    }

    nextHandle(): string {
        const handle = this.handle.toString(DXF_HEX_RADIX).toUpperCase();
        this.handle++;
        return handle;
    }

    peekHandle(): string {
        return this.handle.toString(DXF_HEX_RADIX).toUpperCase();
    }

    reserve(code: string): number {
        this.pair(code, "");
        return this.pieces.length - 1;
    }

    fill(slot: number, value: string): void {
        if (!this.limit.budget.spend(value.length)) {
            throw this.tooLarge();
        }
        this.pieces[slot] = value;
    }

    joined(): string {
        try {
            return `${this.pieces.join("\n")}\n`;
        } catch {
            throw this.tooLarge();
        }
    }

    private tooLarge(): InputError {
        const { budget, property } = this.limit;
        return new InputError(`\`${property}\` is too large to write as DXF: it takes more than ${budget.capacity} steps, each character written and each control point blended counted, the most a drawing of its size may take.`, property);
    }
}
