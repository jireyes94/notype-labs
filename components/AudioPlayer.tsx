"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useAudio } from "./AudioContext";
import { usePathname } from "next/navigation"; // 1. Importamos el hook
import Link from "next/link";

export default function AudioPlayer() {
  const { currentBeat, isPlaying, togglePlay } = useAudio();
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname(); // 2. Obtenemos la ruta

  // --- TODOS LOS HOOKS DEBEN IR ARRIBA DEL RETURN ---

  useEffect(() => {
    if (!waveformRef.current || !currentBeat) return;

    if (wavesurfer.current) wavesurfer.current.destroy();

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#27272a",
      progressColor: "#dc2626",
      cursorColor: "#ffffff",
      barWidth: 2,
      barRadius: 3,
      height: 40,
      normalize: true
    });

    wavesurfer.current.load(currentBeat.preview);
    
    wavesurfer.current.on("ready", () => {
      setIsReady(true);
      if (isPlaying) wavesurfer.current?.play();
    });
    
    wavesurfer.current.on("finish", () => togglePlay());

    return () => wavesurfer.current?.destroy();
  }, [currentBeat?.preview]);

  useEffect(() => {
    if (!wavesurfer.current || !isReady) return;
    isPlaying ? wavesurfer.current.play() : wavesurfer.current.pause();
  }, [isPlaying, isReady]);

  // --- REGLA DE ORO: EL FILTRO DE RUTA VA JUSTO ANTES DEL RENDERIZADO ---
  
  // Si no hay beat seleccionado O estamos en la zona de admin, no dibujamos nada
  if (!currentBeat || pathname.startsWith("/admin")) {
    return null;
  }

  // Iconos
  const PauseIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );

  const PlayIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-zinc-800 z-[100] shadow-[0_-10px_25px_rgba(0,0,0,0.5)] text-white h-[112px] md:h-[80px]">
      <div className="max-w-7xl mx-auto px-4 h-28 md:h-20 flex flex-col md:grid md:grid-cols-[200px_1fr_80px] items-center justify-center gap-2 md:gap-4">
        
        <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0 gap-3 min-w-0">
  
  {/* CAMBIO: Envolvemos este div en un Link */}
  <Link 
    href={`/beats/${currentBeat.slug}`} 
    className="flex items-center gap-3 min-w-0 group hover:opacity-80 transition-all"
  >
    <div className={`w-10 h-10 md:w-12 md:h-12 bg-zinc-900 rounded flex-shrink-0 border ${isPlaying ? 'border-red-600' : 'border-zinc-800'} overflow-hidden`}>
      <img 
        src={(currentBeat as any).cover_url || `/covers/${currentBeat.slug}.jpg`} 
        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
        alt="" 
      />
    </div>
    <div className="min-w-0 overflow-hidden">
      {/* Añadimos hover:text-red-600 al título para feedback visual */}
      <p className="font-bold text-sm truncate uppercase tracking-tight group-hover:text-red-600 transition-colors">
        {currentBeat.title}
      </p>
      <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{currentBeat.bpm} BPM</p>
    </div>
  </Link>
  
  {/* El botón de play de mobile se queda afuera del Link para no interferir */}
  <div className="md:hidden">
    <button 
      onClick={togglePlay} 
      className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center active:scale-90 transition-transform"
    >
      {isPlaying ? PauseIcon : PlayIcon}
    </button>
  </div>
</div>

        <div className="w-full min-w-0 overflow-hidden px-2 md:px-0">
          <div ref={waveformRef} className="w-full" />
        </div>

        <div className="hidden md:flex justify-end flex-shrink-0">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-black hover:bg-red-600 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? PauseIcon : PlayIcon}
          </button>
        </div>
      </div>
    </div>
  );
}