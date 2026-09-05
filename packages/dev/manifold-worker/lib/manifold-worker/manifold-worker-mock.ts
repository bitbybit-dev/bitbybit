import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

export class ManifoldWorkerMock {
    initializationComplete = (jscad: unknown, plugins: any, doNotPost?: boolean) => { initializationComplete(jscad, plugins, doNotPost); };
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