/**
 * WebSocket hook for real-time events from the backend.
 * Reads JWT from localStorage and connects to /api/ws?token=...
 * Events: schedule_updated, points_updated, announcement_created, photo_published
 */
"use client";
import { useEffect, useRef, useCallback } from "react";

const WS_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000")
    .replace(/^http/, "ws");

type Handler = (data: any) => void;

export function useWebSocket(handlers: Record<string, Handler>) {
    const wsRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("camp_ops_jwt") : null;
        if (!token) return;

        const connect = () => {
            const ws = new WebSocket(`${WS_BASE}/api/ws?token=${token}`);
            wsRef.current = ws;

            ws.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(evt.data);
                    const handler = handlersRef.current[msg.type];
                    if (handler) handler(msg);
                } catch { }
            };

            ws.onclose = () => {
                // Reconnect after 3 seconds if not deliberate
                setTimeout(connect, 3000);
            };

            ws.onerror = () => ws.close();
        };

        connect();

        return () => {
            wsRef.current?.close();
        };
    }, []);
}
