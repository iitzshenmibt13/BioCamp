"use client";
/**
 * QR Check-in scanner page using html5-qrcode.
 */
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";
import toast from "react-hot-toast";

export default function CheckinScanPage() {
    const [result, setResult] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const scannerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const startScanner = async () => {
        setScanning(true);
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            async (decodedText: string) => {
                await scanner.stop();
                setScanning(false);
                setResult(decodedText);
                await handleCheckin(decodedText);
            },
            undefined
        ).catch(() => { setScanning(false); });
    };

    const handleCheckin = async (payload: string) => {
        const [checkpoint_id] = payload.split(":");
        try {
            const resp = await api.post("/api/checkin", { checkpoint_id, qr_payload: payload });
            const msg = resp.data.points_awarded ? `✅ Checked in! +${resp.data.points_awarded} pts` : "✅ Checked in!";
            setSuccess(msg);
            toast.success(msg);
        } catch (e: any) {
            const msg = e.response?.data?.detail || "Check-in failed";
            toast.error(msg === "Already checked in to this checkpoint" ? "Already checked in to this!" : msg);
        }
    };

    useEffect(() => () => { scannerRef.current?.stop().catch(() => { }); }, []);

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-gradient-to-br from-teal-600 to-cyan-500 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">📱 QR Check-in</h1>
                    <p className="text-teal-100 text-sm mt-1">Scan the checkpoint QR code</p>
                </div>

                <div className="p-4 space-y-4">
                    {success ? (
                        <div className="card p-8 text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <p className="font-bold text-xl text-gray-800">{success}</p>
                            <button onClick={() => { setSuccess(null); setResult(null); }} className="btn-primary mt-4">Scan Again</button>
                        </div>
                    ) : (
                        <div className="card p-4">
                            <div id="qr-reader" ref={containerRef} className="w-full rounded-xl overflow-hidden" />
                            {!scanning && (
                                <button onClick={startScanner} className="btn-primary w-full mt-4">
                                    📷 Start Camera Scan
                                </button>
                            )}
                            {scanning && <p className="text-center text-primary-600 mt-4 text-sm">Scanning… point camera at QR code</p>}
                        </div>
                    )}
                </div>
                <BottomNav active="me" />
            </div>
        </AuthGate>
    );
}
