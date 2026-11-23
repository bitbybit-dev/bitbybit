import type * as Models from "../../api/models";

/** What the kernel reads of a label: its info, or the reason it reads none. */
export interface KernelLabelInfo extends Partial<Models.OCCT.LabelInfo> {
    readonly error?: string;
}
