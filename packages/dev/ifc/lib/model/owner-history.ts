import { GlobalCDNProvider } from "@bitbybit-dev/base";
import type { IfcValue } from "../step/step-types";
import { enumValue, isReference, ref } from "../step/values";
import type { IfcTransaction } from "./transaction";

const OWNER_HISTORY = "IfcOwnerHistory";
const ROOT = "IfcRoot";
const PLACEMENT = "IfcObjectPlacement";
const APPLICATION = "IfcApplication";
const ORGANIZATION = "IfcOrganization";
const PERSON_AND_ORGANIZATION = "IfcPersonAndOrganization";
const IDENTIFIER = "@bitbybit-dev/ifc";
const DEVELOPER = "Bit By Bit Developers";
const VERSION_MARK = "/v";
const MILLISECONDS_PER_SECOND = 1000;
const UNSTAMPED = -1;

class Stamper {
    private application: number | undefined;
    private added: number | undefined;
    private readonly modified = new Map<number, number>();
    private readonly now = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);

    constructor(private readonly tx: IfcTransaction, private readonly user: number) { }

    stampAdded(id: number): void {
        if (!isReference(this.tx.attribute(id, "OwnerHistory"))) {
            this.added ??= this.history({ OwningUser: ref(this.user), OwningApplication: ref(this.app()), CreationDate: this.now }, "ADDED");
            this.tx.update(id, { OwnerHistory: ref(this.added) });
        }
    }

    stampModified(id: number): void {
        const before = this.tx.base.attribute(id, "OwnerHistory");
        const now = this.tx.attribute(id, "OwnerHistory");
        if (isReference(before) !== isReference(now) || (isReference(before) && isReference(now) && before.ref !== now.ref)) {
            return;
        }
        const previous = isReference(before) ? before.ref : UNSTAMPED;
        let history = this.modified.get(previous);
        if (history === undefined) {
            history = this.history(previous === UNSTAMPED
                ? { OwningUser: ref(this.user), OwningApplication: ref(this.app()), CreationDate: this.now }
                : {
                    OwningUser: this.tx.attribute(previous, "OwningUser"),
                    OwningApplication: this.tx.attribute(previous, "OwningApplication"),
                    State: this.tx.attribute(previous, "State"),
                    CreationDate: this.tx.attribute(previous, "CreationDate"),
                }, "MODIFIED");
            this.modified.set(previous, history);
        }
        this.tx.update(id, { OwnerHistory: ref(history) });
    }

    private history(owner: Record<string, IfcValue>, action: string): number {
        return this.tx.create(OWNER_HISTORY, {
            ...owner,
            ChangeAction: enumValue(action),
            LastModifiedDate: this.now,
            LastModifyingUser: ref(this.user),
            LastModifyingApplication: ref(this.app()),
        });
    }

    private app(): number {
        if (this.application === undefined) {
            const known = this.tx.byType(APPLICATION).find((application) => this.tx.valueOf(application, "ApplicationIdentifier") === IDENTIFIER);
            this.application = known?.id ?? this.tx.create(APPLICATION, {
                ApplicationDeveloper: ref(this.tx.create(ORGANIZATION, { Name: DEVELOPER })),
                Version: GlobalCDNProvider.BITBYBIT_CDN_URL.slice(GlobalCDNProvider.BITBYBIT_CDN_URL.lastIndexOf(VERSION_MARK) + VERSION_MARK.length),
                ApplicationFullName: IDENTIFIER,
                ApplicationIdentifier: IDENTIFIER,
            });
        }
        return this.application;
    }
}

function isA(tx: IfcTransaction, id: number, type: string): boolean {
    return tx.schema.isSubtypeOf(tx.entity(id).type, type);
}

function rootsChanged(tx: IfcTransaction, changed: readonly number[]): number[] {
    const roots = new Set(changed.filter((id) => isA(tx, id, ROOT)));
    const parts = changed.filter((id) => !roots.has(id));
    const seen = new Set(changed);
    for (let index = 0; index < parts.length; index++) {
        const part = parts[index]!;
        const placement = isA(tx, part, PLACEMENT);
        for (const user of tx.referencesTo(part)) {
            if (!seen.has(user) && !(placement && isA(tx, user, PLACEMENT))) {
                seen.add(user);
                if (isA(tx, user, ROOT)) {
                    roots.add(user);
                } else {
                    parts.push(user);
                }
            }
        }
    }
    return [...roots].filter((id) => id < tx.base.nextId).sort((a, b) => a - b);
}

export function stampOwnerHistories(tx: IfcTransaction, created: readonly number[], changed: readonly number[]): void {
    if (!tx.base.hasType(OWNER_HISTORY)) {
        return;
    }
    const user = tx.byType(PERSON_AND_ORGANIZATION)[0];
    if (user === undefined) {
        return;
    }
    const stamper = new Stamper(tx, user.id);
    created.filter((id) => isA(tx, id, ROOT)).forEach((id) => stamper.stampAdded(id));
    rootsChanged(tx, changed).forEach((id) => stamper.stampModified(id));
}
