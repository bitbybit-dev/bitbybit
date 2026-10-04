import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Models from "../../api/models";
import { DesignOutcome, stableJson } from "./cache";
import { sha256 } from "./digest";
import { bodyOf, contextOf, faceCount, ownerOf } from "./helpers";
import { FaceNames, nameOf } from "./names";
import { DesignPending, DesignProblem, pointer } from "./problems";
import { resolveEdges, resolveFaces } from "./references";
import { DesignPlan, DesignRun, bodyKey } from "./state";
import { isRecord, ownValue } from "./structure";
import { numberOf } from "./values";

function only(value: unknown, key: string): value is Record<string, unknown> {
    return isRecord(value) && Object.keys(value).length === 1 && key in value;
}

/** The bodies a script's params read: the ones they pass, and the ones their face and edge references name faces on. */
function bodiesReadBy(value: unknown, path: string, run: DesignRun): string[] {
    if (only(value, "body") && typeof value["body"] === "string") {
        return [value["body"]];
    }
    if (only(value, "faces") && isRecord(value["faces"]) && typeof value["faces"]["of"] === "string") {
        return [ownerOf(value["faces"]["of"], pointer(path, "faces", "of"), run)];
    }
    if (only(value, "edges") && isRecord(value["edges"]) && Array.isArray(value["edges"]["between"])) {
        const first: unknown = value["edges"]["between"][0];
        return isRecord(first) && typeof first["of"] === "string" ? [ownerOf(first["of"], pointer(path, "edges", "between", 0, "of"), run)] : [];
    }
    if (Array.isArray(value)) {
        return value.flatMap((inner, index) => bodiesReadBy(inner, pointer(path, index), run));
    }
    return isRecord(value) ? Object.entries(value).flatMap(([key, inner]) => bodiesReadBy(inner, pointer(path, key), run)) : [];
}

/** A script's params with bodies as new handles on their shapes, references as the indexes they find and expressions as numbers. */
function inputsOf(value: unknown, path: string, run: DesignRun): unknown {
    if (only(value, "body") && typeof value["body"] === "string") {
        return bodyOf(value["body"], run).shape.clone();
    }
    if (only(value, "expr")) {
        return numberOf(value["expr"], run.parameters, pointer(path, "expr"));
    }
    if (only(value, "faces")) {
        const reference = value["faces"] as Models.OCCT.DesignFaceReference;
        const owner = bodyOf(ownerOf(reference.of, pointer(path, "faces", "of"), run), run);
        return resolveFaces(reference, contextOf(owner, run), pointer(path, "faces"));
    }
    if (only(value, "edges")) {
        const reference = value["edges"] as Models.OCCT.DesignEdgeReference;
        const owner = bodyOf(ownerOf(reference.between[0].of, pointer(path, "edges", "between", 0, "of"), run), run);
        return resolveEdges(reference, contextOf(owner, run), pointer(path, "edges"));
    }
    if (Array.isArray(value)) {
        return value.map((inner, index) => inputsOf(inner, pointer(path, index), run));
    }
    return isRecord(value) ? Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, inputsOf(inner, pointer(path, key), run)])) : value;
}

/**
 * A script feature: its code is the asset it names, checked against the SHA-256 the document records,
 * and part of its hash, with the bodies its params read. The kernel runs no code, so making it stops
 * the feature as pending, with the inputs the caller runs the script on.
 */
export function scriptPlan(feature: Models.OCCT.DesignScriptFeature, path: string, run: DesignRun): DesignPlan {
    const given = ownValue(run.assets, feature.script);
    if (given === undefined) {
        throw new DesignProblem(pointer(path, "script"), `the build was given no code for the asset "${feature.script}"`);
    }
    const bytes = typeof given === "string" ? new TextEncoder().encode(given) : given instanceof Uint8Array ? given : new Uint8Array(given);
    const asset = run.declaredAssets.find(declared => declared.id === feature.script)!;
    const digest = sha256(bytes);
    if (asset.sha256 !== undefined && asset.sha256 !== digest) {
        throw new DesignProblem(pointer(path, "script"), `the code given for "${feature.script}" has the SHA-256 ${digest}, not the ${asset.sha256} the document records`);
    }
    const params = feature.params ?? {};
    return {
        reads: [...new Set(bodiesReadBy(params, pointer(path, "params"), run))].map(bodyKey),
        salt: `${digest} ${stableJson(asset)}`,
        make: () => {
            const inputs = inputsOf(params, pointer(path, "params"), run) as Record<string, unknown>;
            throw new DesignPending({ id: feature.id, path, script: feature.script, inputs });
        },
    };
}

/**
 * The outcome the caller supplied for a feature, on a new handle of its shape: the face names it gives,
 * or names made of the roles a script gave the faces, each a role of the feature, every other face
 * `face`.
 */
export function suppliedOutcome(feature: Models.OCCT.DesignFeature, supplied: Models.OCCT.DesignSuppliedOutcome<TopoDS_Shape>, path: string, run: DesignRun): DesignOutcome {
    const faces = faceCount(supplied.shape, run);
    if (supplied.names !== undefined) {
        if (supplied.names.length !== faces) {
            throw new DesignProblem(path, `the outcome supplied for it names ${supplied.names.length} faces, but its shape has ${faces}`);
        }
        return { kind: "body", shape: supplied.shape.clone(), names: supplied.names.map(list => [...list].sort()) };
    }
    const names: FaceNames = Array.from({ length: faces }, () => []);
    Object.entries(supplied.roles ?? {}).forEach(([role, indexes]) => indexes.forEach(index => {
        if (!Number.isInteger(index) || index < 0 || index >= faces) {
            throw new DesignProblem(path, `its script gave the role "${role}" to face ${index}, but its shape has ${faces} faces`);
        }
        names[index]!.push(nameOf(feature.id, role));
    }));
    return { kind: "body", shape: supplied.shape.clone(), names: names.map(list => (list.length === 0 ? [nameOf(feature.id, "face")] : [...new Set(list)].sort())) };
}
