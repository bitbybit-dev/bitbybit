import { describe, it, expect } from "vitest";
import * as kernelCalls from "./index";
import { callByPath } from "./call-by-path";
import { withDefaults } from "./with-defaults";

describe("kernel-calls barrel", () => {
    it("should export every function, class and table of the kernel-calls modules", () => {
        // Act
        const exported = Object.keys(kernelCalls).sort();

        // Assert
        expect(exported).toEqual([
            "InputError",
            "KernelCallError",
            "atLeastOne",
            "callByPath",
            "checkStructure",
            "constraintKinds",
            "custom",
            "defineRules",
            "describeKernelFailure",
            "distinct",
            "isRegisteredOperation",
            "lessThan",
            "notZeroVector",
            "prepareKernelCall",
            "rehydrateReferences",
            "reportInputIssues",
            "resolveDto",
            "resolveInputs",
            "ruleBook",
            "sameLength",
            "setInputIssueSink",
            "unknownProperties",
            "validateInputs",
            "when",
            "withDefaults",
        ]);
    });

    it("should export the modules' own bindings rather than copies", () => {
        expect([kernelCalls.callByPath, kernelCalls.withDefaults]).toEqual([callByPath, withDefaults]);
    });
});
