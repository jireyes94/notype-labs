"use client";
import { Beat } from "./AudioContext";

export default function BeatModal({ beat, onClose }: { beat: Beat; onClose: () => void }) {
  const buy = (license: string) => {
    const phoneNumber = "5492214379913";
    const msg = encodeURIComponent(`Hola! Me contacto para adquirir la licencia *${license}* de *${beat.title}*.`);
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
  };

  // Pre-calculamos los precios para mayor claridad
  const mp3Price = beat.price;
  const wavPrice = beat.price * 1.5;
  const unlimitedPrice = beat.price * 4;

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-zinc-950 w-full max-w-lg rounded-t-3xl md:rounded-3xl border-t md:border border-zinc-900 overflow-hidden animate-fade-in shadow-2xl">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 md:hidden" onClick={onClose} />

        <div className="p-6 md:p-8">
          {/* AVISO DE VENDIDO SI CORRESPONDE */}
          {beat.is_sold && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-2xl text-center">
              <p className="text-red-500 font-black uppercase text-xs tracking-tighter italic">Este beat ya fue vendido</p>
              <p className="text-zinc-500 text-[10px] uppercase mt-1">No está disponible para nuevas licencias</p>
            </div>
          )}
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-4 items-center">
              {/* REFERENCIA ACTUALIZADA: Prioriza cover_url de la DB */}
              <img 
                src={beat.cover_url || `/covers/${beat.slug}.jpg`} 
                className="w-16 h-16 rounded-lg object-cover border border-zinc-800" 
                alt={beat.title} 
              />
              <div>
              <h2 className="text-2xl font-black uppercase italic leading-none">{beat.title}</h2>
              <p className="text-zinc-500 text-[10px] tracking-widest mt-1 font-bold italic">
                {beat.bpm} BPM • Key: {beat.key} • {(Array.isArray(beat.mood) ? beat.mood : [beat.mood]).map(tag => `#${tag.toLowerCase()}`).join(" ")}
              </p>
            </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl hidden md:block transition-colors">✕</button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Selecciona una licencia</p>

            {/* MP3 Lease */}
            <button 
              onClick={() => buy("MP3 Lease")}
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all text-left group"
            >
              <div>
                <p className="font-bold text-sm uppercase group-hover:text-red-500 transition-colors">MP3 Lease</p>
                <p className="text-[9px] text-zinc-500 uppercase font-medium">Uso básico / 50k Streams</p>
              </div>
              <span className="font-black text-lg">${mp3Price.toLocaleString('es-AR')}</span>
            </button>

            {/* WAV Premium */}
            <button 
              onClick={() => buy("WAV Premium")}
              className="flex items-center justify-between p-4 bg-red-600 rounded-2xl hover:bg-red-700 transition-all text-left shadow-[0_0_20px_rgba(220,38,38,0.2)]"
            >
              <div>
                <p className="font-bold text-sm uppercase text-white">WAV Premium</p>
                <p className="text-[9px] text-red-100 uppercase font-black tracking-widest">Alta calidad / Comercial</p>
              </div>
              <span className="font-black text-lg text-white">${wavPrice.toLocaleString('es-AR')}</span>
            </button>

            {/* Unlimited */}
            <button 
              onClick={() => buy("Unlimited")}
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all text-left group"
            >
              <div>
                <p className="font-bold text-sm uppercase group-hover:text-red-500 transition-colors">Unlimited</p>
                <p className="text-[9px] text-zinc-500 uppercase font-medium">Stems / Uso ilimitado</p>
              </div>
              <span className="font-black text-lg">${unlimitedPrice.toLocaleString('es-AR')}</span>
            </button>
          </div>

          <button onClick={onClose} className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 border border-zinc-900 rounded-xl md:hidden">
            Cerrar
          </button>

          {!beat.is_sold && (
            <div className="flex flex-col gap-3">
               {/* Aquí tus botones de licencia actuales */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}