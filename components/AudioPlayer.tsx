"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useAudio, Beat } from "./AudioContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AudioPlayer() {
  const { currentBeat, isPlaying, togglePlay, playBeat } = useAudio();
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [volume, setVolume] = useState(1); // CORREGIDO: Inicia al 100%
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progress, setProgress] = useState(0);
  const [beatsList, setBeatsList] = useState<Beat[]>([]);
  const pathname = usePathname();

  // 1. Lógica de navegación (Corregida para evitar errores de tipos y fallos de navegación)
  useEffect(() => {
    async function getBeats() {
      const { data } = await supabase.from('beats').select('*');
      if (data) {
        let sortedBeats = data.map(b => ({ ...b, preview: b.mp3_url })) as Beat[];
        const savedOrder = sessionStorage.getItem('beats_order');
        
        if (savedOrder) {
          try {
            const orderIds = JSON.parse(savedOrder);
            // CORRECCIÓN DE ADVERTENCIA Y LÓGICA:
            // Convertimos ambos a String para asegurar que el mapeo funcione siempre
            sortedBeats = orderIds
              .map((id: string | number) => sortedBeats.find(b => String(b.id) === String(id)))
              .filter((b: Beat): b is Beat => !!b);
          } catch (e) {
            console.error("Error al parsear el orden", e);
          }
        }
        setBeatsList(sortedBeats);
      }
    }
    getBeats();
  }, [currentBeat?.id]);

  useEffect(() => {
    if (!waveformRef.current || !currentBeat) return;
    if (wavesurfer.current) wavesurfer.current.destroy();

    // Motor oculto
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "transparent", 
      progressColor: "transparent",
      cursorColor: "transparent",
      height: 0, 
    });

    wavesurfer.current.load(currentBeat.preview);
    wavesurfer.current.setVolume(volume);
    
    wavesurfer.current.on("ready", () => {
      setIsReady(true);
      const total = wavesurfer.current?.getDuration() || 0;
      setDuration(formatTime(total));
      if (isPlaying) wavesurfer.current?.play();
    });

    wavesurfer.current.on("audioprocess", () => {
      const current = wavesurfer.current?.getCurrentTime() || 0;
      const total = wavesurfer.current?.getDuration() || 1;
      setCurrentTime(formatTime(current));
      setProgress((current / total) * 100);
    });
    
    wavesurfer.current.on("finish", () => handleNext());

    return () => wavesurfer.current?.destroy();
  }, [currentBeat?.slug]);

  useEffect(() => {
    if (!wavesurfer.current || !isReady) return;
    isPlaying ? wavesurfer.current.play().catch(() => {}) : wavesurfer.current.pause();
  }, [isPlaying, isReady]);

  const handleNext = () => {
    if (beatsList.length === 0) return;
    const currentIndex = beatsList.findIndex(b => b.slug === currentBeat?.slug);
    if (currentIndex === -1) return;
    const nextBeat = beatsList[(currentIndex + 1) % beatsList.length];
    playBeat(nextBeat);
  };

  const handlePrev = () => {
    if (beatsList.length === 0) return;
    const currentIndex = beatsList.findIndex(b => b.slug === currentBeat?.slug);
    if (currentIndex === -1) return;
    const prevBeat = beatsList[(currentIndex - 1 + beatsList.length) % beatsList.length];
    playBeat(prevBeat);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wavesurfer.current || !isReady) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    wavesurfer.current.seekTo(x / bounds.width);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentBeat || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#080808] border-t border-white/10 z-[200] shadow-[0_-15px_40px_rgba(0,0,0,0.9)]">
      <div ref={waveformRef} className="hidden" />

      <div className="max-w-[1600px] mx-auto h-[100px] md:h-[110px] px-6 flex items-center justify-between gap-4 md:gap-10">
        
        {/* INFO CARD */}
        <Link href={`/beats/${currentBeat.slug}`} className="flex items-center gap-4 min-w-0 md:w-[300px] group">
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
            <img src={currentBeat.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[12px] md:text-sm font-black uppercase italic tracking-tighter text-white group-hover:text-red-600 transition-colors">
              {currentBeat.title}
            </h4>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 mt-0.5">
              {currentBeat.bpm} BPM <span className="text-red-600">|</span> {currentBeat.key}
            </p>
          </div>
        </Link>

        {/* CONTROLES */}
        <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-6 md:gap-10">
            <button onClick={handlePrev} className="text-zinc-500 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button onClick={togglePlay} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl">
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button onClick={handleNext} className="text-zinc-500 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
          
          {/* BARRA INTERACTIVA */}
          <div className="flex items-center gap-3 w-full group">
            <span className="text-[10px] font-black text-zinc-500 tabular-nums w-8">{currentTime}</span>
            <div onClick={handleSeek} className="h-1.5 bg-zinc-800 flex-1 rounded-full relative cursor-pointer overflow-hidden transition-all group-hover:h-2">
                <div className="absolute top-0 left-0 h-full bg-red-600" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-black text-zinc-500 tabular-nums w-8">{duration}</span>
          </div>
        </div>

        {/* VOLUMEN SOBRIO */}
        <div className="hidden lg:flex items-center justify-end gap-4 w-[300px]">
          <div className="flex items-center gap-3 bg-zinc-900/40 px-4 py-2 rounded-full border border-white/5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="3"><path d="M11 5L6 9H2v6h4l5 4V5z"/></svg>
            <input 
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                wavesurfer.current?.setVolume(v);
              }}
              className="w-20 h-1 bg-zinc-700 rounded-full appearance-none accent-zinc-500 cursor-pointer"
            />
            <span className="text-[10px] font-black text-zinc-400 tabular-nums w-6">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}