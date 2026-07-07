"use client";

// components/dashboard/ticket-modal.tsx
// Opens as a centered overlay when user clicks "View Ticket" on a ticket card.

import { motion, AnimatePresence } from "framer-motion";
import type { TicketItem } from "@/lib/actions/dashboard.actions";
import EventTicket from "./EventTicket";

interface Props {
    ticket: TicketItem | null;
    onClose: () => void;
}

export default function TicketModal({ ticket, onClose }: Props) {
    return (
        <AnimatePresence>
            {ticket && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Ticket */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 flex flex-col items-center"
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
        </AnimatePresence>
    );
}
