"use client";
import { useState } from "react";
import { Heart, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/types";

interface StripProps { photos: Photo[]; onLike?: (id: string) => void; }
interface ViewerProps { photos: Photo[]; startIndex: number; onClose: () => void; onLike?: (id: string) => void; }

export function PhotoViewer({ photos, startIndex, onClose, onLike }: ViewerProps) {
    const [idx, setIdx] = useState(startIndex);
    const photo = photos[idx];
    if (!photo) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="Close">
                    <X size={20} />
                </button>
                <span className="text-sm font-medium">{idx + 1} / {photos.length}</span>
                <button onClick={() => onLike?.(photo.id)}
                    className={cn("w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10", photo.hasLiked && "text-red-400")}
                    aria-label="Like">
                    <Heart size={20} fill={photo.hasLiked ? "currentColor" : "none"} />
                </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center relative">
                <img src={photo.url} alt={photo.caption || ""} className="max-h-full max-w-full object-contain select-none" />
                {/* Prev/Next */}
                {idx > 0 && (
                    <button onClick={() => setIdx(i => i - 1)} className="absolute left-2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60">
                        <ChevronLeft size={20} />
                    </button>
                )}
                {idx < photos.length - 1 && (
                    <button onClick={() => setIdx(i => i + 1)} className="absolute right-2 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60">
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>

            {/* Caption */}
            {photo.caption && (
                <div className="px-5 py-4 text-white">
                    <p className="text-sm font-medium">{photo.caption}</p>
                    <p className="text-xs text-white/60 mt-1">{photo.likeCount} likes</p>
                </div>
            )}
        </div>
    );
}

export function PhotoStrip({ photos, onLike }: StripProps) {
    const [viewerIdx, setViewerIdx] = useState<number | null>(null);
    const published = photos.filter(p => p.isPublished);

    if (published.length === 0) return null;

    return (
        <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-4">
                {published.map((photo, i) => (
                    <button key={photo.id} onClick={() => setViewerIdx(i)}
                        className="shrink-0 relative rounded-2xl overflow-hidden shadow-card" style={{ width: 120, height: 120 }}>
                        <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                        {photo.likeCount > 0 && (
                            <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Heart size={8} fill="currentColor" /> {photo.likeCount}
                            </div>
                        )}
                    </button>
                ))}
            </div>
            {viewerIdx !== null && (
                <PhotoViewer photos={published} startIndex={viewerIdx} onClose={() => setViewerIdx(null)} onLike={onLike} />
            )}
        </>
    );
}
