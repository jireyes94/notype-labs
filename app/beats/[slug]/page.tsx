import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import BeatPageClient from "./BeatPageClient";
import { notFound } from 'next/navigation';

export const dynamicParams = true;

// 1. GENERACIÓN DE METADATA (Para SEO)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: beat } = await supabase
    .from('beats')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!beat) return { title: "Beat no encontrado" };

  const imageUrl = beat.cover_url || `https://notypelabs.vercel.app/covers/${beat.slug}.jpg`;

  return {
    title: `${beat.title} (${beat.bpm} BPM) - ${beat.key}`,
    description: `Escuchá y comprá la licencia de "${beat.title}". Mood: ${beat.mood} | Producido por NOTYPE.LABS`,
    openGraph: {
      title: `${beat.title} - Beat Instrumental`,
      description: `BPM: ${beat.bpm} | Key: ${beat.key} | Mood: ${beat.mood}. Disponible ahora en NOTYPE.LABS.`,
      url: `https://notypelabs.vercel.app/beats/${slug}`,
      siteName: "NOTYPE.LABS",
      images: [{ url: imageUrl, width: 800, height: 800 }],
      type: "music.song",
    },
    twitter: {
      card: "summary_large_image",
      title: beat.title,
      description: `Beat Instrumental - ${beat.bpm} BPM`,
      images: [imageUrl],
    },
  };
}

// 2. COMPONENTE DE PÁGINA (Único Export Default)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: beat } = await supabase
    .from('beats')
    .select('*')
    .eq('slug', slug)
    .single();

  // Si el beat no existe en Supabase, esta línea detiene la ejecución 
  // y muestra automáticamente el archivo app/not-found.tsx
  if (!beat) {
    notFound();
  }

  return <BeatPageClient beatFromDB={beat} />;
}