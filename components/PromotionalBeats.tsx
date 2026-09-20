"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { type Beat, useAudio } from "@/components/AudioContext";

function moodText(beat: Beat): string {
  return (Array.isArray(beat.mood) ? beat.mood : [beat.mood]).filter(Boolean).slice(0, 3).join(" · ");
}

function PromotionCard({ beat, featured }: { beat: Beat; featured: boolean }) {
  const { playBeat, currentBeat, isPlaying } = useAudio();
  const active = currentBeat?.slug === beat.slug && isPlaying;

  return (
    <article className={`group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl transition-colors hover:border-red-600/70 ${featured ? "grid md:grid-cols-[minmax(280px,0.8fr)_1.2fr]" : "flex flex-col"}`}>
      <div className={`relative overflow-hidden bg-zinc-900 ${featured ? "min-h-[280px] md:min-h-[360px]" : "aspect-[4/3]"}`}>
        <img src={beat.cover_url || `/covers/${beat.slug}.jpg`} alt={`Portada del beat ${beat.title}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <button
          type="button"
          onClick={() => playBeat(beat)}
          aria-label={active ? `Pausar ${beat.title}` : `Escuchar ${beat.title}`}
          className="absolute bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-red-600 shadow-2xl transition-transform hover:scale-105"
        >
          {active
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>}
        </button>
      </div>

      <div className={`flex flex-1 flex-col justify-between ${featured ? "p-7 md:p-10" : "p-6"}`}>
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-red-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest">Precio destacado</span>
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">{beat.bpm} BPM · {beat.key}</span>
          </div>
          <h3 className={`${featured ? "text-4xl md:text-6xl" : "text-3xl"} font-black uppercase italic leading-none tracking-tighter`}>
            <Link href={`/beats/${beat.slug}`} className="transition-colors hover:text-red-500">{beat.title}</Link>
          </h3>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">{moodText(beat)}</p>
          <p className="mt-5 text-sm leading-relaxed text-zinc-400">
            Beat original listo para grabar. Escuchá la instrumental completa, compará las licencias MP3, WAV y Unlimited y elegí la opción para tu próximo lanzamiento.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5 border-t border-zinc-800 pt-6">
          <div><span className="block text-[9px] font-black uppercase tracking-widest text-zinc-600">Licencias desde</span><strong className="mt-1 block text-3xl font-black italic">${Number(beat.price).toLocaleString("es-AR")}</strong></div>
          <Link
            href={`/beats/${beat.slug}`}
            onClick={() => trackEvent("select_item", { item_id: beat.slug, item_name: beat.title, price: beat.price, currency: "ARS", source: "promotional_beats" })}
            className="rounded-full bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-red-600 hover:text-white"
          >Ver beat y licencias</Link>
        </div>
      </div>
    </article>
  );
}

export default function PromotionalBeats({ beats }: { beats: Beat[] }) {
  if (!beats.length) return null;
  const single = beats.length === 1;

  return (
    <section className="relative z-10 px-4 pb-10 md:px-8" aria-labelledby="promotional-beats-title">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Una oportunidad para empezar</p>
          <h2 id="promotional-beats-title" className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">Beats en promoción</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">Instrumentales seleccionadas con precios por debajo del promedio actual del catálogo.</p>
        </div>
        <div className={single ? "grid" : "grid gap-5 md:grid-cols-3"}>
          {beats.map((beat) => <PromotionCard key={beat.slug} beat={beat} featured={single} />)}
        </div>
      </div>
    </section>
  );
}
