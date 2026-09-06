import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { DataInput, initializationComplete, onMessageInput } from "./occ-worker";

export class OCCTWorkerMock {
    initializationComplete = (occ: BitbybitOcctModule, plugins: any, doNotPost?: boolean) => { initializationComplete(occ, plugins, doNotPost); };
    onMessageInput = (inputs: DataInput) => {
        onMessageInput(inputs, (res: unknown) => {
            if (this.onmessage) {
                this.onmessage({ data: res });
            } else {
                console.log("No onmessage function defined");
            }
        });
    };

    postMessage(data: DataInput | "busy") {
        if (data !== "busy") {
            this.onMessageInput(data);
        }
    }

    onmessage!: (message: { data: unknown }) => void;
}