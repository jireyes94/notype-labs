import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase'; // Importa tu cliente de supabase
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Páginas estáticas
  const routes = ['', '/licenses', '/contact', '/terms', '/privacy', '/refund'].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // Consultar beats dinámicamente de Supabase
  const { data: beats, error } = await supabase
    .from('beats')
    .select('slug, created_at')
    .not('slug', 'is', null);

  if (error) {
    console.error('No se pudieron cargar los beats para el sitemap', error.message);
  }
  
  const beatRoutes = (beats || []).map((beat) => ({
    url: `${baseUrl}/beats/${beat.slug}`,
    lastModified: beat.created_at ? new Date(beat.created_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...beatRoutes];
}
