import Image from "next/image";
import Link from "next/link";
import GumroadLink from "@/components/GumroadLink";
import { AUDIO_PLUGINS, GUMROAD_CATALOG_URL, type PluginLocale } from "@/lib/plugins";
import { SITE_URL } from "@/lib/site";

const UI = {
  es: {
    eyebrow: "NOTYPE.REF · Plugins de audio",
    title: "Herramientas pequeñas. Decisiones grandes.",
    intro: "Plugins VST3 accesibles para productores y artistas que graban voces en casa. Menos menús, menos cadenas interminables y más tiempo para escuchar qué necesita la canción.",
    language: "English version",
    languageHref: "/en/plugins",
    view: "Explorar plugin",
    buy: "Comprar por USD 0.99",
    store: "Ver catálogo en Gumroad",
    section: "Dos formas de terminar mejor una voz",
    footerTitle: "Tu grabación no necesita una excusa. Necesita una dirección.",
    footerCopy: "MicModeler corrige y redefine el carácter desde la fuente. Pure Type trabaja como última etapa para limpiar, enfocar y terminar la voz.",
  },
  en: {
    eyebrow: "NOTYPE.REF · Audio plugins",
    title: "Small tools. Decisive sound.",
    intro: "Accessible VST3 plugins for producers and artists recording vocals at home. Fewer menus, fewer endless chains and more time to hear what the song actually needs.",
    language: "Versión en español",
    languageHref: "/plugins",
    view: "Explore plugin",
    buy: "Buy for USD 0.99",
    store: "View Gumroad catalog",
    section: "Two ways to finish a vocal",
    footerTitle: "Your recording does not need an excuse. It needs direction.",
    footerCopy: "MicModeler corrects the source and reshapes its character. Pure Type acts as the final stage to clean, focus and finish the vocal.",
  },
} as const;

export default function PluginCatalogPage({ locale }: { locale: PluginLocale }) {
  const ui = UI[locale];
  const prefix = locale === "en" ? "/en" : "";
  const pageUrl = `${SITE_URL}${prefix}/plugins`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#collection`,
    name: locale === "es" ? "Plugins VST3 para voces de NOTYPE.REF" : "NOTYPE.REF vocal VST3 plugins",
    url: pageUrl,
    inLanguage: locale,
    description: ui.intro,
    hasPart: AUDIO_PLUGINS.map((plugin) => ({
      "@type": "SoftwareApplication",
      name: plugin.name,
      url: `${SITE_URL}${prefix}/plugins/${plugin.slug}`,
      applicationCategory: "MultimediaApplication",
      operatingSystem: plugin.operatingSystem,
    })),
  };

  return (
    <main lang={locale === "en" ? "en" : "es"} className="min-h-screen overflow-hidden bg-black px-5 pb-32 pt-32 text-white md:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-[1100px]">
        <header className="relative border-b border-zinc-900 pb-16">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-700/10 blur-[120px]" />
          <div className="relative max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-red-600">{ui.eyebrow}</p>
              <Link href={ui.languageHref} hrefLang={locale === "es" ? "en" : "es"} className="text-[10px] font-black uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white">{ui.language} →</Link>
            </div>
            <h1 className="mt-7 max-w-5xl text-5xl font-black uppercase italic leading-[0.9] tracking-tighter sm:text-7xl lg:text-9xl">{ui.title}</h1>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">{ui.intro}</p>
          </div>
        </header>

        <section className="py-16" aria-labelledby="plugin-catalog-title">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <h2 id="plugin-catalog-title" className="max-w-3xl text-3xl font-black uppercase italic tracking-tighter md:text-5xl">{ui.section}</h2>
            <GumroadLink href={GUMROAD_CATALOG_URL} product="catalog" locale={locale} placement="catalog_header" className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white">{ui.store} →</GumroadLink>
          </div>

          <div className="mx-auto grid max-w-[900px] gap-6 lg:grid-cols-2">
            {AUDIO_PLUGINS.map((plugin) => {
              const copy = plugin.copy[locale];
              return (
                <article key={plugin.slug} className="group overflow-hidden rounded-[2rem] border border-zinc-900 bg-zinc-950/60 transition-colors hover:border-red-600/50">
                  <Link href={`${prefix}/plugins/${plugin.slug}`} className="relative block aspect-square overflow-hidden bg-zinc-900 lg:aspect-[4/3]">
                    <Image src={plugin.image} alt={`${plugin.name} ${plugin.tagline} VST3 plugin interface`} fill sizes="(max-width: 1024px) 100vw, 430px" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" priority={plugin.slug === "micmodeler"} />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-[9px] font-black uppercase tracking-[0.25em] backdrop-blur-md">Windows · VST3</span>
                  </Link>
                  <div className="p-7 md:p-9 lg:p-7">
                    <div className="flex items-start justify-between gap-5">
                      <div><p className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">{copy.eyebrow}</p><h2 className="mt-3 text-4xl font-black uppercase italic tracking-tighter lg:text-3xl">{plugin.name}</h2></div>
                      <p className="whitespace-nowrap text-xl font-black italic">USD {plugin.price}</p>
                    </div>
                    <p className="mt-5 min-h-20 text-sm leading-relaxed text-zinc-400 lg:min-h-0">{copy.shortDescription}</p>
                    <div className="mt-8 flex flex-wrap gap-3 lg:mt-6">
                      <Link href={`${prefix}/plugins/${plugin.slug}`} className="rounded-full border border-zinc-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors hover:border-white">{ui.view}</Link>
                      <GumroadLink href={plugin.gumroadUrl} product={plugin.slug} locale={locale} placement="catalog_card" className="rounded-full bg-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-red-700">{ui.buy}</GumroadLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-900 bg-gradient-to-br from-zinc-950 to-black p-8 md:p-14">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">NOTYPE.REF</p>
          <h2 className="mt-5 max-w-4xl text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">{ui.footerTitle}</h2>
          <p className="mt-6 max-w-3xl leading-relaxed text-zinc-400">{ui.footerCopy}</p>
        </section>
      </div>
    </main>
  );
}
