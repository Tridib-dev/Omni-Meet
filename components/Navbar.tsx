"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import FlowButtonV1 from './GetStartedBTN';

interface NavLink {
    label: string;
    href: string;
}

const NAV_LINKS: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Discover", href: "/events/discover" },
    { label: "Create Event", href: "/create_event" },
    { label: "Dashboard", href: "/dashboard" },
];

const signInButtonClass =
    "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();

    const [scrolled, setScrolled] = useState(false);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleSignUp = () => {
        setMobileOpen(false);
        router.push("/sign-up");
    };

    const containerRef = useRef<HTMLUListElement>(null);
    const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

    const activeHref =
        NAV_LINKS.find((link) => link.href === pathname)?.href ??
        NAV_LINKS.find((link) => link.href !== "/" && pathname?.startsWith(link.href))?.href ??
        "";

    const measureIndicator = useCallback(() => {
        const activeEl = linkRefs.current.get(activeHref);
        const container = containerRef.current;

        if (!activeEl || !container || container.offsetParent === null) {
            setIndicator((prev) => (prev.ready ? { ...prev, ready: false } : prev));
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        if (containerRect.width === 0 || activeRect.width === 0) {
            setIndicator((prev) => (prev.ready ? { ...prev, ready: false } : prev));
            return;
        }

        setIndicator({
            left: activeRect.left - containerRect.left,
            width: activeRect.width,
            ready: true,
        });
    }, [activeHref]);

    useLayoutEffect(() => {
        measureIndicator();
    }, [measureIndicator]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => measureIndicator());
        observer.observe(container);
        linkRefs.current.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [measureIndicator]);

    useEffect(() => {
        const handleResize = () => measureIndicator();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [measureIndicator]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className="navbar-wrapper">
            <nav className={`navbar-floating ${scrolled ? "navbar-scrolled" : ""}`} aria-label="Primary">
                {/* Logo - Left */}
                <Link href="/" className="logo">
                    <Image src="/icons/logo.png" alt="DevEvent" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>

                {/* Desktop Navigation - Center */}
                <ul className="navbar-links-desktop hidden md:flex relative" ref={containerRef}>
                    {indicator.ready && (
                        <span
                            className="navbar-pill-indicator hidden md:block"
                            aria-hidden="true"
                            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
                        />
                    )}
                    {NAV_LINKS.map((link) => {
                        const isActive = activeHref === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    ref={(el) => {
                                        if (el) linkRefs.current.set(link.href, el);
                                    }}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`navbar-link ${isActive ? "navbar-link-active" : ""}`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Right Side - Auth + Hamburger */}
                <div className="flex items-center gap-3">
                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {isLoaded && (
                            <>
                                {!isSignedIn ? (
                                    <div className="flex items-center gap-2">
                                        <SignInButton mode="redirect" fallbackRedirectUrl="/">
                                            <button type="button" className={signInButtonClass}>
                                                Sign in
                                            </button>
                                        </SignInButton>
                                        <FlowButtonV1 onClick={handleSignUp} />
                                    </div>
                                ) : (
                                    <div className="flex items-center rounded-full border border-white/10 bg-white/10 px-2 py-1 backdrop-blur-sm">
                                        <UserButton />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Get Started / User Button - Always visible on mobile */}
                    <div className="md:hidden">
                        {isLoaded && (
                            <>
                                {!isSignedIn ? (
                                    <FlowButtonV1 onClick={handleSignUp} />
                                ) : (
                                    <div className="flex items-center rounded-full border border-white/10 bg-white/10 px-2 py-1 backdrop-blur-sm">
                                        <UserButton />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Hamburger Menu Button */}
                    <button
                        type="button"
                        className="navbar-mobile-toggle"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu - Contains Nav Links + Auth */}
            {mobileOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 z-40 md:hidden" 
                        onClick={() => setMobileOpen(false)} 
                    />

                    <nav className="navbar-mobile-menu z-50" aria-label="Mobile">
                        <ul>
                            {NAV_LINKS.map((link) => {
                                const isActive = activeHref === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`navbar-mobile-link ${isActive ? "navbar-mobile-link-active" : ""}`}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="mt-3 border-t border-white/10 pt-3">
                            {isLoaded && (
                                <>
                                    {!isSignedIn ? (
                                        <div className="grid gap-2">
                                            <SignInButton mode="redirect" fallbackRedirectUrl="/">
                                                <button type="button" className={signInButtonClass}>
                                                    Sign in
                                                </button>
                                            </SignInButton>
                                            <FlowButtonV1 onClick={handleSignUp} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-3">
                                            <UserButton />
                                            <div className="text-sm text-white/80">Account</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </>
            )}
        </header>
    );
};

export default Navbar;
