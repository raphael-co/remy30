"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    AlertTriangle,
    CheckCircle,
    Eye,
    GripVertical,
    Image as ImageIcon,
    Loader2,
    LogOut,
    RefreshCw,
    Save,
    Sun,
    Moon,
    Trash2,
    Upload,
    X,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

type ProductPayload = {
    title: string;
    subtitle?: string | null;
    description: string;
    heroImageUrl?: string | null;
    gallery: string[];
};

type PresignResponse = {
    uploadUrl: string;
    publicUrl: string;
    key: string;
};

async function presignForR2(
    file: File,
    folder: "hero" | "gallery" | "uploads"
): Promise<PresignResponse> {
    const res = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contentType: file.type,
            size: file.size,
            folder,
        }),
    });

    if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "Presign failed");
    }

    const j = (await res.json()) as PresignResponse;
    if (!j?.uploadUrl || !j?.publicUrl) throw new Error("Presign invalid response");
    return j;
}

async function uploadOneToR2(file: File, folder: "hero" | "gallery"): Promise<string> {
    const { uploadUrl, publicUrl } = await presignForR2(file, folder);

    const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!put.ok) throw new Error("R2 upload failed");
    return publicUrl;
}

async function uploadManyToR2(files: File[], folder: "gallery", concurrency = 5): Promise<string[]> {
    const results: string[] = new Array(files.length);
    let i = 0;

    async function worker() {
        while (i < files.length) {
            const idx = i++;
            results[idx] = await uploadOneToR2(files[idx], folder);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

async function deleteFromR2(publicUrl: string) {
    const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: publicUrl }),
    });

    if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.error ?? "R2 delete failed");
    }
}

/** Crop helpers */
type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (e) => reject(e));
        img.setAttribute("crossOrigin", "anonymous");
        img.src = url;
    });
}

async function getCroppedBlob(imageSrc: string, crop: Area, mime: string): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    canvas.width = Math.round(crop.width);
    canvas.height = Math.round(crop.height);

    ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
            mime || "image/jpeg",
            0.92
        );
    });
}

