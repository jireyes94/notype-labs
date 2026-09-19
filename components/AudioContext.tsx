"use client";
import { createContext, useContext, useState } from "react";
import { trackEvent } from "@/lib/analytics";

export type Beat = {
  id?: number | string;
  slug: string;
  title: string;
  bpm: number;
  key: string;
  mood: string | string[];
  price: number;
  preview: string;    // Este lo usamos para el reproductor (mapeado de mp3_url)
  mp3_url?: string;   // Agregalo por seguridad
  cover_url?: string; // <--- ESTA ES LA LÍNEA QUE TE FALTA
  created_at?: string;
  is_sold: boolean
};

type AudioContextType = {
  currentBeat: Beat | null;
  isPlaying: boolean;
  playBeat: (beat: Beat) => void;
  togglePlay: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playBeat = (beat: Beat) => {
    if (currentBeat?.slug === beat.slug) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentBeat(beat);
      setIsPlaying(true);
      trackEvent("play_start", {
        beat_slug: beat.slug,
        beat_title: beat.title,
        genre: Array.isArray(beat.mood) ? beat.mood.join(", ") : beat.mood,
      });
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <AudioContext.Provider value={{ currentBeat, isPlaying, playBeat, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
