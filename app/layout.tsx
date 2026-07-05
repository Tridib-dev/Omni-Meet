// app/layout.tsx 


import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Welcome to Dev Event",
  description: "The Hub For Every Dev Event That You Mustn't Miss !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen h-full antialiased">
        <ClerkProvider>
          <Toaster richColors position="top-center" />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}