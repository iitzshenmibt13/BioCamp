"use client";
import { useState, useRef, useEffect } from "react";
import { QrCode, Camera, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    onScan: (payload: string) => Promise<{ success: boolean; message: string; points?: number }>;
}

export function QRScannerView({ onScan }: Props) {
    const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [points, setPoints] = useState<number | undefined>();
    const scannerRef = useRef<any>(null);
    const mountedRef = useRef(false);

    async function startScanner() {
        setStatus("scanning");
        if (typeof window === "undefined") return;
        try {
            const { Html5QrcodeScanner } = await import("html5-qrcode");
            scannerRef.current = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
            scannerRef.current.render(handleScan, () => { });
        } catch {
            setStatus("error");
            setMessage("Camera not available");
        }
    }

    async function handleScan(decodedText: string) {
        if (status === "loading") return;
        setStatus("loading");
        scannerRef.current?.clear?.().catch(() => { });
        const result = await onScan(decodedText);
        setStatus(result.success ? "success" : "error");
        setMessage(result.message);
        setPoints(result.points);
    }

    function reset() {
        setStatus("idle");
        setMessage("");
        setPoints(undefined);
        document.getElementById("qr-reader")?.innerHTML && (document.getElementById("qr-reader")!.innerHTML = "");
    }

    // Dev simulate
    async function simulate() {
        const result = await onScan("camp:checkin:cp1:abc123");
        setStatus(result.success ? "success" : "error");
        setMessage(result.message);
        setPoints(result.points);
    }

    return (
        <div className="flex flex-col items-center py-8 gap-6">
            {status === "idle" && (
                <>
                    <div className="w-24 h-24 bg-primary-soft rounded-3xl flex items-center justify-center">
                        <QrCode size={48} className="text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-gray-900">Ready to Scan</p>
                        <p className="text-sm text-gray-500 mt-1">Point your camera at a QR code</p>
                    </div>
                    <button onClick={startScanner} className="btn btn-primary gap-2 px-8">
                        <Camera size={18} /> Open Camera
                    </button>
                    {process.env.NODE_ENV === "development" && (
                        <button onClick={simulate} className="btn btn-ghost text-xs">🧪 Simulate Scan (Dev)</button>
                    )}
                </>
            )}

            {status === "scanning" && (
                <div className="w-full max-w-xs">
                    <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
                    <button onClick={reset} className="btn btn-ghost w-full mt-3">Cancel</button>
                </div>
            )}

            {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="text-sm text-gray-600">Verifying…</p>
                </div>
            )}

            {(status === "success" || status === "error") && (
                <div className={cn("flex flex-col items-center gap-4 text-center",
                    status === "success" ? "text-success" : "text-danger")}>
                    {status === "success"
                        ? <CheckCircle2 size={56} strokeWidth={1.5} />
                        : <XCircle size={56} strokeWidth={1.5} />}
                    <div>
                        <p className="text-lg font-bold">{status === "success" ? "Check-in Success!" : "Check-in Failed"}</p>
                        <p className="text-sm text-gray-600 mt-1">{message}</p>
                        {points !== undefined && status === "success" && (
                            <p className="text-base font-bold text-success mt-2">+{points} points 🎉</p>
                        )}
                    </div>
                    <button onClick={reset} className="btn btn-primary">Scan Another</button>
                </div>
            )}
        </div>
    );
}
