export type ErrorClass<T extends Error> = new (...args: never[]) => T;

export function errorThrownBy<T extends Error>(kind: ErrorClass<T>, action: () => unknown): T {
    try {
        action();
    } catch (error) {
        if (error instanceof kind) {
            return error;
        }
        throw error;
    }
    throw new Error(`Expected a ${kind.name}, but nothing was thrown`);
}
