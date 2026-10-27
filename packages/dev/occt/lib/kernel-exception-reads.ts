const readFromKernel = new WeakSet<Error>();

export function markedReadFromKernel(error: Error): Error {
    readFromKernel.add(error);
    return error;
}

export function wasReadFromKernel(value: unknown): boolean {
    return value instanceof Error && readFromKernel.has(value);
}
