/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for time and animation: the callback to run each frame and the timing values that drive
 * animated geometry.
 */
export namespace Time {
    /**
     * A message to send from a page embedded in an iframe to the page that embeds it, using the
     * browser's `postMessage`: the data and the origin allowed to receive it.
     */
    export class PostFromIframe {
        constructor(data?: any, targetOrigin?: string) {
            if (data !== undefined) { this.data = data; }
            if (targetOrigin !== undefined) { this.targetOrigin = targetOrigin; }
        }
        /**
         * The value to send; it is copied across, so it must be serializable
         */
        data: any;
        /**
         * Origin of the page allowed to receive the message, such as `https://example.com`; only a
         * page from that origin gets it
         */
        targetOrigin!: string;
    }
}
