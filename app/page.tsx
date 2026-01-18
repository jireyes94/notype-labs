"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase"; 
import BeatCard from "@/components/BeatCard";
import BeatModal from "@/components/BeatModal";
import { Beat } from "@/components/AudioContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from 'react';

// COMPONENTE PRINCIPAL CON SUSPENSE
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

// TU CÓDIGO ORIGINAL SIN CAMBIAR NI UNA COMA
function HomeContent() {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hideSold, setHideSold] = useState(false);

  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search");

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

  useEffect(() => {
    if (querySearch) setSearchTerm(querySearch);
  }, [querySearch]);

  useEffect(() => {
    async function fetchBeats() {
      const { data, error } = await supabase.from('beats').select('*');
      if (error) {
        console.error("Error cargando beats:", error);
      } else {
        let formattedBeats = data?.map((b) => ({
          ...b,
          preview: b.mp3_url,
          cover_url: b.cover_url
        })) || [];

        const savedOrder = sessionStorage.getItem('beats_order');
        if (savedOrder) {
          const orderIds = JSON.parse(savedOrder);
          formattedBeats = orderIds.map((id: string) => formattedBeats.find(b => b.id === id)).filter(Boolean);
        } else {
          formattedBeats = shuffleArray(formattedBeats);
          sessionStorage.setItem('beats_order', JSON.stringify(formattedBeats.map(b => b.id)));
        }
        setBeats(formattedBeats);
      }
      setLoading(false);
    }
    fetchBeats();
  }, []);

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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
      
      {/* 1. BANNER SUPERIOR (Estilo Beatstars + NO TYPE) */}
      <section className="relative w-full px-4 md:px-8 pt-6">
        <div className="max-w-[1600px] mx-auto relative h-[250px] md:h-[350px] rounded-[2rem] overflow-hidden border border-zinc-900 shadow-2xl group">
          {/* Imagen de fondo relacionada a producción */}
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            alt="Studio Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <span className="text-red-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Sonido Exclusivo</span>
            <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight max-w-2xl">
              Lleva tu  <span className="text-red-600">música</span> al siguiente nivel
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-4 max-w-md opacity-20">
              Beats de alta calidad diseñados para artistas que no quieren sonar como el resto.
            </p>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE CONTROL (BUSCADOR + TAGS + COUNTER) */}
      <div className="z-[40] bg-black/80 backdrop-blur-xl border-b border-zinc-900/50 py-6 px-4 md:px-8 mt-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Fila Superior: Título y Contador */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

            {/* Buscador Estilo Beatstars con Botón de Borrado */}
            <div className="relative w-full md:max-w-md group">
              {/* Icono de Lupa */}
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Input */}
              <input 
                type="text"
                placeholder="QUE SONIDO BUSCAS? #TAG, BPM, TITULO..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setVisibleBeats(BEATS_PER_PAGE); }}
                className="w-full bg-zinc-900/50 border border-zinc-800 py-3.5 pl-12 pr-12 rounded-xl text-[10px] tracking-widest uppercase outline-none focus:border-red-600 focus:bg-zinc-900 transition-all shadow-inner"
              />

              {/* BOTÓN PARA BORRAR (Solo visible si hay texto) */}
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(""); setVisibleBeats(BEATS_PER_PAGE); }}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-red-600 transition-colors"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Fila Inferior: Tags + Toggle Ocultar Vendidos */}
          <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
            {/* Horizontal Scroll de Tags */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar w-full">
              <button 
                onClick={() => setSearchTerm("")}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${searchTerm === "" ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'}`}
              >
                All
              </button>
              {suggestedTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${searchTerm.toLowerCase() === tag.toLowerCase() ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          
            {/* Separador vertical solo en desktop */}
            <div className="hidden md:block w-px h-6 bg-zinc-800" />

            {/* Toggle Switch */}
            <button 
              onClick={() => setHideSold(!hideSold)}
              className="flex items-center gap-3 shrink-0"
            >
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${hideSold ? 'text-white' : 'text-zinc-600'}`}>
                ocultar vendidos
              </span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${hideSold ? 'bg-red-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${hideSold ? 'left-6' : 'left-1'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. GRILLA DE CONTENIDO */}
      <section className="px-4 md:px-8 mt-10">
        <div className="max-w-[1600px] mx-auto">
          {filteredBeats.length === 0 && !loading ? (
            <div className="py-20 text-center">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">No se encontraron beats</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 text-red-600 font-bold uppercase text-[10px] tracking-widest hover:underline">Limpiar búsqueda</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayedBeats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} onBuy={(b) => setSelectedBeat(b)} />
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

      {/* Modales */}
      {selectedBeat && (
        <BeatModal beat={selectedBeat} onClose={() => setSelectedBeat(null)} />
      )}
    </main>
  );
}