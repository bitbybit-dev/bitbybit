export type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

export class KernelWorkerFake extends EventTarget implements Worker {
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;
    readonly calls: PostedCall["action"][] = [];
    private held: PostedCall[] | undefined;

    constructor(private readonly initialised?: string, private readonly refuses: readonly string[] = []) {
        super();
        this.held = initialised === undefined ? undefined : [];
    }

    postMessage(message: PostedCall): void {
        this.calls.push(message.action);
        if (this.held !== undefined) {
            this.held.push(message);
            return;
        }
        queueMicrotask(() => this.answer(message));
    }

    ready(): void {
        const waiting = this.held ?? [];
        this.held = undefined;
        this.deliver(this.initialised);
        waiting.forEach((message) => this.answer(message));
    }

    terminate(): void {
        return undefined;
    }

    private answer(message: PostedCall): void {
        const refused = this.refuses.includes(message.action.functionName);
        this.deliver(refused
            ? { uid: message.uid, result: undefined, error: `'${message.action.functionName}' is not a call this worker knows`, errorKind: "input" }
            : { uid: message.uid, result: message.action.inputs });
    }

    private deliver(data: unknown): void {
        this.onmessage?.call(this, new MessageEvent("message", { data }));
    }
}

export const stateWithin = (promise: Promise<unknown>, milliseconds: number): Promise<string> => Promise.race([
    promise.then(() => "resolved", () => "rejected"),
    new Promise<string>((resolve) => setTimeout(() => resolve("pending"), milliseconds)),
]);
