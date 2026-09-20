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
    <article className={`group grid overflow-hidden rounded-2xl border border-zinc-800/80 bg-black/70 transition-all hover:border-red-600/60 hover:bg-zinc-950 ${featured ? "sm:grid-cols-[190px_1fr] md:grid-cols-[240px_1fr]" : "grid-cols-[112px_1fr] sm:grid-cols-[135px_1fr] md:grid-cols-1"}`}>
      <div className={`relative overflow-hidden bg-zinc-900 ${featured ? "aspect-square sm:aspect-auto sm:min-h-[220px]" : "min-h-[160px] md:aspect-[16/10] md:min-h-0"}`}>
        <img src={beat.cover_url || `/covers/${beat.slug}.jpg`} alt={`Portada del beat ${beat.title}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <button
          type="button"
          onClick={() => playBeat(beat)}
          aria-label={active ? `Pausar ${beat.title}` : `Escuchar ${beat.title}`}
          className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-red-600 shadow-xl transition-transform hover:scale-105"
        >
          {active
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>}
        </button>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col justify-between ${featured ? "p-5 sm:p-7" : "p-4 md:p-5"}`}>
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em]">Promo</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{beat.bpm} BPM · {beat.key}</span>
          </div>
          <h3 className={`${featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"} truncate font-black uppercase italic leading-none tracking-tighter`}>
            <Link href={`/beats/${beat.slug}`} className="transition-colors hover:text-red-500">{beat.title}</Link>
          </h3>
          <p className="mt-2 truncate text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">{moodText(beat)}</p>
          {featured && <p className="mt-4 hidden max-w-2xl text-sm leading-relaxed text-zinc-400 sm:block">Beat original listo para grabar, disponible con licencias MP3, WAV y Unlimited.</p>}
        </div>
        <div className={`flex flex-wrap items-end justify-between gap-3 border-t border-zinc-900 ${featured ? "mt-5 pt-5" : "mt-4 pt-4"}`}>
          <div><span className="block text-[8px] font-black uppercase tracking-widest text-zinc-600">Desde</span><strong className={`${featured ? "text-2xl" : "text-xl"} mt-0.5 block font-black italic`}>${Number(beat.price).toLocaleString("es-AR")}</strong></div>
          <Link
            href={`/beats/${beat.slug}`}
            onClick={() => trackEvent("select_item", { item_id: beat.slug, item_name: beat.title, price: beat.price, currency: "ARS", source: "promotional_beats" })}
            className="rounded-full bg-red-600 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-red-500"
          >Ver licencias</Link>
        </div>
      </div>
    </article>
  );
}

export default function PromotionalBeats({ beats }: { beats: Beat[] }) {
  if (!beats.length) return null;
  const single = beats.length === 1;

  return (
    <section className="relative z-10 px-4 pb-8 md:px-8" aria-labelledby="promotional-beats-title">
      <div className="mx-auto max-w-[1600px] rounded-3xl border border-zinc-800/70 bg-gradient-to-br from-zinc-950/90 to-black/80 p-5 shadow-xl md:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.35em] text-red-600">Selección especial</p>
            <h2 id="promotional-beats-title" className="text-2xl font-black uppercase italic tracking-tighter md:text-3xl">Beats en promoción</h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-zinc-600">Instrumentales disponibles con precios por debajo del promedio del catálogo.</p>
        </div>
        <div className={single ? "grid" : "grid gap-3 md:grid-cols-3"}>
          {beats.map((beat) => <PromotionCard key={beat.slug} beat={beat} featured={single} />)}
        </div>
      </div>
    </section>
  );
}
