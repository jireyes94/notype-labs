import type { Metadata } from "next";
import HomeCatalog from "@/components/HomeCatalog";
import type { Beat } from "@/components/AudioContext";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comprar beats en Argentina | Trap, reggaetón y rap",
  description:
    "Comprá beats originales de trap, reggaetón, drill, rap y R&B en Argentina. Licencias claras, precios en pesos y entrega digital.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Comprar beats en Argentina | NOTYPE.LABS",
    description:
      "Beats originales con licencias para artistas, precios en pesos y entrega digital.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comprar beats en Argentina | NOTYPE.LABS",
    description: "Beats originales con licencias, checkout online y precios en pesos argentinos.",
  },
};

async function getBeats(): Promise<Beat[]> {
  const { data, error } = await supabase
    .from("beats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("No se pudo cargar el catálogo de beats", error.message);
    return [];
  }

  return (data ?? []).map((beat) => ({
    ...beat,
    preview: beat.mp3_url,
    cover_url: beat.cover_url,
  })) as Beat[];
}

export default async function HomePage() {
  const beats = await getBeats();

  return <HomeCatalog initialBeats={beats} />;
}
