"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Beat = { id: number; title: string; slug: string; bpm: number; key: string; mood: string[] | null; price: number; cover_url: string; is_sold: boolean };
type AssetKind = "preview" | "cover" | "mp3" | "wav" | "unlimited";
type AssetFiles = Record<AssetKind, File | null>;
type PreparedUpload = {
  uploadId: string;
  public: Record<"preview" | "cover", { path: string; token: string }>;
  private: Record<"mp3" | "wav" | "unlimited", { key: string; url: string }>;
};

const EMPTY_FILES: AssetFiles = { preview: null, cover: null, mp3: null, wav: null, unlimited: null };
const fileDescriptor = (file: File) => ({ name: file.name, size: file.size, type: file.type });
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Ocurrió un error inesperado.";

export default function AdminDashboard() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({ title: "", slug: "", bpm: "", key: "", mood: "", price: "" });
  const [files, setFiles] = useState<AssetFiles>(EMPTY_FILES);

  const accessToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return session.access_token;
  }, []);

  const adminRequest = useCallback(async (url: string, init: RequestInit = {}) => {
    const token = await accessToken();
    const response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
    });
    const result = await response.json() as { error?: string; beats?: Beat[] };
    if (!response.ok) throw new Error(result.error ?? "La operación falló.");
    return result;
  }, [accessToken]);

  const fetchBeats = useCallback(async () => {
    const result = await adminRequest("/api/admin/beats");
    setBeats(result.beats ?? []);
  }, [adminRequest]);

  useEffect(() => {
    async function initialize() {
      try {
        await fetchBeats();
        setCheckingAuth(false);
      } catch {
        await supabase.auth.signOut();
        router.replace("/admin");
      }
    }
    void initialize();
  }, [fetchBeats, router]);

  const generateSlug = (title: string) => title.toLowerCase().trim().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, "").replace(/ +/g, "-");

  const filteredBeats = useMemo(() => beats.filter((beat) =>
    beat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [beats, searchTerm]);

  const setFile = (kind: AssetKind, file: File | null) => setFiles((current) => ({ ...current, [kind]: file }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (Object.values(files).some((file) => !file)) {
      alert("Seleccioná los cinco archivos antes de publicar.");
      return;
    }
    setUploading(true);
    setProgress("Preparando subida segura...");
    let prepared: PreparedUpload | null = null;
    try {
      const token = await accessToken();
      const descriptors = Object.fromEntries(Object.entries(files).map(([kind, file]) => [kind, fileDescriptor(file!)]));
      const prepareResponse = await fetch("/api/admin/uploads/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files: descriptors }),
      });
      const prepareResult = await prepareResponse.json() as PreparedUpload & { error?: string };
      if (!prepareResponse.ok) throw new Error(prepareResult.error ?? "No pudimos preparar la subida.");
      prepared = prepareResult;

      setProgress("Subiendo portada, preview y archivos licenciados...");
      const [previewUpload, coverUpload, ...r2Responses] = await Promise.all([
        supabase.storage.from("beats-assets").uploadToSignedUrl(prepared.public.preview.path, prepared.public.preview.token, files.preview!, { contentType: files.preview!.type }),
        supabase.storage.from("beats-assets").uploadToSignedUrl(prepared.public.cover.path, prepared.public.cover.token, files.cover!, { contentType: files.cover!.type }),
        ...(["mp3", "wav", "unlimited"] as const).map((kind) => fetch(prepared!.private[kind].url, {
          method: "PUT",
          headers: { "Content-Type": files[kind]!.type },
          body: files[kind],
        })),
      ]);
      if (previewUpload.error) throw previewUpload.error;
      if (coverUpload.error) throw coverUpload.error;
      if (r2Responses.some((response) => !response.ok)) throw new Error("Falló una subida privada a R2.");

      setProgress("Verificando archivos y publicando beat...");
      const publishResponse = await fetch("/api/admin/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          uploadId: prepared.uploadId,
          title: formData.title,
          slug: formData.slug,
          bpm: Number(formData.bpm),
          musicalKey: formData.key,
          mood: formData.mood.split(",").map((value) => value.trim()).filter(Boolean),
          price: Number(formData.price),
          files: descriptors,
        }),
      });
      const publishResult = await publishResponse.json() as { error?: string };
      if (!publishResponse.ok) throw new Error(publishResult.error ?? "No pudimos publicar el beat.");

      await fetchBeats();
      setFormData({ title: "", slug: "", bpm: "", key: "", mood: "", price: "" });
      setFiles(EMPTY_FILES);
      form.reset();
      alert("¡Beat y archivos publicados correctamente!");
    } catch (error) {
      if (prepared) {
        try {
          const token = await accessToken();
          await fetch("/api/admin/uploads/prepare", {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ uploadId: prepared.uploadId, publicPaths: [prepared.public.preview.path, prepared.public.cover.path] }),
          });
        } catch (cleanupError) {
          console.error("Could not clean failed upload", cleanupError);
        }
      }
      alert(errorMessage(error));
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  const handleDelete = async () => {
    if (!selectedIds.length || !confirm(`¿Borrar permanentemente ${selectedIds.length} beat(s) y sus archivos?`)) return;
    setUploading(true);
    try {
      await adminRequest("/api/admin/beats", { method: "DELETE", body: JSON.stringify({ ids: selectedIds }) });
      setSelectedIds([]);
      await fetchBeats();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSold = async (event: React.MouseEvent, beat: Beat) => {
    event.stopPropagation();
    try {
      await adminRequest("/api/admin/beats", { method: "PATCH", body: JSON.stringify({ id: beat.id, isSold: !beat.is_sold }) });
      await fetchBeats();
    } catch (error) {
      alert(errorMessage(error));
    }
  };

  if (checkingAuth) return <div className="min-h-screen bg-black" />;

  const fileInput = (kind: AssetKind, label: string, accept: string, description: string) => (
    <label className="block rounded-2xl border border-dashed border-zinc-800 bg-black/50 p-4">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="mb-3 block text-[9px] text-zinc-600">{description}</span>
      <input type="file" required accept={accept} disabled={uploading} onChange={(event) => setFile(kind, event.target.files?.[0] ?? null)} className="w-full cursor-pointer text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:font-black file:text-white" />
    </label>
  );

  return (
    <div className="relative min-h-screen bg-black pt-30 text-white">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-10 lg:grid-cols-2">
        <section className="flex flex-col space-y-6">
          <header>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter md:text-4xl">Subida <span className="text-red-600">Total</span></h1>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Catálogo + Supabase + R2 privado</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl md:p-8">
            <div className="grid grid-cols-2 gap-4 text-left">
              <label className="col-span-2 text-[10px] font-bold uppercase text-zinc-500">Título
                <input required disabled={uploading} value={formData.title} onChange={(event) => { const title = event.target.value; setFormData((current) => ({ ...current, title, slug: generateSlug(title) })); }} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-base text-white outline-none focus:border-red-600" />
              </label>
              <label className="text-[10px] font-bold uppercase text-zinc-500">BPM
                <input type="number" min="40" max="300" required disabled={uploading} value={formData.bpm} onChange={(event) => setFormData({ ...formData, bpm: event.target.value })} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-base text-white outline-none focus:border-red-600" />
              </label>
              <label className="text-[10px] font-bold uppercase text-zinc-500">Tonalidad
                <input required disabled={uploading} value={formData.key} onChange={(event) => setFormData({ ...formData, key: event.target.value })} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-base text-white outline-none focus:border-red-600" />
              </label>
              <label className="text-[10px] font-bold uppercase text-zinc-500">Etiquetas
                <input required disabled={uploading} placeholder="rkt, fiesta, perreo" value={formData.mood} onChange={(event) => setFormData({ ...formData, mood: event.target.value })} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-base normal-case text-white outline-none focus:border-red-600" />
              </label>
              <label className="text-[10px] font-bold uppercase text-zinc-500">Precio base ARS
                <input type="number" min="1" step="1" required disabled={uploading} value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} className="mt-1 w-full rounded-xl border border-zinc-800 bg-black p-3 text-base text-white outline-none focus:border-red-600" />
              </label>
            </div>
            <div className="space-y-3 text-left">
              <h2 className="text-xs font-black uppercase tracking-widest">Archivos públicos</h2>
              {fileInput("preview", "Preview MP3", "audio/mpeg,.mp3", "Versión con marca de agua para el reproductor. Máximo 15 MB.")}
              {fileInput("cover", "Portada", "image/jpeg,image/png,image/webp", "JPG, PNG o WebP. Máximo 5 MB.")}
              <h2 className="pt-3 text-xs font-black uppercase tracking-widest">Entregables privados</h2>
              {fileInput("mp3", "Licencia MP3", "audio/mpeg,.mp3", "MP3 final sin marca de agua. Máximo 25 MB.")}
              {fileInput("wav", "Licencia WAV", "audio/wav,.wav", "WAV final. Máximo 150 MB.")}
              {fileInput("unlimited", "Licencia Unlimited", ".zip,application/zip,application/x-zip-compressed", "ZIP con stems y archivos completos. Máximo 1 GB.")}
            </div>
            {progress && <p className="text-center text-[10px] font-black uppercase tracking-widest text-red-500">{progress}</p>}
            <button disabled={uploading} className="w-full rounded-2xl bg-red-600 py-4 font-black uppercase tracking-widest transition-all hover:bg-red-500 disabled:opacity-50">{uploading ? "Procesando..." : "Publicar beat completo"}</button>
          </form>
        </section>

        <section className="mt-10 flex min-h-[500px] flex-col overflow-hidden lg:mt-0">
          <div className="mb-6 flex items-end justify-between">
            <div><h2 className="text-3xl font-black uppercase italic tracking-tighter">Gestor <span className="text-red-600">Pro</span></h2><p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{beats.length} beats en línea</p></div>
            {selectedIds.length > 0 && <button disabled={uploading} onClick={handleDelete} className="rounded-full bg-red-600 px-5 py-2.5 text-[10px] font-black uppercase disabled:opacity-50">Borrar ({selectedIds.length})</button>}
          </div>
          <input placeholder="BUSCAR BEAT..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="mb-4 w-full rounded-2xl border border-zinc-900 bg-zinc-950 p-4 text-[10px] font-black uppercase outline-none focus:border-red-600" />
          <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950 shadow-2xl">
            <div className="absolute inset-0 space-y-3 overflow-y-auto p-4">
              {filteredBeats.map((beat) => {
                const selected = selectedIds.includes(beat.id);
                return <div key={beat.id} onClick={() => setSelectedIds((current) => selected ? current.filter((id) => id !== beat.id) : [...current, beat.id])} className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${selected ? "border-red-600 bg-red-950/20" : "border-zinc-900 bg-black hover:border-zinc-700"}`}>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-red-600 bg-red-600" : "border-zinc-800"}`}>{selected && <div className="h-2 w-2 rounded-full bg-white" />}</div>
                  <img src={beat.cover_url} className="h-12 w-12 rounded-lg object-cover grayscale transition-all group-hover:grayscale-0" alt={`Portada de ${beat.title}`} />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-black uppercase italic">{beat.title}</p><p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{beat.bpm} BPM • ${beat.price}</p></div>
                  <button onClick={(event) => handleToggleSold(event, beat)} className={`rounded-lg border p-2 transition-colors ${beat.is_sold ? "border-red-600 bg-red-600 text-white" : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-white"}`} title={beat.is_sold ? "Marcar como disponible" : "Marcar como vendido"}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </button>
                </div>;
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
