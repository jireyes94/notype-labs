"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import BeatCard from "@/components/BeatCard";
import { Beat } from "@/components/AudioContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import Link from "next/link";
import { GENRES } from "@/lib/genres";
import { GUIDES } from "@/lib/guides";
import { trackEvent } from "@/lib/analytics";

// COMPONENTE PRINCIPAL CON SUSPENSE
export default function HomeCatalog({ initialBeats }: { initialBeats: Beat[] }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent initialBeats={initialBeats} />
    </Suspense>
  );
}

// TU CÓDIGO ORIGINAL SIN CAMBIAR NI UNA COMA
function HomeContent({ initialBeats }: { initialBeats: Beat[] }) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search");
  const [beats] = useState<Beat[]>(initialBeats);
  const [searchTerm, setSearchTerm] = useState(querySearch ?? "");
  const [hideSold, setHideSold] = useState(false);

  const BEATS_PER_PAGE = 18;
  const [visibleBeats, setVisibleBeats] = useState(BEATS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Tags sugeridos para el scroll horizontal (estilo Beatstars)
  const suggestedTags = useMemo(() => {
    const allMoods = beats.flatMap(beat => 
      Array.isArray(beat.mood) ? beat.mood : [beat.mood]
    );
    // Removemos duplicados y limitamos a los 10 más usados
    return Array.from(new Set(allMoods)).slice(0, 10);
  }, [beats]);

  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      if (hideSold && beat.is_sold) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = beat.title.toLowerCase().includes(searchLower);
      const matchesBpm = beat.bpm.toString().includes(searchLower);
      const tags = Array.isArray(beat.mood) ? beat.mood : [beat.mood];
      const matchesTags = tags.some(tag => tag.toLowerCase().includes(searchLower.replace("#", "")));
      return matchesTitle || matchesBpm || matchesTags;
    });
  }, [beats, searchTerm, hideSold]);

  const displayedBeats = filteredBeats.slice(0, visibleBeats);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim();
    if (normalizedSearch.length < 2) return;
    const timeout = window.setTimeout(() => {
      trackEvent("search", { search_term: normalizedSearch, results_count: filteredBeats.length });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [searchTerm, filteredBeats.length]);

  useEffect(() => {
    if (filteredBeats.length <= visibleBeats) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleBeats((prev) => prev + BEATS_PER_PAGE); },
      { threshold: 0.1, rootMargin: "200px" }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [visibleBeats, filteredBeats.length]);

  return (
    <main className="min-h-screen bg-black text-white pb-32 pt-20">
      
      {/* 1. HERO SECTION INMERSIVO */}
      <section className="relative w-full">
        {/* Contenedor de Imagen de Fondo - Ocupa hasta los tags */}
        <div className="absolute inset-0 h-[600px] md:h-[700px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40"
            alt="Studio Background"
          />
          {/* Degradados para legibilidad y suavizado */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>

        {/* Contenido del Hero */}
        <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-10">
          <div className="flex flex-col justify-center min-h-[300px] md:min-h-[400px]">
            <span className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs mb-4 drop-shadow-md">
              Sonido Exclusivo
            </span>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.9] max-w-5xl drop-shadow-2xl">
              Encontrá el <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">beat</span> para tu <br />
              <span className="text-white">próxima canción</span>
            </h1>
            <p className="mt-8 max-w-2xl text-sm font-medium leading-relaxed text-zinc-300 md:text-base">
              Instrumentales originales de trap, reggaetón, drill, rap y R&B. Elegí tu licencia y pagá en pesos.
            </p>
          </div>
        </div>

        {/* 2. BARRA DE CONTROL (Integrada sobre el Hero) */}
        <div className="relative z-[40] px-4 md:px-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 p-6 md:p-8 rounded-3xl shadow-2xl">
              <div className="space-y-6">
                
                {/* Fila Superior: Buscador */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="relative w-full md:max-w-xl group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-zinc-500 group-focus-within:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <input 
                      type="text"
                      placeholder="QUE SONIDO BUSCAS? #TAG, BPM, TITULO..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setVisibleBeats(BEATS_PER_PAGE); }}
                      className="w-full bg-black/60 border border-zinc-700/50 py-4 pl-14 pr-12 rounded-2xl text-[11px] tracking-[0.2em] uppercase outline-none focus:border-red-600 focus:bg-black transition-all shadow-2xl"
                    />

                    {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(""); setVisibleBeats(BEATS_PER_PAGE); }}
                        className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Línea divisoria interna estética */}
                <div className="h-px w-full bg-gradient-to-r from-zinc-800/50 via-zinc-700/50 to-transparent" />

                {/* Fila Inferior: Tags + Toggle */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex flex-1 items-center gap-3 overflow-x-auto no-scrollbar w-full">
                    <button 
                      onClick={() => setSearchTerm("")}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${searchTerm === "" ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'}`}
                    >
                      All
                    </button>
                    {suggestedTags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${searchTerm.toLowerCase() === tag.toLowerCase() ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-400 hover:text-white'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                
                  <div className="hidden md:block w-px h-8 bg-zinc-800" />

                  <button 
                    onClick={() => setHideSold(!hideSold)}
                    className="flex items-center gap-4 shrink-0 group"
                  >
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${hideSold ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                      ocultar vendidos
                    </span>
                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${hideSold ? 'bg-red-600' : 'bg-zinc-800'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${hideSold ? 'left-7' : 'left-1'}`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 3. GRILLA DE CONTENIDO */}
      <section id="catalogo" className="px-4 md:px-8 mt-10">
        <div className="max-w-[1600px] mx-auto">
          {filteredBeats.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">No se encontraron beats</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 text-red-600 font-bold uppercase text-[10px] tracking-widest hover:underline">Limpiar búsqueda</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedBeats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {filteredBeats.length > visibleBeats && (
            <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-12">
              <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pt-20 md:px-8" aria-labelledby="genres-title">
        <div className="mx-auto max-w-[1600px] border-t border-zinc-900 pt-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Encontrá tu sonido</p>
              <h2 id="genres-title" className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">Beats por género</h2>
            </div>
            <Link href="/generos" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white">Ver todos los géneros →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {GENRES.map((genre) => (
              <Link key={genre.slug} href={`/generos/${genre.slug}`} className="rounded-2xl border border-zinc-900 bg-zinc-950 px-5 py-7 text-center text-sm font-black uppercase italic tracking-wider transition-all hover:border-red-600/60 hover:text-red-500">
                {genre.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 md:px-8" aria-labelledby="buy-argentina-title">
        <div className="mx-auto grid max-w-[1600px] gap-8 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Compra local</p>
            <h2 id="buy-argentina-title" className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">Licencias claras, precios en pesos</h2>
            <p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">
              Cada beat muestra BPM, tonalidad, estilo y alternativas de licencia. Podés escuchar antes de comprar y elegir el formato que corresponda a tu lanzamiento.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {["Compra directa online", "Precios expresados en ARS", "Soporte desde Argentina"].map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-900 bg-black px-5 py-4 text-xs font-bold uppercase tracking-wider text-zinc-300">✓ {item}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 md:col-span-2">
            <Link href="/licenses" className="rounded-full bg-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Comparar licencias</Link>
            <Link href="/faq" className="rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:border-white">Cómo funciona la compra</Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8" aria-labelledby="guides-title">
        <div className="mx-auto max-w-[1600px] border-t border-zinc-900 pt-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Antes de lanzar</p><h2 id="guides-title" className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">Recursos para artistas</h2></div>
            <Link href="/guias" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-white">Ver todas las guías →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {GUIDES.map((guide) => <Link key={guide.slug} href={`/guias/${guide.slug}`} className="rounded-2xl border border-zinc-900 bg-zinc-950/50 p-6 transition-colors hover:border-red-600/60"><span className="text-[9px] font-black uppercase tracking-[0.25em] text-red-600">{guide.eyebrow}</span><h3 className="mt-3 text-xl font-black uppercase italic tracking-tight">{guide.title}</h3><p className="mt-4 text-sm leading-relaxed text-zinc-600">{guide.description}</p></Link>)}
          </div>
        </div>
      </section>
    </main>
  );
}
