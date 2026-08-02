/* eslint-disable @next/next/no-img-element */
"use client";

import { upload } from "@vercel/blob/client";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clapperboard,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileAudio,
  FileImage,
  FileVideo,
  LogOut,
  MonitorPlay,
  Music2,
  Plus,
  Save,
  Settings2,
  Trash2,
  UploadCloud,
  Volume2
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PLAYLIST } from "@/lib/default-playlist";
import type { MediaKind, SignageItem, SignagePlaylist, SlideTheme, TransitionName } from "@/lib/types";

const transitionOptions: TransitionName[] = ["fade", "slide", "zoom", "wipe", "none"];
const themeOptions: SlideTheme[] = ["brand", "offer", "services", "fresh", "dark"];

function newItem(kind: MediaKind = "slide"): SignageItem {
  return {
    id: crypto.randomUUID(),
    kind,
    eyebrow: kind === "slide" ? "Nuevo anuncio" : undefined,
    title: kind === "video" ? "Nuevo video" : kind === "image" ? "Nueva imagen" : "Título del anuncio",
    subtitle: kind === "slide" ? "Escribe aquí el mensaje que verán tus clientes." : undefined,
    durationSeconds: kind === "video" ? 20 : 8,
    transition: "fade",
    theme: "brand",
    enabled: true,
    muted: false,
    fit: "cover"
  };
}

