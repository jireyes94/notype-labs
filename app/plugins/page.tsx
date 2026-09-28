import type { Metadata } from "next";
import PluginCatalogPage from "@/components/PluginCatalogPage";

export const metadata: Metadata = {
  title: "Plugins VST3 para voces y home studio",
  description: "Plugins VST3 para Windows creados para limpiar, modelar y terminar voces grabadas en home studios. MicModeler y Pure Type por USD 0.99.",
  keywords: ["plugins VST3 para voces", "plugin para mejorar voces", "plugins home studio", "VST para micrófono", "NOTYPE REF"],
  alternates: {
    canonical: "/plugins",
    languages: { es: "/plugins", en: "/en/plugins", "x-default": "/en/plugins" },
  },
  openGraph: {
    title: "Plugins VST3 para voces | NOTYPE.REF",
    description: "Corrección, modelado y acabado vocal para productores y artistas que graban en casa.",
    url: "/plugins",
    locale: "es_AR",
    images: [{ url: "/plugins/micmodeler.jpeg", width: 600, height: 600, alt: "Plugins vocales VST3 de NOTYPE.REF" }],
  },
  twitter: { card: "summary_large_image", images: ["/plugins/micmodeler.jpeg"] },
};

export default function PluginsPage() {
  return <PluginCatalogPage locale="es" />;
}
