import { initializationComplete, onMessageInput } from "./occ-worker";

export class OCCTWorkerMock {
    initializationComplete = (occ, plugins: any, doNotPost?: boolean) => { initializationComplete(occ, plugins, doNotPost); };
    onMessageInput = (inputs) => {
        onMessageInput(inputs, (res) => {
            if (this.onmessage) {
                this.onmessage({ data: res });
            } else {
                console.log("No onmessage function defined");
            }
        });
    };

    postMessage(data) {
        if (data !== "busy") {
            this.onMessageInput(data);
        }
    }

    onmessage: (data) => void;
}