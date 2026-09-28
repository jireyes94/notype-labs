import type { Metadata } from "next";
import PluginCatalogPage from "@/components/PluginCatalogPage";

export const metadata: Metadata = {
  title: "Vocal VST3 plugins for home studios",
  description: "Affordable Windows VST3 plugins for cleaning, shaping and finishing home-studio vocals. Get MicModeler and Pure Type for USD 0.99.",
  keywords: ["vocal VST3 plugin", "home studio vocal plugin", "microphone modeling VST", "vocal cleaner plugin", "NOTYPE REF"],
  alternates: {
    canonical: "/en/plugins",
    languages: { es: "/plugins", en: "/en/plugins", "x-default": "/en/plugins" },
  },
  openGraph: {
    title: "Vocal VST3 plugins | NOTYPE.REF",
    description: "Vocal correction, character and finishing tools for producers recording at home.",
    url: "/en/plugins",
    locale: "en_US",
    images: [{ url: "/plugins/micmodeler.jpeg", width: 600, height: 600, alt: "NOTYPE.REF vocal VST3 plugins" }],
  },
  twitter: { card: "summary_large_image", images: ["/plugins/micmodeler.jpeg"] },
};

export default function EnglishPluginsPage() {
  return <PluginCatalogPage locale="en" />;
}
