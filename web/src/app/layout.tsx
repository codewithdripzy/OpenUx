import "./globals.css";
import type { Metadata } from "next";
import { Google_Sans, Google_Sans_Code } from "next/font/google";
import { SidebarProvider } from "@/providers/SidebarProvider";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

const googleSansMono = Google_Sans_Code({
  variable: "--font-google-sans-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenUx",
    template: "%s | OpenUx",
  },
  description: "Unlock your creativity with OpenUx, the open-source visual AI workspace where code meets conversation.",
  openGraph: {
    title: "OpenUx",
    description: "Unlock your creativity with OpenUx, the open-source visual AI workspace where code meets conversation.",
    images: [
      {
        url: "https://opennextjs.vercel.app/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "OpenUx",
      },
    ],
  },
};


import { ToastProvider } from "@/hooks/use-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${googleSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <ToastProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
