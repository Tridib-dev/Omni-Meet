import type { NormalizedEventMode } from "@/lib/event-dashboard/mode";
import { isOperationAvailable } from "@/lib/event-dashboard/mode";
import type { OperationSlug } from "@/lib/event-dashboard/mode";

export default function ModeGate({
    mode,
    operation,
    allowedModes,
    children,
}: {
    mode: NormalizedEventMode;
    operation?: OperationSlug;
    allowedModes?: NormalizedEventMode[];
    children: React.ReactNode;
}) {
    if (allowedModes && !allowedModes.includes(mode)) {
        return null;
    }
    if (operation && !isOperationAvailable(mode, operation)) {
        return null;
    }
    return children;
}
