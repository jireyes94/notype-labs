import Image from "next/image";
import Link from "next/link";
import GumroadLink from "@/components/GumroadLink";
import { AUDIO_PLUGINS, type AudioPlugin, type PluginLocale } from "@/lib/plugins";
import { SITE_URL } from "@/lib/site";

const UI = {
  es: {
    back: "Todos los plugins",
    language: "Read in English",
    buy: "Comprar y descargar en Gumroad",
    once: "Pago único · Descarga digital",
    about: "Por qué existe",
    includes: "Qué hace",
    forWho: "Diseñado para",
    compatibility: "Compatibilidad",
    tested: "Probado en",
    related: "También puede servirte",
    relatedAction: "Conocer plugin",
    faq: "Preguntas frecuentes",
    gumroad: "El pago y la entrega son procesados de forma segura por Gumroad.",
    notice: "Los nombres de equipos de terceros se utilizan únicamente como referencias descriptivas de carácter tonal. NOTYPE.REF no está afiliado a sus fabricantes.",
  },
  en: {
    back: "All plugins",
    language: "Leer en español",
    buy: "Buy and download on Gumroad",
    once: "One-time payment · Digital download",
    about: "Why it exists",
    includes: "What it does",
    forWho: "Built for",
    compatibility: "Compatibility",
    tested: "Tested in",
    related: "You may also need",
    relatedAction: "Explore plugin",
    faq: "Frequently asked questions",
    gumroad: "Payment and digital delivery are securely handled by Gumroad.",
    notice: "Third-party equipment names are used only as descriptive tonal references. NOTYPE.REF is not affiliated with their manufacturers.",
  },
} as const;

