import { initializationComplete, onMessageInput } from "./manifold-worker";

export class ManifoldWorkerMock {
    initializationComplete = (jscad, plugins: any, doNotPost?: boolean) => { initializationComplete(jscad, plugins, doNotPost); };
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