/** Sortable gallery item */
function SortableGalleryItem({
    id,
    url,
    index,
    onRemove,
}: {
    id: string;
    url: string;
    index: number;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="galleryCard">
            <div className="galleryMedia" style={{ display: "flex", flex: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`gallery-${index}`} className="galleryImg" />
            </div>

            <div className="galleryMeta">
                <div className="row" style={{ justifyContent: "space-between" }}>
                    <span className="badge">#{index + 1}</span>

                    <div className="row" style={{ gap: 8 }}>
                        <button className="iconBtn" type="button" {...attributes} {...listeners} aria-label="Drag">
                            <GripVertical size={16} />
                        </button>

                        <button className="iconBtn danger" type="button" onClick={onRemove} aria-label="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [data, setData] = useState<ProductPayload | null>(null);
    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    const [err, setErr] = useState<string | null>(null);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    /** Dark mode */
    const [theme, setTheme] = useState<"light" | "dark">("light");

    /** Preview */
    const [previewKey, setPreviewKey] = useState(0);
    const previewUrl = useMemo(() => `/?adminPreview=1&k=${previewKey}`, [previewKey]);

    /** DnD sensors */
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /** Hero crop modal */
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [cropMime, setCropMime] = useState<string>("image/jpeg");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const cropFileNameRef = useRef<string>("hero.jpg");

    const avgGalleryCount = useMemo(() => data?.gallery?.length ?? 0, [data]);

    async function load() {
        setLoading(true);
        setErr(null);
        setOkMsg(null);
        try {
            const res = await fetch("/api/product", { cache: "no-store" });
            if (!res.ok) throw new Error("Impossible de charger le produit");
            const p = (await res.json()) as ProductPayload;
            setData(p);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // theme init
        const saved = (localStorage.getItem("adminTheme") as "light" | "dark" | null) ?? "light";
        setTheme(saved);
        document.documentElement.dataset.theme = saved;

        load();
    }, []);

    function toggleTheme() {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("adminTheme", next);
        document.documentElement.dataset.theme = next;
    }

    async function createProduct() {
        setCreating(true);
        setErr(null);
        setOkMsg(null);
        try {
            const res = await fetch("/api/product", { method: "POST" });
            if (!res.ok && res.status !== 409) {
                const j = await res.json().catch(() => null);
                throw new Error(j?.error ?? "Création impossible");
            }
            setOkMsg(res.status === 409 ? "Produit déjà existant ✅" : "Produit créé ✅");
            await load();
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setCreating(false);
        }
    }

    async function save() {
        if (!data) return;
        setSaving(true);
        setErr(null);
        setOkMsg(null);
        try {
            const res = await fetch("/api/product", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const j = await res.json().catch(() => null);
                throw new Error(j?.error ?? "Sauvegarde impossible");
            }
            setOkMsg("Sauvegardé ✅");
            // refresh preview (optional)
            setPreviewKey((k) => k + 1);
            await load();
        } catch (e: any) {
            setErr(e?.message ?? "Erreur");
        } finally {
            setSaving(false);
        }
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        location.href = "/login";
    }

    /** HERO: open crop modal */
    async function onHeroFile(file: File | null) {
        if (!file || !data) return;

        // open crop modal instead of direct upload
        setErr(null);
        setOkMsg(null);

        const objectUrl = URL.createObjectURL(file);
        cropFileNameRef.current = file.name || "hero.jpg";
        setCropMime(file.type || "image/jpeg");
        setCropSrc(objectUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setCropOpen(true);
    }

    /** HERO: confirm crop -> upload cropped result -> update state */
    async function confirmCropUpload() {
        if (!data || !cropSrc || !croppedAreaPixels) return;

        setUploadingHero(true);
        setErr(null);
        setOkMsg(null);

        try {
            const blob = await getCroppedBlob(cropSrc, croppedAreaPixels, cropMime);
            const ext = cropMime.includes("png") ? "png" : cropMime.includes("webp") ? "webp" : "jpg";
            const file = new File([blob], `hero-cropped.${ext}`, { type: cropMime || "image/jpeg" });

            const url = await uploadOneToR2(file, "hero");
            setData({ ...data, heroImageUrl: url });
            setOkMsg("Hero recadré + uploadé sur R2 ✅");
            setCropOpen(false);
            setPreviewKey((k) => k + 1);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur crop/upload");
        } finally {
            setUploadingHero(false);
            try {
                if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
            } catch { }
            setCropSrc(null);
        }
    }

    async function removeHero() {
        if (!data?.heroImageUrl) return;
        setErr(null);
        setOkMsg(null);

        try {
            await deleteFromR2(data.heroImageUrl);
            setData({ ...data, heroImageUrl: null });
            setOkMsg("Hero supprimé de R2 ✅");
            setPreviewKey((k) => k + 1);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur suppression");
        }
    }

    async function onGalleryFiles(files: FileList | null) {
        if (!data || !files || files.length === 0) return;
        setUploadingGallery(true);
        setErr(null);
        setOkMsg(null);

        try {
            const arr = Array.from(files);
            const urls = await uploadManyToR2(arr, "gallery", 5);

            // IMPORTANT: ids stables pour le DnD => on garde les URL comme IDs (unique)
            setData({ ...data, gallery: [...(data.gallery ?? []), ...urls] });
            setOkMsg(`${urls.length} image(s) ajoutée(s) sur R2 ✅`);
            setPreviewKey((k) => k + 1);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur upload");
        } finally {
            setUploadingGallery(false);
        }
    }

    async function removeGalleryByUrl(url: string) {
        if (!data) return;

        setErr(null);
        setOkMsg(null);

        try {
            await deleteFromR2(url);
            const next = data.gallery.filter((x) => x !== url);
            setData({ ...data, gallery: next });
            setOkMsg("Image supprimée de R2 ✅");
            setPreviewKey((k) => k + 1);
        } catch (e: any) {
            setErr(e?.message ?? "Erreur suppression");
        }
    }

    function onDragEnd(e: DragEndEvent) {
        if (!data) return;
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = data.gallery.indexOf(String(active.id));
        const newIndex = data.gallery.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;

        const next = arrayMove(data.gallery, oldIndex, newIndex);
        setData({ ...data, gallery: next });
        setOkMsg("Ordre de la galerie mis à jour (pense à sauvegarder) ✅");
    }

    if (loading) {
        return (
            <div className="container">
                <div className="card card-pad row" style={{ justifyContent: "center", gap: 10 }}>
                    <Loader2 className="spin" size={18} />
                    Chargement…
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container">
                <div className="card card-pad">
                    <div className="grid">
                        <div>Produit introuvable.</div>
                        {err ? <div className="err">{err}</div> : null}

                        <div className="row" style={{ justifyContent: "flex-end" }}>
                            <button className="btn btn-ghost" onClick={load}>
                                <RefreshCw size={16} />
                                Recharger
                            </button>
                            <button className="btn" onClick={createProduct} disabled={creating}>
                                {creating ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                                {creating ? "Création…" : "Créer le produit"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /** Layout: left editor + right preview */
    return (
        <div className="">
            {/* LEFT */}
            <div className="adminLeft">
                <div className="container" style={{ maxWidth: "unset" }}>
                    <div className="grid">
                        {/* Top bar */}
                        <div className="spread">
                            <div className="grid" style={{ gap: 6 }}>
                                <h1 className="h1">Admin</h1>
                                <div className="badge">
                                    <ImageIcon size={16} />
                                    Galerie: {avgGalleryCount} image(s)
                                </div>
                            </div>

                            <div className="row">
                                <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle theme">
                                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                                    {theme === "light" ? "Dark" : "Light"}
                                </button>

                                <button className="btn btn-ghost" onClick={createProduct} disabled={creating}>
                                    {creating ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                                    {creating ? "Création…" : "Créer le produit"}
                                </button>

                                <a className="btn btn-ghost" href="/" style={{ textDecoration: "none" }}>
                                    <Eye size={16} />
                                    Voir le site
                                </a>

                                <button className="btn btn-ghost" onClick={logout}>
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {(err || okMsg) ? (
                            <div className="card card-pad">
                                {err ? (
                                    <div className="row" style={{ gap: 10 }}>
                                        <AlertTriangle size={18} />
                                        <div className="err">{err}</div>
                                    </div>
                                ) : null}
                                {okMsg ? (
                                    <div className="row" style={{ gap: 10, color: "var(--muted)" }}>
                                        <CheckCircle size={18} />
                                        <div>{okMsg}</div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {/* Content */}
                        <div className="card card-pad">
                            <div className="grid">
                                <div className="spread">
                                    <h2 className="h2">Contenu</h2>
                                    <button className="btn" onClick={save} disabled={saving}>
                                        {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                                        {saving ? "Sauvegarde…" : "Sauvegarder"}
                                    </button>
                                </div>

                                <label className="label">
                                    Titre
                                    <input
                                        className="input"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                        maxLength={120}
                                    />
                                </label>

                                <label className="label">
                                    Sous-titre
                                    <input
                                        className="input"
                                        value={data.subtitle ?? ""}
                                        onChange={(e) => setData({ ...data, subtitle: e.target.value || null })}
                                        maxLength={200}
                                    />
                                </label>

                                <label className="label">
                                    Description
                                    <textarea
                                        className="textarea"
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        rows={7}
                                        maxLength={5000}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Hero */}
                        <div className="card card-pad">
                            <div className="grid">
                                <div className="spread">
                                    <h2 className="h2">Hero image</h2>
                                    <span className="badge">
                                        <ImageIcon size={16} />
                                        16:9 (recadrage)
                                    </span>
                                </div>

                                {data.heroImageUrl ? (
                                    <div className="card" style={{ overflow: "hidden" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={data.heroImageUrl}
                                            alt="hero"
                                            style={{ width: "100%", height: 320, objectFit: "contain", display: "block" }}
                                        />
                                    </div>
                                ) : (
                                    <div className="emptyHero">
                                        <ImageIcon size={26} />
                                        Aucune image hero
                                    </div>
                                )}

                                <div className="row">
                                    <label className="btn btn-ghost" style={{ cursor: uploadingHero ? "not-allowed" : "pointer" }}>
                                        <Upload size={16} />
                                        {uploadingHero ? "Upload…" : "Uploader + recadrer (R2)"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            disabled={uploadingHero}
                                            onChange={(e) => onHeroFile(e.target.files?.[0] ?? null)}
                                        />
                                    </label>

                                    {data.heroImageUrl ? (
                                        <button className="btn btn-ghost" onClick={removeHero} disabled={uploadingHero}>
                                            <Trash2 size={16} />
                                            Retirer (supprime R2)
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Galerie DnD */}
                        <div className="card card-pad">
                            <div className="grid">
                                <div className="spread">
                                    <h2 className="h2">Galerie (drag & drop)</h2>

                                    <label className="btn btn-ghost" style={{ cursor: uploadingGallery ? "not-allowed" : "pointer" }}>
                                        <Upload size={16} />
                                        {uploadingGallery ? "Upload…" : "Ajouter des images (R2)"}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            hidden
                                            disabled={uploadingGallery}
                                            onChange={(e) => onGalleryFiles(e.target.files)}
                                        />
                                    </label>
                                </div>

                                {data.gallery.length === 0 ? (
                                    <div className="badge">Aucune image</div>
                                ) : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                        <SortableContext items={data.gallery} strategy={rectSortingStrategy}>
                                            <div className="galleryGrid">
                                                {data.gallery.map((url, idx) => (
                                                    <SortableGalleryItem
                                                        key={url}
                                                        id={url}
                                                        url={url}
                                                        index={idx}
                                                        onRemove={() => removeGalleryByUrl(url)}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                )}

                                <hr className="hr" />

                                <div className="row" style={{ justifyContent: "flex-end" }}>
                                    <button className="btn" onClick={save} disabled={saving}>
                                        {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                                        {saving ? "Sauvegarde…" : "Sauvegarder"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="badge" style={{ justifyContent: "center" }}>
                            Upload R2 via presigned URL • Suppression R2 via DELETE /api/upload • Preview live à droite
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PREVIEW */}
            {/* <aside className="adminRight">
        <div className="previewHead">
          <div className="row" style={{ gap: 10 }}>
            <Eye size={16} />
            <strong style={{ fontSize: 14 }}>Preview live</strong>
            <span className="badge">/</span>
          </div>

          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setPreviewKey((k) => k + 1)}>
              <RefreshCw size={16} />
              Reload
            </button>
            <a className="btn btn-ghost" href={previewUrl} target="_blank" rel="noreferrer">
              <Eye size={16} />
              Ouvrir
            </a>
          </div>
        </div>

        <div className="previewFrameWrap">
          <iframe className="previewFrame" src={previewUrl} />
        </div>
      </aside> */}

            {/* CROP MODAL */}
            {cropOpen && cropSrc ? (
                <div className="modalOverlay" role="dialog" aria-modal="true">
                    <div className="modalCard">
                        <div className="modalHead">
                            <div className="row" style={{ gap: 10 }}>
                                <ImageIcon size={18} />
                                <strong>Recadrer l’image Hero</strong>
                                <span className="badge">16:9</span>
                            </div>
                            <button
                                className="iconBtn"
                                type="button"
                                onClick={() => {
                                    setCropOpen(false);
                                    try {
                                        if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
                                    } catch { }
                                    setCropSrc(null);
                                }}
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="cropArea">
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, areaPx) => setCroppedAreaPixels(areaPx as Area)}
                            />
                        </div>

                        <div className="modalFoot">
                            <div className="row" style={{ gap: 10 }}>
                                <button className="btn btn-ghost" type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}>
                                    <ZoomOut size={16} />
                                </button>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.01}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="range"
                                />
                                <button className="btn btn-ghost" type="button" onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>
                                    <ZoomIn size={16} />
                                </button>
                            </div>

                            <div className="row">
                                <button
                                    className="btn btn-ghost"
                                    type="button"
                                    onClick={() => {
                                        setCropOpen(false);
                                        try {
                                            if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
                                        } catch { }
                                        setCropSrc(null);
                                    }}
                                    disabled={uploadingHero}
                                >
                                    Annuler
                                </button>

                                <button className="btn" type="button" onClick={confirmCropUpload} disabled={uploadingHero}>
                                    {uploadingHero ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                                    {uploadingHero ? "Upload…" : "Recadrer + uploader"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
