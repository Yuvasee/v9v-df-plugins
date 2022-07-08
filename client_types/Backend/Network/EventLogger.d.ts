export declare const enum EventType {
    Transaction = "transaction",
    Diagnostics = "diagnostics"
}
export declare class EventLogger {
    private static augmentEvent;
    logEvent(eventType: EventType, event: unknown): void;
}
export declare const eventLogger: EventLogger;
