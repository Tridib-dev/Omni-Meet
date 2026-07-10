"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type AuthShellProps = {
  children: ReactNode;
  isSignUp?: boolean;
};

export default function AuthShell({ children, isSignUp = false }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-950 overflow-hidden">
      <div
        className={`lg:flex-1 relative h-[45vh] lg:h-auto overflow-hidden ${
          isSignUp ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/auth-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/40 lg:bg-gradient-to-r" />

        <div className="absolute inset-0 flex items-center justify-center lg:justify-start px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left max-w-lg"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Your Motto
            </h1>
            <p className="text-lg md:text-xl text-zinc-300">
              One powerful line about how your app helps users.
            </p>
          </motion.div>
        </div>
      </div>

      <div
        className={`flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-zinc-900/70 backdrop-blur-3xl border-l border-white/10 overflow-hidden relative order-2 ${
          isSignUp ? "lg:order-1" : "lg:order-2"
        } ${isSignUp ? "lg:rounded-r-3xl lg:rounded-tl-none" : "rounded-tl-3xl lg:rounded-l-3xl"}`}
      >
        <motion.div
          initial={{ opacity: 0, x: isSignUp ? -40 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-[440px] relative z-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
