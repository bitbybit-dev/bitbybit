/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for time and animation: the callback to run each frame and the timing values that drive
 * animated geometry.
 */
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
