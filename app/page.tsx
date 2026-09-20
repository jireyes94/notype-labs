import type { Metadata } from "next";
import HomeCatalog from "@/components/HomeCatalog";
import type { Beat } from "@/components/AudioContext";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "NOTYPE.LABS | Beats originales para artistas" },
  description:
    "Comprá beats originales de trap, reggaetón, drill, rap y R&B en Argentina. Licencias claras, precios en pesos y entrega digital.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NOTYPE.LABS | Beats originales para artistas",
    description:
      "Beats originales con licencias para artistas, precios en pesos y entrega digital.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOTYPE.LABS | Beats originales para artistas",
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

function selectPromotionalBeats(beats: Beat[]): Beat[] {
  const pricedBeats = beats.filter((beat) => Number.isFinite(Number(beat.price)) && Number(beat.price) > 0);
  if (!pricedBeats.length) return [];

  const averagePrice = pricedBeats.reduce((total, beat) => total + Number(beat.price), 0) / pricedBeats.length;
  const candidates = pricedBeats.filter((beat) => !beat.is_sold && Number(beat.price) < averagePrice);
  if (candidates.length === 1) return candidates;

  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, candidates.length === 2 ? 1 : 3);
}

export default async function HomePage() {
  const beats = await getBeats();
  const promotionalBeats = selectPromotionalBeats(beats);

  return <HomeCatalog initialBeats={beats} promotionalBeats={promotionalBeats} />;
}
