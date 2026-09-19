import Link from 'next/link';

export type RelatedBeat = {
  id?: number | string;
  slug: string;
  title: string;
  bpm: number;
  key: string;
  mood: string | string[] | null;
  price: number;
  cover_url?: string;
  is_sold: boolean;
};

export default function RelatedBeats({ beats }: { beats: RelatedBeat[] }) {
  if (beats.length === 0) return null;

  return (
    <section className="relative z-10 bg-black px-4 pb-40 pt-8 text-white md:px-8" aria-labelledby="related-beats-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-red-600">
              Seguí explorando
            </p>
            <h2 id="related-beats-title" className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">
              Beats relacionados
            </h2>
          </div>
          <Link href="/#catalogo" className="hidden text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white sm:block">
            Ver catálogo completo
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {beats.map((beat) => (
            <Link
              key={beat.id ?? beat.slug}
              href={`/beats/${beat.slug}`}
              className="group overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 transition-colors hover:border-red-600/60"
            >
              <div className="aspect-square overflow-hidden bg-zinc-900">
                <img
                  src={beat.cover_url || `/covers/${beat.slug}.jpg`}
                  alt={`Portada del beat ${beat.title}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="truncate text-base font-black uppercase italic tracking-tight transition-colors group-hover:text-red-500">
                  {beat.title}
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  {beat.bpm} BPM · {beat.key}
                </p>
                <p className="text-sm font-black italic text-white">
                  Desde ${Number(beat.price).toLocaleString('es-AR')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/#catalogo" className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white sm:hidden">
          Ver catálogo completo
        </Link>
      </div>
    </section>
  );
}
