/* eslint-disable @typescript-eslint/no-namespace */

export namespace Time {
    export class PostFromIframe {
        constructor(data?: any, targetOrigin?: string) {
            if (data !== undefined) { this.data = data; }
            if (targetOrigin !== undefined) { this.targetOrigin = targetOrigin; }
        }
        /**
         * The data object to post
         */
        data: any;
        /**
         * Thir party iframe origin url to which data should be posted
         */
        targetOrigin: string;
    }
}
