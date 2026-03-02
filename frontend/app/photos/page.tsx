"use client";
/** Photo wall – shows published photos with likes. */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/ws";
import BottomNav from "@/components/BottomNav";
import AuthGate from "@/components/AuthGate";
import toast from "react-hot-toast";

type Photo = { id: string; url: string; caption?: string; likes_count: number; liked_by_me: boolean; created_at: string };

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try { const r = await api.get("/api/photos"); setPhotos(r.data); }
        catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);
    useWebSocket({ photo_published: load });

    const toggleLike = async (photo: Photo) => {
        try {
            await api.post(`/api/photos/${photo.id}/like`);
            setPhotos(prev => prev.map(p => p.id === photo.id ? {
                ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1
            } : p));
        } catch { toast.error("Error"); }
    };

    return (
        <AuthGate>
            <div className="min-h-screen bg-gray-900 pb-20">
                <div className="bg-gradient-to-br from-purple-700 to-indigo-600 text-white px-4 pt-10 pb-6">
                    <h1 className="text-2xl font-bold">📸 Photo Wall</h1>
                </div>
                {loading ? (
                    <p className="text-center text-gray-400 py-12">Loading photos...</p>
                ) : photos.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No photos published yet.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-1 p-1">
                        {photos.map(p => (
                            <div key={p.id} className="relative group rounded-lg overflow-hidden bg-gray-800">
                                <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                    {p.caption && <p className="text-white text-xs line-clamp-2">{p.caption}</p>}
                                    <button onClick={() => toggleLike(p)} className="flex items-center gap-1 mt-1">
                                        <span>{p.liked_by_me ? "❤️" : "🤍"}</span>
                                        <span className="text-white text-xs">{p.likes_count}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <BottomNav active="me" />
            </div>
        </AuthGate>
    );
}
