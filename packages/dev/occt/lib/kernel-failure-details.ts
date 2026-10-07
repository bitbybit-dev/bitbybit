/**
 * The feature a design build was making when the kernel crashed: its id, and the JSON pointer of it
 * in the document, such as `/features/3`.
 */
export type DesignCrashDetails = {
    readonly feature: string;
    readonly path: string;
};
