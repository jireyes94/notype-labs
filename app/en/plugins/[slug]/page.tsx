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
  const copy = plugin.copy.en;
  return {
    title: `${plugin.name}: vocal VST3 plugin for Windows`,
    description: `${copy.shortDescription} Tested in FL Studio, Ableton Live and REAPER. Digital download for USD ${plugin.price}.`,
    keywords: plugin.slug === "micmodeler" ? ["microphone modeling VST3", "vocal correction plugin", "budget microphone plugin", "home studio vocal VST"] : ["vocal finisher plugin", "asymmetric saturation VST", "home studio vocal cleaner", "dynamic EQ vocal plugin"],
    alternates: {
      canonical: `/en/plugins/${plugin.slug}`,
      languages: { es: `/plugins/${plugin.slug}`, en: `/en/plugins/${plugin.slug}`, "x-default": `/en/plugins/${plugin.slug}` },
    },
    openGraph: { title: `${plugin.name} | Vocal VST3 plugin`, description: copy.shortDescription, url: `/en/plugins/${plugin.slug}`, locale: "en_US", type: "website", images: [{ url: plugin.image, width: 600, height: 600, alt: `${plugin.name} vocal VST3 plugin` }] },
    twitter: { card: "summary_large_image", title: `${plugin.name} | NOTYPE.REF`, description: copy.shortDescription, images: [plugin.image] },
  };
}

export default async function EnglishPluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();
  return <PluginDetailPage plugin={plugin} locale="en" />;
}
