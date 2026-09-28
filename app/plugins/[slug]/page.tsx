import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PluginDetailPage from "@/components/PluginDetailPage";
import { AUDIO_PLUGINS, getPlugin } from "@/lib/plugins";

export function generateStaticParams() {
  return AUDIO_PLUGINS.map((plugin) => ({ slug: plugin.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) return {};
  const copy = plugin.copy.es;
  return {
    title: `${plugin.name}: plugin VST3 para voces en Windows`,
    description: `${copy.shortDescription} Compatible con FL Studio, Ableton Live y REAPER. Descarga digital por USD ${plugin.price}.`,
    keywords: plugin.slug === "micmodeler" ? ["plugin modelador de micrófono", "mejorar micrófono barato", "VST3 para voces", "plugin U87 voz"] : ["vocal finisher VST", "saturación vocal plugin", "limpiar voces home studio", "ecualizador dinámico vocal"],
    alternates: {
      canonical: `/plugins/${plugin.slug}`,
      languages: { es: `/plugins/${plugin.slug}`, en: `/en/plugins/${plugin.slug}`, "x-default": `/en/plugins/${plugin.slug}` },
    },
    openGraph: { title: `${plugin.name} | Plugin vocal VST3`, description: copy.shortDescription, url: `/plugins/${plugin.slug}`, locale: "es_AR", type: "website", images: [{ url: plugin.image, width: 600, height: 600, alt: `${plugin.name} plugin VST3 para voces` }] },
    twitter: { card: "summary_large_image", title: `${plugin.name} | NOTYPE.REF`, description: copy.shortDescription, images: [plugin.image] },
  };
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();
  return <PluginDetailPage plugin={plugin} locale="es" />;
}
