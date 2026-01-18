"use client";
import { useEffect, useState } from "react";
import { useAudio, Beat } from "./AudioContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BeatModal({ beat, onClose }: { beat: Beat; onClose: () => void }) {
  const { playBeat, currentBeat, isPlaying } = useAudio();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [editData, setEditData] = useState({
    title: beat.title,
    bpm: beat.bpm.toString(),
    key: beat.key,
    mood: Array.isArray(beat.mood) ? beat.mood.join(", ") : beat.mood,
    price: beat.price.toString()
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAdmin(true);
    };
    checkAdmin();
    // Bloquear scroll del body al abrir
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('beats')
      .update({
        title: editData.title,
        bpm: parseInt(editData.bpm),
        key: editData.key,
        mood: editData.mood.split(",").map(m => m.trim()),
        price: parseInt(editData.price)
      })
      .eq('id', beat.id);

    if (!error) {
      setIsEditing(false);
      router.refresh();
      onClose();
    }
    setLoading(false);
  };

  const buy = (license: string, price: number) => {
    const phoneNumber = "5492214379913";
    const msg = encodeURIComponent(`Hola! Me contacto para adquirir la licencia *${license}* de *${beat.title}* por un valor de $${price.toLocaleString('es-AR')}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
  };

  const mp3Price = beat.price;
  const wavPrice = beat.price * 1.5;
  const unlimitedPrice = beat.price * 4;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Overlay - Se cierra al hacer click fuera */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      {/* SIDEBAR PANEL */}
      <div className={`
        relative bg-[#050505] w-full md:w-[450px] h-full shadow-2xl border-l border-white/5 
        flex flex-col transition-transform duration-500 ease-out animate-slide-left pb-32 md:pb-40
      `}>

        {/* FONDO DESENFOCADO (Estilo BeatPageClient) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
           <img 
            src={beat.cover_url} 
            alt="" 
            className="w-full h-full object-cover blur-[50px] scale-120"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
        </div>
        
        {/* HEADER: Close & Admin Toggle */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <button onClick={onClose} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Cerrar</span>
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white text-black rounded-full hover:bg-red-600 hover:text-white transition-all"
            >
              {isEditing ? "Ver Vista Previa" : "Editar Datos"}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {/* ARTE Y TÍTULO (Estilo BeatPageClient) */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img src={beat.cover_url} alt={beat.title} className="w-full h-full object-cover" />
              <button 
                onClick={() => playBeat(beat)}
                className="absolute inset-0 m-auto w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
              >
                {currentBeat?.id === beat.id && isPlaying ? 
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg> :
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xl font-black italic" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs uppercase" value={editData.bpm} onChange={e => setEditData({...editData, bpm: e.target.value})} placeholder="BPM" />
                  <input className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs uppercase" value={editData.key} onChange={e => setEditData({...editData, key: e.target.value})} placeholder="KEY" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{beat.title}</h2>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Frecuencia</span>
                    <span className="text-sm font-bold">{beat.bpm} BPM</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-6">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Tonalidad</span>
                    <span className="text-sm font-bold text-red-600">{beat.key}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LICENCIAS (Cuerpo de Sidebar) */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4">Seleccionar Licencia</h3>
            
            {[
              { id: "MP3", name: "MP3 Standard", desc: "Uso básico / Streaming limitado", p: mp3Price },
              { id: "WAV", name: "WAV Premium", desc: "Alta calidad / Uso comercial", p: wavPrice },
              { id: "Unlimited", name: "Unlimited", desc: "Uso ilimitado / Stems", p: unlimitedPrice }
            ].map((lic) => (
              <button 
                key={lic.id}
                onClick={() => buy(lic.name, lic.p)}
                className="w-full group flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.07] hover:border-red-600/50 transition-all"
              >
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">{lic.name}</p>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1 font-bold">{lic.desc}</p>
                </div>
                <span className="text-xl font-black italic tracking-tighter">${lic.p.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left { animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}