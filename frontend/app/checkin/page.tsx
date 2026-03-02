"use client";
import { CamperLayout } from "@/components/CamperLayout";
import { QRScannerView } from "@/components/QRScannerView";
import { MOCK_USER_CAMPER } from "@/lib/mock";
import { QrCode } from "lucide-react";

export default function CheckinPage() {
    const user = MOCK_USER_CAMPER;

    async function handleScan(payload: string) {
        await new Promise(r => setTimeout(r, 800));
        if (payload.startsWith("camp:checkin:")) {
            return { success: true, message: "DNA Extraction Lab check-in recorded!", points: 10 };
        }
        if (payload.includes("duplicate")) {
            return { success: false, message: "You already checked in to this checkpoint." };
        }
        return { success: false, message: "Invalid or expired QR code." };
    }

    return (
        <CamperLayout title="QR Check-in" user={user}>
            <div className="card p-4">
                <div className="flex items-center gap-2 mb-1">
                    <QrCode size={18} className="text-primary" />
                    <p className="text-sm font-bold text-gray-900">Scan a Checkpoint</p>
                </div>
                <p className="text-xs text-gray-500">Point your camera at the QR code at the activity location to check in and earn points.</p>
            </div>
            <div className="card">
                <QRScannerView onScan={handleScan} />
            </div>
        </CamperLayout>
    );
}
