"use client";
import Image from "next/image";
import { useState } from "react";

const DEFAULT_FALLBACK = "https://placehold.co/80x80/0b0f13/444?text=Event";

export default function SafeImage({
    src,
    alt,
    fallback = DEFAULT_FALLBACK,
    ...props
}: {
    src: string;
    alt: string;
    fallback?: string;
} & Omit<React.ComponentProps<typeof Image>, "src" | "alt">) {
    // Initialize with fallback immediately if src is empty
    const [imgSrc, setImgSrc] = useState(
        src && src.trim() !== "" ? src : fallback
    );

    return (
        <Image
            {...props}
            src={imgSrc}
            alt={alt}
            onError={() => setImgSrc(fallback)}
        />
    );
}