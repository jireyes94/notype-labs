import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GenreCatalog from "@/components/GenreCatalog";
import type { Beat } from "@/components/AudioContext";
import { beatMatchesGenre, GENRES, getGenre } from "@/lib/genres";
import { SITE_URL } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return GENRES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = getGenre(slug);
  if (!genre) return { title: "Género no encontrado", robots: { index: false, follow: true } };

  return {
    title: genre.title,
    description: genre.description,
    alternates: { canonical: `/generos/${genre.slug}` },
    openGraph: {
      title: `${genre.title} | NOTYPE.LABS`,
      description: genre.description,
      url: `/generos/${genre.slug}`,
    },
  };
}

async function getGenreBeats(slug: string): Promise<Beat[]> {
  const genre = getGenre(slug);
  if (!genre) return [];

  const { data, error } = await supabase.from("beats").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error(`No se pudo cargar la categoría ${slug}`, error.message);
    return [];
  }

  return (data ?? [])
    .filter((beat) => beatMatchesGenre(beat.mood ?? "", genre))
    .map((beat) => ({ ...beat, preview: beat.mp3_url, cover_url: beat.cover_url })) as Beat[];
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = getGenre(slug);
  if (!genre) notFound();
  const beats = await getGenreBeats(slug);
  const pageUrl = `${SITE_URL}/generos/${genre.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#collection`,
        name: genre.title,
        description: genre.description,
        url: pageUrl,
        inLanguage: "es-AR",
        numberOfItems: beats.length,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Beats", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Géneros", item: `${SITE_URL}/generos` },
          { "@type": "ListItem", position: 3, name: genre.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black px-4 pb-40 pt-32 text-white md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-[1600px]">
        <nav className="mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600" aria-label="Breadcrumb">
          <Link href="/#catalogo" className="hover:text-white">Beats</Link> <span className="mx-2">/</span>
          <Link href="/generos" className="hover:text-white">Géneros</Link> <span className="mx-2">/</span>
          <span className="text-red-600">{genre.name}</span>
        </nav>

        <header className="mb-14 grid gap-8 border-b border-zinc-900 pb-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Catálogo por género</p>
            <h1 className="max-w-5xl text-5xl font-black uppercase italic tracking-tighter md:text-7xl">{genre.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-400">{genre.intro}</p>
          </div>
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6">
            <p className="mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Ideal para</p>
            <ul className="space-y-3 text-sm font-bold text-zinc-300">
              {genre.uses.map((use) => <li key={use}>— {use}</li>)}
            </ul>
          </div>
        </header>

        <section aria-labelledby="genre-catalog-title">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h2 id="genre-catalog-title" className="text-3xl font-black uppercase italic tracking-tighter">Beats disponibles</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{beats.length} resultados</span>
          </div>
          <GenreCatalog beats={beats} />
        </section>

        <section className="mt-20 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-8 md:p-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Cómo elegir tu beat de {genre.name}</h2>
          <p className="mt-5 max-w-4xl leading-relaxed text-zinc-400">
            Escuchá la estructura completa de la preview, revisá el BPM y la tonalidad y pensá dónde va a respirar tu voz. Cuando encuentres el beat indicado, compará las licencias antes de comprar.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/licenses" className="rounded-full bg-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Comparar licencias</Link>
            <Link href="/faq" className="rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:border-white">Preguntas frecuentes</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
