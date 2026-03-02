import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
    title: "BioCamp Ops",
    description: "Biology Camp management system for campers and staff",
    manifest: "/manifest.json",
    appleWebApp: { capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
    themeColor: "#3B82F6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-TW">
            <head>
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
