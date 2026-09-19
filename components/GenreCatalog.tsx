"use client";

import { useState } from "react";
import type { Beat } from "@/components/AudioContext";
import BeatCard from "@/components/BeatCard";
import BeatModal from "@/components/BeatModal";

export default function GenreCatalog({ beats }: { beats: Beat[] }) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

  if (beats.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-900 bg-zinc-950/60 px-6 py-14 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Estamos preparando nuevos beats para esta categoría.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {beats.map((beat) => (
          <BeatCard key={beat.id ?? beat.slug} beat={beat} onBuy={setSelectedBeat} />
        ))}
      </div>
      {selectedBeat && <BeatModal beat={selectedBeat} onClose={() => setSelectedBeat(null)} />}
    </>
  );
}
