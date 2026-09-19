import type { Metadata } from "next";
import Link from "next/link";
import { GENRES } from "@/lib/genres";

export const metadata: Metadata = {
  title: "Géneros de beats: trap, reggaetón, rap, drill y R&B",
  description: "Explorá el catálogo de NOTYPE.LABS por género y encontrá beats originales con licencias y precios en pesos argentinos.",
  alternates: { canonical: "/generos" },
};

export default function GenresPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 max-w-4xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Explorá por estilo</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">Géneros de beats</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400">
            Entrá a una categoría para escuchar instrumentales, comparar BPM y tonalidad y encontrar el sonido indicado para tu proyecto.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GENRES.map((genre, index) => (
            <Link
              key={genre.slug}
              href={`/generos/${genre.slug}`}
              className="group relative min-h-64 overflow-hidden rounded-3xl border border-zinc-900 bg-zinc-950 p-8 transition-all hover:border-red-600/60"
            >
              <span className="text-xs font-black tracking-[0.3em] text-zinc-700">0{index + 1}</span>
              <h2 className="mt-14 text-4xl font-black uppercase italic tracking-tighter transition-colors group-hover:text-red-500">{genre.name}</h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">{genre.intro}</p>
              <span className="mt-7 inline-block text-[10px] font-black uppercase tracking-[0.25em] text-white">Ver beats →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
