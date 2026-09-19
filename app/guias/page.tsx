import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guías para comprar, licenciar y elegir beats",
  description: "Guías prácticas para artistas argentinos sobre licencias de beats, formatos de audio, BPM, tonalidad y preparación de lanzamientos.",
  alternates: { canonical: "/guias" },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 max-w-4xl">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Recursos para artistas</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">Guías para llevar tu canción del beat al lanzamiento</h1>
          <p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">Información concreta para tomar mejores decisiones antes de comprar, grabar y publicar. Sin relleno ni recetas universales.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {GUIDES.map((guide, index) => (
            <article key={guide.slug} className="flex min-h-96 flex-col rounded-3xl border border-zinc-900 bg-zinc-950/60 p-8 transition-colors hover:border-red-600/50">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600"><span>0{index + 1}</span><span>{guide.readingTime}</span></div>
              <p className="mt-14 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">{guide.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-black uppercase italic tracking-tighter">{guide.title}</h2>
              <p className="mt-5 flex-grow text-sm leading-relaxed text-zinc-500">{guide.description}</p>
              <Link href={`/guias/${guide.slug}`} className="mt-8 text-[10px] font-black uppercase tracking-[0.25em] text-white hover:text-red-500">Leer guía →</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
