import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import BeatPageClient from "./BeatPageClient";
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/site';
import RelatedBeats, { type RelatedBeat } from '@/components/RelatedBeats';
import { cache } from 'react';

export const dynamicParams = true;

type BeatRecord = {
  id?: number | string;
  slug: string;
  title: string;
  bpm: number;
  key: string;
  mood: string | string[];
  price: number;
  mp3_url?: string;
  cover_url?: string;
  created_at?: string;
  is_sold: boolean;
};

const getBeat = cache(async (slug: string): Promise<BeatRecord | null> => {
  const { data, error } = await supabase
    .from('beats')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data as BeatRecord;
});

function getMoods(mood: string | string[] | null): string[] {
  if (!mood) return [];
  const values = Array.isArray(mood) ? mood : mood.split(',');
  return values.map((value) => value.trim()).filter(Boolean);
}

async function getRelatedBeats(currentBeat: BeatRecord): Promise<RelatedBeat[]> {
  const { data, error } = await supabase
    .from('beats')
    .select('id, slug, title, bpm, key, mood, price, cover_url, is_sold')
    .neq('slug', currentBeat.slug)
    .limit(100);

  if (error) {
    console.error('No se pudieron cargar los beats relacionados', error.message);
    return [];
  }

  const currentMoods = new Set(getMoods(currentBeat.mood).map((mood) => mood.toLowerCase()));

  return ((data ?? []) as RelatedBeat[])
    .filter((beat) => beat.slug && beat.title && !beat.is_sold)
    .map((beat) => {
      const sharedMoods = getMoods(beat.mood)
        .filter((mood) => currentMoods.has(mood.toLowerCase()))
        .length;
      const bpmDistance = Math.abs(Number(beat.bpm) - Number(currentBeat.bpm));

      return { beat, score: sharedMoods * 100 - Math.min(bpmDistance, 60) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ beat }) => beat);
}

// 1. GENERACIÓN DE METADATA (Para SEO)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  const beat = await getBeat(slug);

  if (!beat) return { title: "Beat no encontrado" };

  const imageUrl = beat.cover_url || `${SITE_URL}/covers/${beat.slug}.jpg`;
  const moods = getMoods(beat.mood);
  const primaryMood = moods[0] || 'urbano';
  const moodLabel = moods.join(', ');

  return {
    title: `${beat.title} – Beat de ${primaryMood} ${beat.bpm} BPM`,
    description: `Escuchá y comprá la licencia del beat "${beat.title}" de ${primaryMood}, ${beat.bpm} BPM y tonalidad ${beat.key}. Producido por NOTYPE.LABS en Argentina.`,
    alternates: {
      canonical: `/beats/${slug}`,
    },
    robots: beat.is_sold ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${beat.title} - Beat Instrumental`,
      description: `BPM: ${beat.bpm} | Tonalidad: ${beat.key} | Estilo: ${moodLabel}. Disponible en NOTYPE.LABS.`,
      url: `${SITE_URL}/beats/${slug}`,
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
  const beat = await getBeat(slug);

  // Si el beat no existe en Supabase, esta línea detiene la ejecución 
  // y muestra automáticamente el archivo app/not-found.tsx
  if (!beat) {
    notFound();
  }

  const relatedBeats = await getRelatedBeats(beat);
  const beatForClient = {
    ...beat,
    preview: beat.mp3_url || '',
  };
  const moods = getMoods(beat.mood);
  const imageUrl = beat.cover_url || `${SITE_URL}/covers/${beat.slug}.jpg`;
  const pageUrl = `${SITE_URL}/beats/${beat.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${pageUrl}#product`,
        name: `${beat.title} - Beat instrumental`,
        description: `Beat de ${moods[0] || 'música urbana'} a ${beat.bpm} BPM en tonalidad ${beat.key}.`,
        image: imageUrl,
        sku: beat.slug,
        category: 'Beat instrumental',
        brand: {
          '@type': 'Brand',
          name: 'NOTYPE.LABS',
        },
        offers: {
          '@type': 'Offer',
          url: pageUrl,
          priceCurrency: 'ARS',
          price: Number(beat.price),
          availability: beat.is_sold
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'BPM', value: beat.bpm },
          { '@type': 'PropertyValue', name: 'Tonalidad', value: beat.key },
          { '@type': 'PropertyValue', name: 'Estilos', value: moods.join(', ') },
        ],
      },
      {
        '@type': 'MusicRecording',
        '@id': `${pageUrl}#recording`,
        name: beat.title,
        url: pageUrl,
        image: imageUrl,
        genre: moods,
        byArtist: {
          '@type': 'MusicGroup',
          name: 'NOTYPE.LABS',
          url: SITE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beats',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: beat.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <BeatPageClient beatFromDB={beatForClient} />
      <RelatedBeats beats={relatedBeats} />
    </>
  );
}
