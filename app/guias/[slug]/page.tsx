import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guía no encontrada", robots: { index: false, follow: true } };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: { title: `${guide.title} | NOTYPE.LABS`, description: guide.description, url: `/guias/${guide.slug}`, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const pageUrl = `${SITE_URL}/guias/${guide.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: pageUrl,
    inLanguage: "es-AR",
    author: { "@type": "Organization", name: "NOTYPE.LABS", url: SITE_URL },
    publisher: { "@type": "Organization", name: "NOTYPE.LABS", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600"><Link href="/" className="hover:text-white">Beats</Link><span className="mx-2">/</span><Link href="/guias" className="hover:text-white">Guías</Link></nav>
        <header className="border-b border-zinc-900 pb-12">
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-600"><span>{guide.eyebrow}</span><span className="text-zinc-700">·</span><span className="text-zinc-500">{guide.readingTime} de lectura</span></div>
          <h1 className="mt-6 text-5xl font-black uppercase italic leading-none tracking-tighter md:text-7xl">{guide.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-relaxed text-zinc-400">{guide.description}</p>
        </header>

        <div className="mt-12 space-y-14">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">{section.heading}</h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-zinc-300">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
              {section.bullets && <ul className="mt-6 space-y-3 rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6 text-sm text-zinc-300">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="text-red-600">—</span>{bullet}</li>)}</ul>}
            </section>
          ))}
        </div>

        <aside className="mt-16 rounded-3xl border border-red-600/30 bg-red-600/10 p-8">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Pasá de la guía a la escucha</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">Compará instrumentales reales y aplicá estos criterios antes de elegir una licencia.</p>
          <div className="mt-6 flex flex-wrap gap-4"><Link href={guide.relatedGenre ? `/generos/${guide.relatedGenre}` : "/#catalogo"} className="rounded-full bg-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Explorar beats</Link><Link href="/licenses" className="rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:border-white">Comparar licencias</Link></div>
        </aside>
      </article>
    </main>
  );
}
