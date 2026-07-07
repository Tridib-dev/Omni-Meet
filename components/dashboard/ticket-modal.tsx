"use client";

// components/dashboard/ticket-modal.tsx
// Opens as a centered overlay when user clicks "View Ticket" on a ticket card.

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { TicketItem } from "@/lib/actions/dashboard.actions";
import EventTicket from "./EventTicket";

interface Props {
    ticket: TicketItem | null;
    onClose: () => void;
}

export default function TicketModal({ ticket, onClose }: Props) {
    useEffect(() => {
        if (!ticket) return;

        const { body } = document;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, [ticket]);

    const portalTarget = typeof document === "undefined" ? null : document.body;
    if (!ticket || !portalTarget) return null;

    return createPortal(
        <AnimatePresence>
            {ticket && (
                <motion.div
                    className="fixed inset-0 z-[9999] isolate flex items-center justify-center p-1 sm:p-2 overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0  bg-black/20 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Ticket */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-[1] flex flex-col items-center w-fit max-w-full max-h-[calc(100dvh-2rem)] overflow-hidden pointer-events-auto"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="self-end mb-3 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>

                        <EventTicket
                            id={ticket.id}
                            type={ticket.type}
                            eventTitle={ticket.eventTitle}
                            eventSlug={ticket.eventSlug}
                            eventImage={ticket.eventImage}
                            eventDate={ticket.eventDate}
                            eventTime={ticket.eventTime}
                            eventLocation={ticket.eventLocation}
                            eventCategory={ticket.eventCategory}
                            price={ticket.price}
                            checkedIn={ticket.checkedIn}
                            status={ticket.status}
                            username={ticket.username}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        portalTarget
    );
}
