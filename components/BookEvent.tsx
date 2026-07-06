'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CreateBooking, hasUserBookedEvent } from '@/lib/actions/booking.actions';
import { hasUserPaidForEvent } from '@/lib/actions/order.actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import PaymentSuccessModal from './PaymentSuccessModal';
import { toggleWatchlist, isEventSaved } from '@/lib/actions/watchlist.actions';

// Extend window to include Razorpay
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: { name?: string; email?: string };
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
    open: () => void;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

interface StickyBookingBarProps {
    eventId: string;
    slug: string;
    title: string;
    description?: string;
    price: number;
    mode: string;
    eventDate?: string;
    eventTime?: string;
}

const StickyBookingBar = ({
    eventId,
    slug,
    title,
    description = "",
    price,
    mode,
    eventDate = "",
    eventTime = "",
}: StickyBookingBarProps) => {
    const { isSignedIn, user } = useUser();
    const [isSaved, setIsSaved] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [hasBooked, setHasBooked] = useState(false);

    
    // Payment success modal state
    const [successModal, setSuccessModal] = useState<{
        open: boolean;
        paymentId: string;
    }>({ open: false, paymentId: "" });

    const isPaid = price > 0;
    const shortDesc =
        description.length > 85 ? description.substring(0, 85) + "..." : description;

    // Check existing booking/order status
    useEffect(() => {
        const check = async () => {
            if (!isSignedIn) return;
            if (isPaid) {
                const paid = await hasUserPaidForEvent(eventId);
                setHasBooked(paid);
            } else {
                const booked = await hasUserBookedEvent(eventId);
                setHasBooked(booked);
            }
            const saved = await isEventSaved(eventId);
            setIsSaved(saved);
        };
        check();
    }, [eventId, isSignedIn, isPaid]);

    const handleSave = async () => {
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
            return;
        }
        const result = await toggleWatchlist(eventId);
        setIsSaved(result.saved);
        toast.success(result.saved ? "Saved to watchlist" : "Removed from watchlist");
}   ;

    // ── Free event booking ────────────────────────────────────────────────
    const handleFreeBook = async () => {
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
            return;
        }
        setIsBooking(true);
        const result = await CreateBooking({ eventId, slug });
        if (result.success) {
            setHasBooked(true);
            toast.success("🎉 You're signed up!");
        } else {
            toast.error(result.error || "Booking failed.");
        }
        setIsBooking(false);
    };

    // ── Paid event booking via Razorpay ───────────────────────────────────
    const handlePaidBook = async () => {
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        setIsBooking(true);

        // 1. Load Razorpay SDK
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            toast.error("Failed to load payment gateway. Please try again.");
            setIsBooking(false);
            return;
        }

        // 2. Create Razorpay order on server
        const res = await fetch("/api/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: price, eventId, eventTitle: title, eventSlug: slug }),
        });

        if (!res.ok) {
            toast.error("Could not initiate payment. Please try again.");
            setIsBooking(false);
            return;
        }

        const { orderId, amount, currency } = await res.json();

        // 3. Open Razorpay modal
        const options: RazorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount,
            currency,
            name: "DevEvent",
            description: title,
            order_id: orderId,
            prefill: {
                name: user?.fullName ?? "",
                email: user?.emailAddresses?.[0]?.emailAddress ?? "",
            },
            theme: { color: "#06b6d4" },
            modal: {
                ondismiss: () => {
                    toast.info("Payment cancelled.");
                    setIsBooking(false);
                },
            },
            handler: async (response: RazorpayResponse) => {
                // 4. Verify on server
                const verifyRes = await fetch("/api/razorpay/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...response,
                        eventId,
                        eventTitle: title,
                        eventSlug: slug,
                        amount: price,
                    }),
                });

                if (verifyRes.ok) {
                    setHasBooked(true);
                    setSuccessModal({
                        open: true,
                        paymentId: response.razorpay_payment_id,
                    });
                } else {
                    toast.error("Payment verification failed. Contact support.");
                }
                setIsBooking(false);
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handleBook = isPaid ? handlePaidBook : handleFreeBook;

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
                <div className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="px-6 py-5 flex items-center justify-between">
                        {/* Left Info */}
                        <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                                    {mode}
                                </div>
                                {isPaid && (
                                    <div className="text-xs font-medium text-amber-400">
                                        ₹{price.toLocaleString("en-IN")}
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold text-white text-[17px] leading-tight truncate">
                                {title}
                            </p>
                            {shortDesc && (
                                <p className="text-sm text-white/60 mt-1 line-clamp-1">
                                    {shortDesc}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSave}
                                className="border-white/10 hover:bg-white/5 hover:border-white/30 transition-all active:scale-95 group"
                            >
                                <Image
                                    src="/icons/pin.svg"
                                    alt="Save"
                                    width={18}
                                    height={18}
                                    className={`mr-2 transition-all group-hover:scale-110 ${isSaved ? "text-pink-400" : ""}`}
                                />
                                {isSaved ? "Saved" : "Save"}
                            </Button>

                            <Button
                                onClick={handleBook}
                                disabled={isBooking || hasBooked}
                                className="bg-white text-black hover:bg-white/90 font-semibold px-8 active:scale-[0.985] transition-all disabled:opacity-70 group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {hasBooked ? (
                                        "✓ Booked"
                                    ) : isBooking ? (
                                        isPaid ? "Opening payment…" : "Booking…"
                                    ) : isPaid ? (
                                        `Book • ₹${price.toLocaleString("en-IN")}`
                                    ) : (
                                        "Attend Free"
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transition-transform duration-700 group-hover:translate-x-[200%]" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment success modal */}
            <PaymentSuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ open: false, paymentId: "" })}
                eventTitle={title}
                amount={price}
                paymentId={successModal.paymentId}
                eventDate={eventDate}
                eventTime={eventTime}
            />
        </>
    );
};

export default StickyBookingBar;