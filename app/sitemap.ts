import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase'; // Importa tu cliente de supabase
import { SITE_URL } from '@/lib/site';
import { GENRES } from '@/lib/genres';
import { GUIDES } from '@/lib/guides';
import { AUDIO_PLUGINS } from '@/lib/plugins';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Páginas estáticas
  const routes = ['', '/generos', '/guias', '/sobre-notype-labs', '/licenses', '/faq', '/contact', '/terms', '/privacy', '/refund', '/plugins', '/en/plugins'].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : ['/generos', '/licenses', '/plugins', '/en/plugins'].includes(route) ? 0.8 : 0.5,
  }));

  const pluginRoutes = AUDIO_PLUGINS.flatMap((plugin) => [
    {
      url: `${baseUrl}/plugins/${plugin.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: { languages: { es: `${baseUrl}/plugins/${plugin.slug}`, en: `${baseUrl}/en/plugins/${plugin.slug}`, 'x-default': `${baseUrl}/en/plugins/${plugin.slug}` } },
    },
    {
      url: `${baseUrl}/en/plugins/${plugin.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: { languages: { es: `${baseUrl}/plugins/${plugin.slug}`, en: `${baseUrl}/en/plugins/${plugin.slug}`, 'x-default': `${baseUrl}/en/plugins/${plugin.slug}` } },
    },
  ]);

  const genreRoutes = GENRES.map((genre) => ({
    url: `${baseUrl}/generos/${genre.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const guideRoutes = GUIDES.map((guide) => ({
    url: `${baseUrl}/guias/${guide.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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

  return [...routes, ...pluginRoutes, ...genreRoutes, ...guideRoutes, ...beatRoutes];
}
