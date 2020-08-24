export interface PromptInterface {
    message: string;
    defaultValue: string;
    callback: (value: string) => string;
}
