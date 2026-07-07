"use client";

// components/dashboard/EventTicket.tsx

import { useRef, useState, useCallback } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Tag } from "lucide-react";
import SafeImage from "./savedPage";
import CopyIcon from "../CopyIcon";


export interface EventTicketProps {
    id: string;
    type: "free" | "paid";
    eventTitle: string;
    eventSlug: string;
    eventImage: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventCategory?: string;
    price: number;
    checkedIn: boolean;
    status: "upcoming" | "past" | "expired";
    username?: string;
    attendeeName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

// Barcode: uppercase alphanumeric, max 20 chars
function toBarcodeValue(id: string) {
    return id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 20);
}

// QR encodes a full verification URL — this is what the scanner hits at the gate
function toQRValue(id: string) {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://devevent.com";
    return `${base}/verify?id=${id}`;
}

const STATUS_CONFIG = {
    upcoming: { label: "Upcoming", bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.3)",   color: "#22c55e" },
    past:     { label: "Attended", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.3)",   color: "#06b6d4" },
    expired:  { label: "Expired",  bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)", color: "#6b7280" },
};

// ─── Rip line separator ───────────────────────────────────────────────────────
function RipLine() {
    return (
        <div className="relative flex items-center h-8 mx-1">
            <div
                className="absolute -left-5 w-8 h-8 rounded-full z-20"
                style={{
                    background: "#12141a",
                    border: "1px solid rgba(255,255,255,0.07)",
                }}
            />
            <div
                className="absolute -right-5 w-8 h-8 rounded-full z-20"
                style={{
                    background: "#12141a",
                    border: "1px solid rgba(255,255,255,0.07)",
                }}
            />
            <div
                className="flex-1"
                style={{
                    borderTop: "1.5px dashed rgba(255,255,255,0.12)",
                    margin: "0 14px",
                }}
            />
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventTicket({
    id,
    type,
    eventTitle,
    eventImage,
    eventDate,
    eventTime,
    eventLocation,
    eventCategory,
    price,
    checkedIn,
    status,
    username,
    attendeeName,
}: EventTicketProps) {
    const ticketRef  = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [stubTorn,    setStubTorn]    = useState(false);

    const barcodeValue = toBarcodeValue(id);
    const qrValue      = toQRValue(id);
    const cfg          = STATUS_CONFIG[status];
    const isPaid       = price > 0;
    const isExpired    = status === "expired";
    const shouldTear   = status === "past" && checkedIn;
    const displayName  = username?.trim() || attendeeName?.trim() || "Guest";

    const handleDownload = useCallback(async () => {
        if (!ticketRef.current || downloading) return;
        setDownloading(true);
        try {
            const dataUrl = await toPng(ticketRef.current, {
                quality: 1,
                pixelRatio: 3,
                backgroundColor: "#0d1117",
                skipFonts: true,
            });
            const a = document.createElement("a");
            a.download = `devevent-ticket-${barcodeValue}.png`;
            a.href = dataUrl;
            a.click();
        } catch (e) {
            console.error("Download failed", e);
        } finally {
            setDownloading(false);
        }
    }, [barcodeValue, downloading]);

    return (
        <>
            <style>{`
                .ticket-scroll {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .ticket-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <div className="flex flex-col items-center gap-4 w-full max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain pr-1 pb-2 ticket-scroll">

                {/* ── Ticket card ── */}
                <div
                    ref={ticketRef}
                    className="relative w-[min(320px,calc(100vw-2rem))] sm:w-[320px] rounded-2xl overflow-visible"
                    style={{
                        background: "#0d1117",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: isExpired
                            ? "none"
                            : "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                        filter: isExpired ? "grayscale(0.5) opacity(0.7)" : "none",
                    }}
                >
                    {/* ── Image ── */}
                    <div className="relative h-[168px] w-full overflow-hidden rounded-t-2xl">
                        <SafeImage
                            src={eventImage}
                            alt={eventTitle}
                            fill
                            fallback="https://placehold.co/320x168/0b0f13/333?text=Event"
                            className="object-cover"
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(13,17,23,0.9) 100%)",
                            }}
                        />

                    {/* Category */}
                    {eventCategory && (
                        <span
                            className="absolute top-3 left-3 text-[9px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                            style={{
                                background: "rgba(0,0,0,0.55)",
                                backdropFilter: "blur(6px)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.6)",
                            }}
                        >
                            {eventCategory}
                        </span>
                    )}

                    {/* Status */}
                    <span
                        className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            color: cfg.color,
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        {cfg.label}
                    </span>
                </div>

                {/* ── Title ── */}
                <div className="px-6 pt-4 pb-2">
                    <h3
                        className="text-[17px] font-bold text-white leading-snug"
                        style={{ letterSpacing: "-0.02em" }}
                    >
                        {eventTitle}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 mt-1">
                        {type === "paid" ? "Paid Ticket" : "Free Ticket"}
                    </p>
                    {attendeeName && (
                        <p className="text-[11px] text-white/35 mt-1">{attendeeName}</p>
                    )}
                </div>

                {/* ── Rip 1 ── */}
                <RipLine />

                {/* ── Details ── */}
                <div className="px-6 py-4 space-y-3">
                    {[
                        { Icon: MapPin,   label: "Location", value: eventLocation },
                        { Icon: Calendar, label: "Date",     value: formatDate(eventDate) },
                        { Icon: Clock,    label: "Time",     value: eventTime },
                        {
                            Icon: Tag,
                            label: "Pricing",
                            value: isPaid
                                ? `₹${price.toLocaleString("en-IN")} · Paid`
                                : "Free",
                            valueColor: isPaid ? "#f59e0b" : "#22c55e",
                        },
                    ].map(({ Icon, label, value, valueColor }) => (
                        <div key={label} className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[11px] text-white/35">
                                <Icon size={11} style={{ color: "rgba(6,182,212,0.6)" }} />
                                {label}
                            </span>
                            <span
                                className="text-[12px] font-medium text-right max-w-[170px] truncate"
                                style={{ color: valueColor ?? "rgba(255,255,255,0.75)" }}
                            >
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Rip 2 ── */}
                <RipLine />

                {/* ── Verification stub ── */}
                <AnimatePresence>
                    {!stubTorn ? (
                        <motion.div
                            key="stub"
                            initial={{ opacity: 1, y: 0 }}
                            animate={
                                shouldTear
                                    ? { opacity: [1, 1, 0], y: [0, 0, 28] }
                                    : { opacity: 1, y: 0 }
                            }
                            transition={
                                shouldTear
                                    ? { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }
                                    : {}
                            }
                            onAnimationComplete={() => {
                                if (shouldTear) setStubTorn(true);
                            }}
                            className="rounded-b-2xl overflow-hidden"
                        >
                            <div className="px-5 py-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                            Scan to verify
                                        </p>
                                        <p className="text-[11px] text-white/45 mt-1">
                                            QR and barcode for gate validation
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-4">
                                    {/* Left rail: QR + barcode */}
                                    <div className="space-y-3">
                                        <div
                                            className="rounded-xl overflow-hidden p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                            style={{ background: "#ffffff" }}
                                        >
                                            <QRCodeSVG
                                                value={qrValue}
                                                size={88}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="H"
                                                includeMargin={false}
                                            />
                                        </div>
                                    </div>

                                    {/* Right rail: ticket metadata */}
                                    <div className="min-w-0 pt-1">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                                    Ticket ID
                                                  </p>
                                                  <CopyIcon text={barcodeValue} size={12} className="text-white/40 hover:text-white/70" />
                                                </div>
                                                <p className="mt-1.5 text-[12px] font-mono text-white/80 truncate">
                                                    {barcodeValue}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                                    Username
                                                </p>
                                                <p className="mt-1.5 text-[12px] font-medium text-white/80 truncate">
                                                    {displayName}
                                                </p>
                                            </div>
                                        </div>

                                        {checkedIn && (
                                            <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                Checked in
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/25">
                                        Barcode
                                    </p>
                                    <div
                                        className="rounded-xl overflow-hidden px-2 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                        style={{ background: "#ffffff" }}
                                    >
                                        <Barcode
                                            value={barcodeValue}
                                            width={1.35}
                                            height={56}
                                            displayValue={false}
                                            background="#ffffff"
                                            lineColor="#000000"
                                            margin={4}
                                        />
                                    </div>
                                    <p className="text-[9px] font-mono tracking-[0.14em] text-white/20 text-center">
                                        {barcodeValue}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="torn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="py-5 flex items-center justify-center rounded-b-2xl"
                        >
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-600/50">
                                Stub Detached · Attended
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

                {/* ── Download ── */}
                <div className="sticky bottom-3 z-20 flex justify-center pt-4 pb-1 pointer-events-none">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="pointer-events-auto flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-medium transition-all active:scale-95 disabled:opacity-50 shadow-lg backdrop-blur-md"
                        style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.7)",
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" x2="12" y1="15" y2="3"/>
                        </svg>
                        {downloading ? "Saving…" : "Download ticket"}
                    </button>
                </div>
            </div>
        </>
    );
}
