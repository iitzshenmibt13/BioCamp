"use client";
/** Admin: Photo wall manager – upload, caption, publish/unpublish. */
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminPhotosPage() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [caption, setCaption] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const load = useCallback(async () => { const r = await api.get("/api/photos"); setPhotos(r.data); }, []);
    useEffect(() => { load(); }, [load]);

    const upload = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) { toast.error("Select a photo"); return; }
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        if (caption) form.append("caption", caption);
        try {
            await api.post("/api/photos", form, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Uploaded!"); setCaption(""); if (fileRef.current) fileRef.current.value = "";
            await load();
        } catch { toast.error("Upload failed"); }
        finally { setUploading(false); }
    };

    const toggle = async (id: string, current: boolean) => {
        await api.patch(`/api/photos/${id}`, undefined, { params: { is_published: !current } });
        toast.success(!current ? "Published!" : "Unpublished"); await load();
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">📸 Photo Wall Manager</h1>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 space-y-3">
                <p className="text-white font-semibold">Upload Photo</p>
                <input ref={fileRef} type="file" accept="image/*" className="text-sm text-gray-400" />
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full bg-gray-700 text-white border border-gray-600 rounded-xl px-3 py-2 text-sm" />
                <button onClick={upload} disabled={uploading} className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">{uploading ? "Uploading..." : "Upload"}</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map(p => (
                    <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <img src={p.url} alt={p.caption || ""} className="w-full aspect-square object-cover" />
                        <div className="p-2">
                            {p.caption && <p className="text-gray-300 text-xs mb-1 line-clamp-2">{p.caption}</p>}
                            <button onClick={() => toggle(p.id, p.is_published)}
                                className={`w-full py-1.5 rounded-lg text-xs font-semibold ${p.is_published ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"}`}>
                                {p.is_published ? "Unpublish" : "Publish"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
