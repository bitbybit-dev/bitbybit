/**
 * Where the IFC worker is: still loading, loaded and idle, ready after starting, busy with a call,
 * or failed to start.
 * @beta
 */
export enum IFCStateEnum {
    /**
     * A worker was handed over and has not answered yet.
     */
    loading,
    /**
     * The worker is idle: every call it was sent has been answered.
     */
    loaded,
    /**
     * The worker has started and takes calls.
     */
    initialised,
    /**
     * The worker is answering a call.
     */
    computing,
    /**
     * The worker could not run its script; every waiting call was rejected.
     */
    failed,
}
