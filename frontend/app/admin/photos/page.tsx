"use client";
import { useState, useRef } from "react";
import { Upload, Eye, EyeOff, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { MOCK_PHOTOS, MOCK_USER_ADMIN } from "@/lib/mock";
import type { Photo } from "@/lib/types";
import toast from "react-hot-toast";

export default function AdminPhotosPage() {
    const user = MOCK_USER_ADMIN;
    const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
    const [caption, setCaption] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    function upload() {
        if (!preview) { toast.error("Select a photo first."); return; }
        const newPhoto: Photo = {
            id: Date.now().toString(), url: preview, caption, isPublished: false,
            likeCount: 0, takenAt: new Date().toISOString(), uploadedByName: user.name,
        };
        setPhotos(p => [newPhoto, ...p]);
        setPreview(null); setCaption(""); if (fileRef.current) fileRef.current.value = "";
        toast.success("Photo uploaded!");
    }

    function togglePublish(id: string) {
        setPhotos(p => p.map(ph => ph.id === id ? { ...ph, isPublished: !ph.isPublished } : ph));
    }
    function remove(id: string) { setPhotos(p => p.filter(ph => ph.id !== id)); toast("Deleted", { icon: "🗑️" }); }

    return (
        <AdminShell user={user} title="Photo Manager">
            {/* Upload area */}
            <div className="card p-4 mb-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Upload Photo</p>
                <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary-soft/30 transition-colors mb-3">
                    {preview ? (
                        <img src={preview} className="w-32 h-32 object-cover rounded-xl" />
                    ) : (
                        <>
                            <Upload size={28} className="text-gray-300" />
                            <p className="text-sm text-gray-400">Tap to select photo</p>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="input text-sm mb-2" />
                <button onClick={upload} className="btn btn-primary text-sm w-full gap-2"><Upload size={14} /> Upload & Save</button>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map(ph => (
                    <div key={ph.id} className="card overflow-hidden">
                        <div className="relative">
                            <img src={ph.url} alt={ph.caption || ""} className="w-full h-32 object-cover" />
                            <div className="absolute top-1.5 right-1.5 flex gap-1">
                                <button onClick={() => togglePublish(ph.id)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-white ${ph.isPublished ? "bg-success" : "bg-gray-500"}`} title={ph.isPublished ? "Unpublish" : "Publish"}>
                                    {ph.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                                </button>
                                <button onClick={() => remove(ph.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-danger text-white" title="Delete">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 px-2 py-1.5 truncate">{ph.caption || "No caption"}</p>
                    </div>
                ))}
            </div>
        </AdminShell>
    );
}