function downloadJson(playlist: SignagePlaylist) {
  const blob = new Blob([JSON.stringify(playlist, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `barrio-max-tv-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const [playlist, setPlaylist] = useState<SignagePlaylist>(DEFAULT_PLAYLIST);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_PLAYLIST.items[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => playlist.items.find((item) => item.id === selectedId) || playlist.items[0],
    [playlist.items, selectedId]
  );

  useEffect(() => {
    fetch("/api/playlist", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setPlaylist(data.playlist || DEFAULT_PLAYLIST);
        setSelectedId((data.playlist?.items?.[0] || DEFAULT_PLAYLIST.items[0]).id);
      })
      .catch(() => setError("No se pudo cargar la programación."))
      .finally(() => setLoading(false));
  }, []);

  function updateSettings(patch: Partial<SignagePlaylist["settings"]>) {
    setPlaylist((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }

  function updateSelected(patch: Partial<SignageItem>) {
    setPlaylist((current) => ({
      ...current,
      items: current.items.map((item) => item.id === selectedId ? { ...item, ...patch } : item)
    }));
  }

  function add(kind: MediaKind) {
    const item = newItem(kind);
    setPlaylist((current) => ({ ...current, items: [...current.items, item] }));
    setSelectedId(item.id);
  }

  function remove(id: string) {
    if (!window.confirm("¿Eliminar este contenido de la programación?")) return;
    setPlaylist((current) => {
      const items = current.items.filter((item) => item.id !== id);
      setSelectedId(items[0]?.id || "");
      return { ...current, items };
    });
  }

  function duplicate(item: SignageItem) {
    const clone = { ...item, id: crypto.randomUUID(), title: `${item.title} (copia)` };
    setPlaylist((current) => ({ ...current, items: [...current.items, clone] }));
    setSelectedId(clone.id);
  }

  function move(id: string, direction: -1 | 1) {
    setPlaylist((current) => {
      const items = [...current.items];
      const position = items.findIndex((item) => item.id === id);
      const target = position + direction;
      if (position < 0 || target < 0 || target >= items.length) return current;
      [items[position], items[target]] = [items[target], items[position]];
      return { ...current, items };
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/playlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playlist)
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "No se pudo publicar.");
      return;
    }
    setPlaylist(data.playlist);
    setMessage("Programación publicada. La TV se actualizará automáticamente.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadProgress(0);
    setError("");
    setMessage("");
    try {
      const result = await upload(`barrio-max-tv/media/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: file.size > 100 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage))
      });

      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const isAudio = file.type.startsWith("audio/");

      if (isAudio) {
        updateSettings({ backgroundMusicUrl: result.url });
        setMessage("Audio cargado como música de fondo. Guarda para publicarlo.");
      } else {
        const item = newItem(isVideo ? "video" : isImage ? "image" : "slide");
        item.src = result.url;
        item.title = file.name.replace(/\.[^.]+$/, "");
        item.durationSeconds = isVideo ? 30 : 8;
        setPlaylist((current) => ({ ...current, items: [...current.items, item] }));
        setSelectedId(item.id);
        setMessage("Archivo cargado. Ajusta el anuncio y guarda la programación.");
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el archivo.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SignagePlaylist;
        if (!parsed.items || !parsed.settings) throw new Error("Archivo inválido");
        setPlaylist(parsed);
        setSelectedId(parsed.items[0]?.id || "");
        setMessage("Programación importada. Revisa y guarda para publicarla.");
      } catch {
        setError("El archivo JSON no es una programación válida.");
      }
    };
    reader.readAsText(file);
  }

  if (loading) return <main className="admin-loading">Cargando Barrio MAX TV…</main>;

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div className="admin-brand"><MonitorPlay /><span>BARRIO <b>MAX</b> TV</span><small>Centro de contenido</small></div>
        <div className="admin-actions">
          <a href="/tv" target="_blank"><Eye /> Ver TV</a>
          <button onClick={() => downloadJson(playlist)}><Download /> Exportar</button>
          <button onClick={() => jsonRef.current?.click()}><UploadCloud /> Importar</button>
          <input ref={jsonRef} hidden type="file" accept="application/json" onChange={importJson} />
          <button onClick={logout}><LogOut /> Salir</button>
          <button className="publish-button" disabled={saving} onClick={save}><Save /> {saving ? "Publicando…" : "Publicar cambios"}</button>
        </div>
      </header>

      {(message || error) && <div className={`admin-notice ${error ? "error" : "ok"}`}>{error || message}</div>}

      <section className="admin-settings">
        <div className="section-heading"><Settings2 /><div><h2>Datos y audio general</h2><p>Se muestran en todas las pantallas.</p></div></div>
        <div className="settings-grid">
          <label><span>Nombre</span><input value={playlist.settings.businessName} onChange={(e) => updateSettings({ businessName: e.target.value })} /></label>
          <label><span>Eslogan</span><input value={playlist.settings.slogan} onChange={(e) => updateSettings({ slogan: e.target.value })} /></label>
          <label><span>Ubicación</span><input value={playlist.settings.location} onChange={(e) => updateSettings({ location: e.target.value })} /></label>
          <label><span>WhatsApp</span><input value={playlist.settings.phone} onChange={(e) => updateSettings({ phone: e.target.value })} /></label>
          <label><span>Horario</span><input value={playlist.settings.hours} onChange={(e) => updateSettings({ hours: e.target.value })} /></label>
          <label><span>Actualizar TV cada</span><input type="number" min="10" value={playlist.settings.autoRefreshSeconds} onChange={(e) => updateSettings({ autoRefreshSeconds: Number(e.target.value) || 30 })} /><small>segundos</small></label>
          <label className="wide"><span>Música de fondo (URL)</span><div className="url-field"><Music2 /><input value={playlist.settings.backgroundMusicUrl || ""} onChange={(e) => updateSettings({ backgroundMusicUrl: e.target.value })} placeholder="Sube un audio o pega una URL" /></div></label>
          <label><span>Volumen música</span><input type="range" min="0" max="1" step="0.05" value={playlist.settings.backgroundMusicVolume} onChange={(e) => updateSettings({ backgroundMusicVolume: Number(e.target.value) })} /><small>{Math.round(playlist.settings.backgroundMusicVolume * 100)}%</small></label>
        </div>
      </section>

      <section className="admin-workspace">
        <aside className="playlist-panel">
          <div className="section-heading"><Clapperboard /><div><h2>Programación</h2><p>{playlist.items.length} contenidos</p></div></div>
          <div className="add-buttons">
            <button onClick={() => add("slide")}><Plus /> Anuncio</button>
            <button onClick={() => add("image")}><FileImage /> Imagen</button>
            <button onClick={() => add("video")}><FileVideo /> Video</button>
          </div>
          <button className="upload-button" onClick={() => fileRef.current?.click()} disabled={uploading}><UploadCloud /> {uploading ? `Subiendo ${uploadProgress}%` : "Subir video, imagen o audio"}</button>
          <input ref={fileRef} hidden type="file" accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/wav" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />

          <div className="playlist-items">
            {playlist.items.map((item, position) => (
              <article key={item.id} className={item.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(item.id)}>
                <span className={`kind kind-${item.kind}`}>{item.kind === "video" ? <FileVideo /> : item.kind === "image" ? <FileImage /> : <MonitorPlay />}</span>
                <div><strong>{item.title || "Sin título"}</strong><small>{item.durationSeconds}s · {item.transition} · {item.enabled ? "activo" : "oculto"}</small></div>
                <nav>
                  <button onClick={(e) => { e.stopPropagation(); move(item.id, -1); }} disabled={position === 0}><ArrowUp /></button>
                  <button onClick={(e) => { e.stopPropagation(); move(item.id, 1); }} disabled={position === playlist.items.length - 1}><ArrowDown /></button>
                </nav>
              </article>
            ))}
          </div>
        </aside>

        <section className="editor-panel">
          {selected ? (
            <>
              <div className="editor-title">
                <div><span>EDITANDO</span><h2>{selected.title || "Contenido sin título"}</h2></div>
                <nav>
                  <button onClick={() => duplicate(selected)}><Copy /> Duplicar</button>
                  <button className="danger" onClick={() => remove(selected.id)}><Trash2 /> Eliminar</button>
                </nav>
              </div>

              <div className="editor-grid">
                <label><span>Tipo</span><select value={selected.kind} onChange={(e) => updateSelected({ kind: e.target.value as MediaKind })}><option value="slide">Anuncio diseñado</option><option value="image">Imagen</option><option value="video">Video</option></select></label>
                <label><span>Duración máxima</span><input type="number" min="2" value={selected.durationSeconds} onChange={(e) => updateSelected({ durationSeconds: Number(e.target.value) || 8 })} /><small>segundos</small></label>
                <label><span>Transición</span><select value={selected.transition} onChange={(e) => updateSelected({ transition: e.target.value as TransitionName })}>{transitionOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label><span>Estilo</span><select value={selected.theme || "brand"} onChange={(e) => updateSelected({ theme: e.target.value as SlideTheme })}>{themeOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="wide"><span>Título</span><input value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} /></label>
                <label className="wide"><span>Texto secundario</span><textarea value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })} /></label>
                <label><span>Texto pequeño superior</span><input value={selected.eyebrow || ""} onChange={(e) => updateSelected({ eyebrow: e.target.value })} /></label>
                <label><span>Sello / etiqueta</span><input value={selected.badge || ""} onChange={(e) => updateSelected({ badge: e.target.value })} /></label>
                <label><span>Precio destacado</span><input value={selected.price || ""} onChange={(e) => updateSelected({ price: e.target.value })} placeholder="$0,00" /></label>
                <label><span>Llamado a la acción</span><input value={selected.callToAction || ""} onChange={(e) => updateSelected({ callToAction: e.target.value })} placeholder="Pide al 099…" /></label>
                <label className="wide"><span>URL del video o imagen</span><div className="url-field"><ExternalLink /><input value={selected.src || ""} onChange={(e) => updateSelected({ src: e.target.value })} /></div></label>
                <label className="wide"><span>Voz en off / audio de este anuncio</span><div className="url-field"><Volume2 /><input value={selected.voiceoverUrl || ""} onChange={(e) => updateSelected({ voiceoverUrl: e.target.value })} placeholder="Sube el audio y pega su URL" /></div></label>
                <label><span>Ajuste visual</span><select value={selected.fit || "cover"} onChange={(e) => updateSelected({ fit: e.target.value as "cover" | "contain" })}><option value="cover">Llenar pantalla</option><option value="contain">Mostrar completo</option></select></label>
                <label className="toggle-label"><input type="checkbox" checked={selected.enabled} onChange={(e) => updateSelected({ enabled: e.target.checked })} /><span>Mostrar en TV</span></label>
                <label className="toggle-label"><input type="checkbox" checked={Boolean(selected.muted)} onChange={(e) => updateSelected({ muted: e.target.checked })} /><span>Silenciar video</span></label>
              </div>

              <div className="mini-preview">
                <div className={`preview-scene theme-${selected.theme || "brand"}`}>
                  {selected.src && selected.kind !== "video" && <img src={selected.src} alt="" />}
                  {selected.src && selected.kind === "video" && <video src={selected.src} muted autoPlay loop playsInline />}
                  <div className="preview-scrim" />
                  <div className="preview-copy">
                    <small>{selected.eyebrow}</small>
                    <h3>{selected.title}</h3>
                    <p>{selected.subtitle}</p>
                    {selected.badge && <b>{selected.badge}</b>}
                    {selected.price && <strong>{selected.price}</strong>}
                    {selected.callToAction && <span>{selected.callToAction}</span>}
                  </div>
                </div>
                <p><CheckCircle2 /> Vista previa aproximada. Usa “Ver TV” para revisar en pantalla completa.</p>
              </div>
            </>
          ) : <div className="empty-editor">Agrega contenido para comenzar.</div>}
        </section>
      </section>
    </main>
  );
}
