"use client";
import Link from "next/link";
import { useAudio, Beat } from "./AudioContext";

export default function BeatCard({ beat, onBuy }: { beat: Beat; onBuy: (beat: Beat) => void }) {
  const { playBeat, currentBeat, isPlaying } = useAudio();
  const isThisBeatActive = currentBeat?.slug === beat.slug && isPlaying;

  return (
    <div 
      onClick={() => { if (!beat.is_sold) onBuy(beat); }} // <-- AHORA TODA LA CARD ABRE EL MODAL
      className={`bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden hover:border-red-600/50 transition-all group flex flex-col h-full shadow-lg relative cursor-pointer max-w-[300px] mx-auto w-full ${beat.is_sold ? 'opacity-80' : ''}`}
    >
      {/* ETIQUETA SOLD */}
      {beat.is_sold && (
        <div className="absolute top-3 right-3 z-30 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl italic">
          Sold
        </div>
      )}
      
    {/* CONTENEDOR DE IMAGEN - AJUSTE DINÁMICO */}
    <div className="relative w-full overflow-hidden bg-zinc-900 
                    aspect-square md:aspect-[4/3] 
                    max-h-[160px] md:max-h-none"> 
      <img 
        src={beat.cover_url || `/covers/${beat.slug}.jpg`} 
        alt={beat.title}
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
    />
        
        {/* Overlay de Play */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isThisBeatActive ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
        }`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault(); 
              playBeat(beat);
            }}
            className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-100 active:scale-90 transition-all border border-white/20 hover:bg-red-500 z-20"
          >
            {isThisBeatActive ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>

        {/* INFO TÉCNICA FLOTANTE (REDEFINIDA SIN BOLD) */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="text-[10px] font-medium bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-white tracking-widest uppercase">
            {beat.bpm} BPM
          </span>
          <span className="text-[10px] font-medium bg-red-600 border border-red-500 px-2 py-0.5 rounded text-white tracking-widest">
            {beat.key}
          </span>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5">
          {/* TÍTULO AGRANDADO E ITALIC */}
          <h2 className="block font-black text-lg md:text-xl text-white group-hover:text-red-600 transition-colors truncate uppercase tracking-tighter italic">
            {beat.title}
          </h2>
        </div>
        
        {/* FOOTER - CORREGIDO PARA MOBILE */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2 mt-auto pt-2 border-t border-zinc-900/50">
          <div className="flex flex-col min-w-[70px]">
            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter leading-none">Desde</span>
            <span className="font-black text-lg md:text-xl text-white italic leading-none mt-1">
              ${beat.price.toLocaleString('es-AR')}
            </span>
          </div>
                  
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (!beat.is_sold) onBuy(beat); // Solo abre modal si no está vendido
            }}
            disabled={beat.is_sold}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg z-20 whitespace-nowrap ${
              beat.is_sold 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-red-600 hover:text-white active:scale-95'
            }`}
          >
            {beat.is_sold ? 'Vendido' : 'Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
}