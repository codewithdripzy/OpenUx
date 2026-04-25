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
  metadataBase: new URL("https://openux.dev"), // Replace with actual OpenUx domain if available
  title: {
    default: "OpenUx - Visual AI Workspace",
    template: "%s | OpenUx",
  },
  description: "Unlock your creativity with OpenUx, the open-source visual AI workspace where code meets conversation. Build workflows, UI designs, and prototypes instantly.",
  applicationName: "OpenUx",
  authors: [{ name: "OpenUx Team" }],
  creator: "OpenUx",
  publisher: "OpenUx",
  keywords: ["OpenUx", "AI", "Workspace", "Visual AI", "Code", "Conversation", "Generative UI", "Prototyping", "UX Design"],
  openGraph: {
    title: "OpenUx - Visual AI Workspace",
    description: "Unlock your creativity with OpenUx, the open-source visual AI workspace where code meets conversation.",
    url: "https://openux.dev",
    siteName: "OpenUx",
    type: "website",
    images: [
      {
        url: "https://opennextjs.vercel.app/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "OpenUx Visual Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenUx - Visual AI Workspace",
    description: "Unlock your creativity with OpenUx, the open-source visual AI workspace where code meets conversation.",
    images: ["https://opennextjs.vercel.app/opengraph-image.png"],
    creator: "@OpenUx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/hooks/use-toast";

// JSON-LD Structured Data for OpenUx
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://openux.dev/#website",
      url: "https://openux.dev",
      name: "OpenUx",
      description: "The open-source visual AI workspace where code meets conversation.",
      publisher: {
        "@type": "Organization",
        name: "OpenUx Team",
        logo: {
          "@type": "ImageObject",
          url: "https://openux.dev/logo.png"
        }
      }
    },
    {
      "@type": "SoftwareApplication",
      name: "OpenUx",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${googleSansMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        <ToastProvider>
          <SidebarProvider>
            {children}
            <Analytics />
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
