"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string;
    amount: number;
    paymentId: string;
    eventDate?: string;
    eventTime?: string;
}

export default function PaymentSuccessModal({
    isOpen,
    onClose,
    eventTitle,
    amount,
    paymentId,
    eventDate = "",
    eventTime = "",
}: PaymentSuccessModalProps) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!isOpen || firedRef.current) return;
        firedRef.current = true;

        // Multi-burst confetti
        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                origin: { y: 0.6 },
                ...opts,
                particleCount: Math.floor(200 * particleRatio),
            });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        return () => { firedRef.current = false; };
    }, [isOpen]);

    if (!isOpen) return null;

    // Short ticket ID from payment ID
    const ticketId = paymentId.replace("pay_", "").slice(0, 14).toUpperCase();

    // Simple barcode-like visual using the payment ID characters
    const barcodeString = paymentId.replace(/[^a-z0-9]/gi, "").toUpperCase();

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Ticket card */}
            <div
                className="relative z-10 w-full max-w-[340px] animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main ticket body */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(13, 22, 26, 0.98)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 25px 80px rgba(0,0,0,0.7), 0 0 40px rgba(6,182,212,0.08)",
                    }}
                >
                    {/* Top section */}
                    <div className="px-8 pt-8 pb-6 flex flex-col items-center gap-3">
                        {/* Check icon */}
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                            style={{ background: "rgba(6,182,212,0.12)", border: "1.5px solid rgba(6,182,212,0.3)" }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="#06b6d4"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h2 className="text-white text-2xl font-bold tracking-tight">
                            Thank you!
                        </h2>
                        <p
                            className="text-center text-sm leading-relaxed"
                            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
                        >
                            Your ticket has been issued
                            <br />successfully
                        </p>
                    </div>

                    {/* Dashed separator with notches */}
                    <div className="relative flex items-center px-0">
                        <div
                            className="absolute -left-3.5 w-7 h-7 rounded-full"
                            style={{ background: "#060a0d" }}
                        />
                        <div
                            className="flex-1 border-t border-dashed"
                            style={{ borderColor: "rgba(255,255,255,0.12)" }}
                        />
                        <div
                            className="absolute -right-3.5 w-7 h-7 rounded-full"
                            style={{ background: "#060a0d" }}
                        />
                    </div>

                    {/* Ticket details */}
                    <div className="px-8 py-6 flex flex-col gap-4">
                        {/* Event title */}
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                               style={{ color: "rgba(6,182,212,0.7)" }}>
                                EVENT
                            </p>
                            <p className="text-white font-medium text-sm leading-snug">
                                {eventTitle}
                            </p>
                        </div>

                        {/* Ticket ID + Amount row */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                                   style={{ color: "rgba(255,255,255,0.35)" }}>
                                    TICKET ID
                                </p>
                                <p className="text-white text-sm font-mono">
                                    {ticketId}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                                   style={{ color: "rgba(255,255,255,0.35)" }}>
                                    AMOUNT
                                </p>
                                <p className="text-white text-sm font-bold">
                                    ₹{amount.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        {/* Date & Time */}
                        {(eventDate || eventTime) && (
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                                   style={{ color: "rgba(255,255,255,0.35)" }}>
                                    DATE & TIME
                                </p>
                                <p className="text-white text-sm font-mono">
                                    {eventDate}{eventDate && eventTime ? " • " : ""}{eventTime}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Dashed separator */}
                    <div className="relative flex items-center px-0">
                        <div
                            className="absolute -left-3.5 w-7 h-7 rounded-full"
                            style={{ background: "#060a0d" }}
                        />
                        <div
                            className="flex-1 border-t border-dashed"
                            style={{ borderColor: "rgba(255,255,255,0.12)" }}
                        />
                        <div
                            className="absolute -right-3.5 w-7 h-7 rounded-full"
                            style={{ background: "#060a0d" }}
                        />
                    </div>

                    {/* Barcode section */}
                    <div className="px-8 py-6 flex flex-col items-center gap-3">
                        {/* SVG barcode visual */}
                        <div className="flex items-end gap-px h-10">
                            {barcodeString.split("").slice(0, 36).map((char, i) => {
                                const h = 20 + (char.charCodeAt(0) % 24);
                                const w = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            width: w,
                                            height: h,
                                            background: "rgba(255,255,255,0.75)",
                                            borderRadius: 0.5,
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <p
                            className="text-[10px] tracking-[0.25em] font-mono"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                            {barcodeString.slice(0, 16)}
                        </p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 rounded-2xl text-sm font-medium transition-all"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}