export default function PluginDetailPage({ plugin, locale }: { plugin: AudioPlugin; locale: PluginLocale }) {
  const ui = UI[locale];
  const copy = plugin.copy[locale];
  const prefix = locale === "en" ? "/en" : "";
  const alternatePrefix = locale === "en" ? "" : "/en";
  const pageUrl = `${SITE_URL}${prefix}/plugins/${plugin.slug}`;
  const related = AUDIO_PLUGINS.find((item) => item.slug !== plugin.slug)!;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${pageUrl}#software`,
      name: plugin.name,
      alternateName: `${plugin.name} ${plugin.tagline}`,
      url: pageUrl,
      image: `${SITE_URL}${plugin.image}`,
      description: copy.shortDescription,
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Audio plugin",
      operatingSystem: plugin.operatingSystem,
      softwareVersion: plugin.version,
      fileFormat: plugin.format,
      inLanguage: locale,
      author: { "@type": "Organization", name: "NOTYPE.REF", url: SITE_URL },
      offers: {
        "@type": "Offer",
        price: plugin.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: plugin.gumroadUrl,
        seller: { "@type": "Organization", name: "NOTYPE.REF" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NOTYPE.LABS", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: locale === "es" ? "Plugins" : "Plugins", item: `${SITE_URL}${prefix}/plugins` },
        { "@type": "ListItem", position: 3, name: plugin.name, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <main lang={locale === "en" ? "en" : "es"} className="min-h-screen bg-black px-5 pb-32 pt-28 text-white md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-[1120px]">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href={`${prefix}/plugins`} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white">← {ui.back}</Link>
          <Link href={`${alternatePrefix}/plugins/${plugin.slug}`} hrefLang={locale === "es" ? "en" : "es"} className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white">{ui.language} →</Link>
        </nav>

        <header className="grid overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950/60 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-square min-h-[360px] overflow-hidden bg-zinc-900 lg:aspect-auto">
            <Image src={plugin.image} alt={`${plugin.name} ${plugin.tagline} VST3 plugin interface`} fill sizes="(max-width: 1024px) 100vw, 460px" className="object-cover" priority />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">{copy.eyebrow}</p>
            <h1 className="mt-5 text-6xl font-black uppercase italic leading-[0.84] tracking-tighter md:text-8xl lg:text-6xl">{plugin.name}</h1>
            <p className="mt-6 text-xl font-black uppercase italic tracking-tight text-zinc-300 md:text-2xl">{copy.headline}</p>
            <p className="mt-6 text-sm leading-relaxed text-zinc-400 md:text-base">{copy.shortDescription}</p>
            <div className="mt-9 flex items-end justify-between gap-5 border-t border-zinc-800 pt-7">
              <div><p className="text-4xl font-black italic tracking-tighter">USD {plugin.price}</p><p className="mt-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-600">{ui.once}</p></div>
              <span className="rounded-full border border-zinc-700 px-4 py-2 text-[9px] font-black uppercase tracking-widest">{plugin.operatingSystem} · {plugin.format}</span>
            </div>
            <GumroadLink href={plugin.gumroadUrl} product={plugin.slug} locale={locale} placement="detail_hero" className="mt-8 rounded-full bg-red-600 px-7 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.22)] transition-all hover:bg-red-700 hover:shadow-[0_0_38px_rgba(220,38,38,0.38)]">{ui.buy} →</GumroadLink>
            <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-600">{ui.gumroad}</p>
          </div>
        </header>

        <section className="grid gap-12 border-b border-zinc-900 py-20 lg:grid-cols-[0.65fr_1.35fr]">
          <div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">{ui.about}</p><h2 className="mt-5 text-4xl font-black uppercase italic tracking-tighter md:text-6xl">{copy.headline}</h2></div>
          <div className="space-y-6 text-base leading-relaxed text-zinc-400 md:text-lg">{copy.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section className="py-20" aria-labelledby="features-title">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">{ui.includes}</p>
          <h2 id="features-title" className="mt-5 max-w-4xl text-4xl font-black uppercase italic tracking-tighter md:text-6xl">{copy.featureTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {copy.features.map((feature, index) => <article key={feature.title} className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-7"><div className="text-[9px] font-black tracking-[0.3em] text-red-600">0{index + 1}</div><h3 className="mt-7 text-2xl font-black uppercase italic tracking-tight">{feature.title}</h3><p className="mt-4 text-sm leading-relaxed text-zinc-500">{feature.description}</p></article>)}
          </div>
        </section>

        <section className="grid gap-6 pb-20 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-zinc-900 bg-zinc-950/50 p-8 md:p-10"><p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600">{ui.forWho}</p><ul className="mt-7 space-y-4">{copy.idealFor.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-300"><span className="text-red-600">●</span>{item}</li>)}</ul></div>
          <div className="rounded-[2rem] border border-zinc-900 bg-zinc-950/50 p-8 md:p-10"><p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600">{ui.compatibility}</p><dl className="mt-7 space-y-5 text-sm"><div className="flex justify-between gap-5 border-b border-zinc-900 pb-4"><dt className="text-zinc-600">OS</dt><dd className="font-bold">{plugin.operatingSystem}</dd></div><div className="flex justify-between gap-5 border-b border-zinc-900 pb-4"><dt className="text-zinc-600">Format</dt><dd className="font-bold">{plugin.format}</dd></div><div className="flex justify-between gap-5"><dt className="text-zinc-600">{ui.tested}</dt><dd className="text-right font-bold">{plugin.testedHosts.join(" · ")}</dd></div></dl></div>
        </section>

        <section className="border-t border-zinc-900 py-20" aria-labelledby="faq-title">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">FAQ</p><h2 id="faq-title" className="mt-5 text-4xl font-black uppercase italic tracking-tighter md:text-6xl">{ui.faq}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{copy.faq.map((item) => <article key={item.question} className="rounded-3xl border border-zinc-900 p-7"><h3 className="text-lg font-black uppercase italic tracking-tight">{item.question}</h3><p className="mt-4 text-sm leading-relaxed text-zinc-500">{item.answer}</p></article>)}</div>
        </section>

        <section className="mx-auto grid max-w-[960px] overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950/60 md:grid-cols-[0.7fr_1.3fr]">
          <Link href={`${prefix}/plugins/${related.slug}`} className="relative aspect-square overflow-hidden"><Image src={related.image} alt={`${related.name} VST3 plugin`} fill sizes="(max-width: 768px) 100vw, 315px" className="object-cover transition-transform duration-700 hover:scale-[1.025]" /></Link>
          <div className="flex flex-col justify-center p-8 md:p-12"><p className="text-[10px] font-black uppercase tracking-[0.35em] text-red-600">{ui.related}</p><h2 className="mt-4 text-5xl font-black uppercase italic tracking-tighter">{related.name}</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400">{related.copy[locale].shortDescription}</p><Link href={`${prefix}/plugins/${related.slug}`} className="mt-7 w-fit rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors hover:border-white">{ui.relatedAction} →</Link></div>
        </section>

        <div className="mx-auto mt-12 max-w-4xl text-center"><p className="text-xs leading-relaxed text-zinc-700">{ui.notice}</p></div>
      </div>
    </main>
  );
}
