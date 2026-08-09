"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface BottomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function BottomModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    className = "",
}: BottomModalProps) {
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <AnimatePresence>
            <motion.div
                key="bottom-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[1000] bg-black/65 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
                aria-hidden="true"
            />

            <motion.div
                key="bottom-modal-panel"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{
                    type: "spring",
                    damping: 26,
                    stiffness: 300,
                }}
                className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto w-full md:max-w-lg"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-modal-title"
                aria-describedby={description ? "bottom-modal-description" : undefined}
            >
                <div
                    className={[
                        "group relative overflow-hidden rounded-t-3xl border border-white/10 bg-[#0d1117] shadow-[0_-24px_80px_rgba(0,0,0,0.65)]",
                        className,
                    ].join(" ")}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5 opacity-80" />
                    <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                        <div>
                            <h3 id="bottom-modal-title" className="text-[15px] font-semibold text-white/90">
                                {title}
                            </h3>
                            {description ? (
                                <p id="bottom-modal-description" className="mt-1 text-[12px] leading-5 text-white/35">
                                    {description}
                                </p>
                            ) : null}
                        </div>

                        <button
                            onClick={() => onOpenChange(false)}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                            aria-label="Close modal"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="relative px-5 py-5">{children}</div>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
