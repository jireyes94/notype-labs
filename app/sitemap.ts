import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase'; // Importa tu cliente de supabase

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notypelabs.vercel.app';

  // Páginas estáticas
  const routes = ['', '/beats', '/licenses', '/contact'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));

  // Consultar beats dinámicamente de Supabase
  const { data: beats } = await supabase.from('beats').select('slug');
  
  const beatRoutes = (beats || []).map((beat) => ({
    url: `${baseUrl}/beats/${beat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...beatRoutes];
}