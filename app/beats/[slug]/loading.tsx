export default function BeatDetailLoading() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Fondo simulado */}
      <div className="absolute inset-0 bg-zinc-950" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        <div className="flex flex-col lg:row lg:flex-row gap-10 justify-between">
          
          {/* LADO IZQUIERDO: Título e Imagen */}
          <div className="w-full lg:max-w-[65%] space-y-8">
            <div className="space-y-4">
              <div className="h-20 md:h-32 w-full bg-zinc-900 animate-pulse rounded-2xl" />
              <div className="h-4 w-48 bg-zinc-900/50 animate-pulse rounded" />
            </div>
            
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div className="w-44 h-44 md:w-52 md:h-52 bg-zinc-900 animate-pulse rounded-xl" />
              <div className="space-y-3 flex-1">
                <div className="h-3 w-24 bg-zinc-900 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-zinc-900/50 animate-pulse rounded-lg" />
                  <div className="h-8 w-20 bg-zinc-900/50 animate-pulse rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Licencias */}
          <div className="w-full lg:max-w-[400px]">
            <div className="bg-zinc-900/30 border border-zinc-900 p-8 rounded-[2rem] space-y-4">
              <div className="h-3 w-32 bg-zinc-900 animate-pulse rounded mx-auto mb-6" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 w-full bg-zinc-900/50 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}