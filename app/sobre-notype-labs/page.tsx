import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre NOTYPE.LABS | Producción de beats en Argentina",
  description: "Conocé el enfoque de NOTYPE.LABS: producción independiente de beats, licencias claras y herramientas para artistas argentinos.",
  alternates: { canonical: "/sobre-notype-labs" },
};

export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "NOTYPE.LABS",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpg`,
    description: "Tienda independiente de beats y licencias musicales para artistas de Argentina.",
    areaServed: { "@type": "Country", name: "Argentina" },
    sameAs: ["https://instagram.com/notype.labs", "https://youtube.com/@notypelabs"],
  };

  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-10 border-b border-zinc-900 pb-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Producción independiente</p>
            <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter md:text-8xl">El laboratorio detrás del sonido</h1>
          </div>
          <p className="text-base leading-relaxed text-zinc-400">NOTYPE.LABS es una tienda independiente de beats creada en Argentina para que los artistas puedan escuchar, comparar y licenciar instrumentales con información clara.</p>
        </header>

        <section className="grid gap-8 py-16 md:grid-cols-3">
          {[
            ["Producción", "Cada beat se presenta con su identidad, BPM, tonalidad y estilo para que la decisión empiece por la música."],
            ["Licencias", "Las opciones separan calidad de archivo y alcance comercial. El objetivo es que el artista sepa qué está comprando."],
            ["Tecnología", "El catálogo, el reproductor, el pago y la entrega digital forman parte de una misma experiencia construida para la tienda."],
          ].map(([title, copy]) => <article key={title} className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-8"><h2 className="text-2xl font-black uppercase italic tracking-tight">{title}</h2><p className="mt-5 text-sm leading-relaxed text-zinc-500">{copy}</p></article>)}
        </section>

        <section className="grid gap-10 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600">El productor</p>
            <h2 className="mt-4 text-4xl font-black uppercase italic tracking-tighter">Producción al servicio de la canción</h2>
          </div>
          <div className="space-y-5 leading-relaxed text-zinc-400">
            <p>El trabajo detrás de NOTYPE.LABS combina composición, diseño sonoro, arreglos y criterio técnico. La prioridad no es llenar frecuencias, sino construir instrumentales donde la voz pueda ocupar un lugar propio.</p>
            <p>El catálogo cruza distintos lenguajes urbanos y se organiza para que un artista pueda descubrir sonidos por género, energía, tempo y tonalidad.</p>
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <a href="https://youtube.com/@notypelabs" target="_blank" rel="noopener noreferrer" className="group rounded-3xl border border-zinc-900 p-8 transition-colors hover:border-red-600/60"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">YouTube</p><h2 className="mt-4 text-3xl font-black uppercase italic tracking-tighter">Escuchá el universo NOTYPE →</h2><p className="mt-4 text-sm text-zinc-500">Beats, sonido y contenido audiovisual del proyecto.</p></a>
          <a href="https://instagram.com/notype.labs" target="_blank" rel="noopener noreferrer" className="group rounded-3xl border border-zinc-900 p-8 transition-colors hover:border-red-600/60"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Instagram</p><h2 className="mt-4 text-3xl font-black uppercase italic tracking-tighter">Proceso y novedades →</h2><p className="mt-4 text-sm text-zinc-500">Nuevas instrumentales y actividad de NOTYPE.LABS.</p></a>
        </section>

        <div className="mt-16 flex flex-wrap justify-center gap-4"><Link href="/#catalogo" className="rounded-full bg-red-600 px-7 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Escuchar beats</Link><Link href="/guias" className="rounded-full border border-zinc-700 px-7 py-3 text-[10px] font-black uppercase tracking-widest hover:border-white">Leer guías</Link></div>
      </div>
    </main>
  );
}
