import { vi } from "vitest";

/** A call as the API layer posts it to the worker. */
export type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

/**
 * The worker the manager talks to, recording what reaches it and answering straight away with
 * whatever `answers` holds for the path that was called - an empty object where nothing is set, which
 * is enough for a method that only forwards. A real one is what the manager declares, so this is a
 * whole Worker rather than the package's mock, which would drag the kernel glue in with it.
 */
export class AnsweringWorker extends EventTarget implements Worker {
    readonly posted: PostedCall[] = [];
    readonly answers = new Map<string, unknown>();
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: PostedCall): void {
        this.posted.push(message);
        const { functionName } = message.action;
        const result = this.answers.has(functionName) ? this.answers.get(functionName) : {};
        this.onmessage?.({ data: { uid: message.uid, result } } as MessageEvent);
    }

    terminate(): void {
        this.posted.length = 0;
    }

    /** The path of every call posted so far, in order. */
    paths(): string[] {
        return this.posted.map((call) => call.action.functionName);
    }
}

/** The link a download builds, as the code under test leaves it. */
export type AnchorRecord = {
    href: string;
    target: string;
    download: string;
    clicked: number;
    removed: number;
};

/**
 * Stands a document in for the browser's, so that a download can be watched without one: every
 * element the code creates is recorded rather than attached, and the object url is a fixed string.
 * Undone by vi.unstubAllGlobals and vi.restoreAllMocks.
 */
export const recordDownloads = (objectUrl = "blob:occt/00000000"): { anchors: AnchorRecord[]; created: string[]; blobs: Blob[] } => {
    const anchors: AnchorRecord[] = [];
    const created: string[] = [];
    const blobs: Blob[] = [];

    vi.stubGlobal("document", {
        createElement: (tagName: string) => {
            created.push(tagName);
            const anchor: AnchorRecord = { href: "", target: "", download: "", clicked: 0, removed: 0 };
            anchors.push(anchor);
            return Object.assign(anchor, {
                click: () => { anchor.clicked += 1; },
                remove: () => { anchor.removed += 1; },
            });
        },
    });
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob: Blob | MediaSource) => {
        blobs.push(blob as Blob);
        return objectUrl;
    });

    return { anchors, created, blobs };
};
