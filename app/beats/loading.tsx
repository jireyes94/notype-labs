export default function BeatsLoading() {
  return (
    <div className="min-h-screen bg-black text-white pb-40">
      {/* Header Skeleton */}
      <div className="py-8 px-8 border-b border-zinc-900 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <div className="h-10 w-64 bg-zinc-900 animate-pulse rounded-lg" />
          <div className="h-4 w-48 bg-zinc-900/50 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton - Emparejado con tu grilla actual */}
      <div className="p-4 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 max-w-[1600px] mx-auto">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col">
            {/* Espacio para la imagen (el cover art que ahora es aspect-square) */}
            <div className="aspect-square w-full bg-zinc-900 animate-pulse" />
            
            {/* Espacio para el texto de info */}
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-zinc-900 animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-zinc-800 animate-pulse rounded" />
              <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                <div className="h-6 w-16 bg-zinc-900 animate-pulse rounded" />
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}