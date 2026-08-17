import {
    normalizeEventMode,
    type NormalizedEventMode,
} from "@/lib/constants/event-mode";

export type { NormalizedEventMode };
export { normalizeEventMode };

export type OperationSlug = "gate" | "room";

export function getModeLabel(mode: NormalizedEventMode): string {
    switch (mode) {
        case "online":
            return "Online";
        case "hybrid":
            return "Hybrid";
        default:
            return "In-Person";
    }
}

export function getOperationsForMode(mode: NormalizedEventMode): OperationSlug[] {
    if (mode === "hybrid") return ["gate", "room"];
    if (mode === "online") return ["room"];
    return ["gate"];
}

export function isOperationAvailable(mode: NormalizedEventMode, operation: OperationSlug): boolean {
    return getOperationsForMode(mode).includes(operation);
}
