"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase"; 
import BeatCard from "@/components/BeatCard";
import BeatModal from "@/components/BeatModal";
import { Beat } from "@/components/AudioContext";
import { useSearchParams } from "next/navigation";

export default function BeatsPage() {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA BÚSQUEDA Y FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [hideSold, setHideSold] = useState(false); // <--- NUEVO ESTADO

  const searchParams = useSearchParams();
  const querySearch = searchParams.get("search"); // Captura el "?search=..."

  const BEATS_PER_PAGE = 15;
  const [visibleBeats, setVisibleBeats] = useState(BEATS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 2. Agregá este useEffect para que, si viene un tag por URL, se ponga en el buscador
  useEffect(() => {
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [querySearch]);


  useEffect(() => {
  async function fetchBeats() {
    const { data, error } = await supabase
      .from('beats')
      .select('*');

    if (error) {
      console.error("Error cargando beats:", error);
    } else {
      let formattedBeats = data?.map((b) => ({
        ...b,
        preview: b.mp3_url,
        cover_url: b.cover_url
      })) || [];

      // Intentar recuperar el orden guardado en esta sesión
      const savedOrder = sessionStorage.getItem('beats_order');
      
      if (savedOrder) {
        // Si ya hay un orden, reordenamos los datos según los IDs guardados
        const orderIds = JSON.parse(savedOrder);
        formattedBeats = orderIds
          .map((id: string) => formattedBeats.find(b => b.id === id))
          .filter(Boolean); // Por seguridad, filtramos si algún beat fue borrado
      } else {
        // Si es la "primera vez", randomizamos y guardamos el orden
        formattedBeats = shuffleArray(formattedBeats);
        const orderIds = formattedBeats.map(b => b.id);
        sessionStorage.setItem('beats_order', JSON.stringify(orderIds));
      }

      setBeats(formattedBeats);
    }
    setLoading(false);
  }
  fetchBeats();
}, []);

  // LÓGICA DE FILTRADO ACTUALIZADA
  const filteredBeats = useMemo(() => {
    return beats.filter((beat) => {
      // Filtro de Vendidos
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

  // Función para mezclar un array (Algoritmo Fisher-Yates)
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (filteredBeats.length <= visibleBeats) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleBeats((prev) => prev + BEATS_PER_PAGE);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [visibleBeats, filteredBeats.length]);

  if (loading) return (
    <div className="min-h-screen bg-black text-white pb-40">
      {/* Esqueleto del Header */}
      <div className="py-8 px-8 border-b border-zinc-900 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <div className="h-10 w-64 bg-zinc-900 animate-pulse rounded-lg" />
          <div className="h-4 w-48 bg-zinc-900/50 animate-pulse rounded-md" />
        </div>
      </div>
    
      {/* Esqueleto de la Grilla (Copiando tus columnas actuales) */}
      <div className="p-4 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 max-w-[1600px] mx-auto">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col">
            {/* El cover art cuadrado */}
            <div className="aspect-square w-full bg-zinc-900 animate-pulse" />
            
            <div className="p-4 space-y-3">
              {/* Título */}
              <div className="h-4 w-3/4 bg-zinc-900 animate-pulse rounded" />
              {/* Tags */}
              <div className="h-3 w-1/2 bg-zinc-800 animate-pulse rounded" />
              
              {/* Footer de la card */}
              <div className="pt-4 border-t border-zinc-900/50 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-2 w-8 bg-zinc-900 animate-pulse rounded" />
                  <div className="h-5 w-16 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-8 w-20 bg-zinc-900 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-0 bg-black text-white pb-40 md:pb-32">
      <div className="py-8 px-8 border-b border-zinc-900 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-4xl font-black uppercase italic tracking-tighter">
              Catálogo de <span className="text-red-600">Beats</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-zinc-500 text-[10px] md:text-xs tracking-widest uppercase font-bold">
                {filteredBeats.length} {filteredBeats.length === 1 ? 'Resultado encontrado' : 'Instrumentales disponibles'}
              </p>
              
              {/* TOGGLE Ocultar Vendidos */}
              <button 
                onClick={() => setHideSold(!hideSold)}
                className="flex items-center gap-2 group transition-all"
              >
                <div className={`w-8 h-4 rounded-full relative transition-colors ${hideSold ? 'bg-red-600' : 'bg-zinc-800'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${hideSold ? 'left-5' : 'left-1'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${hideSold ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                  Ocultar vendidos
                </span>
              </button>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA ACTUALIZADA */}
          <div className="relative w-full md:max-w-md group">
            {/* Icono de Lupa (Izquierda) */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <input 
              type="text"
              placeholder="BUSCAR POR NOMBRE, #TAG O BPM..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleBeats(BEATS_PER_PAGE);
              }}
              className="w-full bg-zinc-900/50 border border-zinc-800 py-4 pl-12 pr-12 rounded-2xl text-xs tracking-widest uppercase outline-none focus:border-red-600 focus:bg-zinc-900 transition-all placeholder:text-zinc-600"
            />
          
            {/* BOTÓN X PARA BORRAR (Derecha) */}
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setVisibleBeats(BEATS_PER_PAGE);
                }}
                className="absolute inset-y-0 right-4 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <div className="bg-zinc-800 hover:bg-zinc-700 p-1 rounded-full transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULTADOS VACÍOS */}
      {filteredBeats.length === 0 && !loading && (
        <div className="py-20 text-center">
          <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-xl">No se encontraron beats</p>
          <button onClick={() => setSearchTerm("")} className="mt-4 text-red-600 font-bold uppercase text-[10px] tracking-widest hover:underline">Limpiar búsqueda</button>
        </div>
      )}

      {/* GRILLA (NO TOCADA) */}
      <div className="p-4 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-[1600px] mx-auto">
        {displayedBeats.map((beat) => (
          <BeatCard key={beat.id || beat.slug} beat={beat} onBuy={(b) => setSelectedBeat(b)} />
        ))}
      </div>

      {filteredBeats.length > visibleBeats && (
        <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-4">
          <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        </div>
      )}

      {selectedBeat && (
        <BeatModal beat={selectedBeat} onClose={() => setSelectedBeat(null)} />
      )}
    </div>
  );
}