"use client";
import { useEffect, useState } from "react";
import { useAudio, Beat } from "./AudioContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

// Inicialización de MP (Fuera del componente para evitar re-inicializaciones)
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

export default function BeatModal({ beat, onClose }: { beat: Beat; onClose: () => void }) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
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

  // Función de compra
  const buy = async (license: string) => {
    try {
      setPreferenceId(null);
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          beatId: beat.id, 
          licenseType: license 
        }),
      });

      if (!res.ok) throw new Error("Error servidor");

      const data = await res.json();
      setPreferenceId(data.id);

    } catch (error) {
      console.error("Error checkout:", error);
      alert("Error al iniciar pago");
    } finally {
      setLoading(false);
    }
  };

  const mp3Price = beat.price;
  const wavPrice = beat.price * 1.5;
  const unlimitedPrice = beat.price * 4;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      <div className={`
        relative bg-[#050505] w-full md:w-[450px] h-full shadow-2xl border-l border-white/5 
        flex flex-col transition-transform duration-500 ease-out animate-slide-left
      `}>

        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-60">
           <img src={beat.cover_url} alt="" className="w-full h-full object-cover blur-[50px] scale-120" />
           <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
        </div>
        
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <button onClick={onClose} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Cerrar</span>
          </button>
          
          {isAdmin && (
            <button onClick={() => setIsEditing(!isEditing)} className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white text-black rounded-full hover:bg-red-600 hover:text-white transition-all">
              {isEditing ? "Ver Vista Previa" : "Editar Datos"}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 pb-44">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img src={beat.cover_url} alt={beat.title} className="w-full h-full object-cover" />
              <button onClick={() => playBeat(beat)} className="absolute inset-0 m-auto w-15 h-15 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                {currentBeat?.id === beat.id && isPlaying ? 
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg> :
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4 w-full mt-4">
                <input className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xl font-black italic" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs uppercase" value={editData.bpm} onChange={e => setEditData({...editData, bpm: e.target.value})} placeholder="BPM" />
                  <input className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs uppercase" value={editData.key} onChange={e => setEditData({...editData, key: e.target.value})} placeholder="KEY" />
                </div>
              </div>
            ) : (
              <div className="text-center mt-4">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">{beat.title}</h2>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Tempo</span>
                    <span className="text-sm font-bold">{beat.bpm} BPM</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-white/10 pl-6">
                    <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Key</span>
                    <span className="text-sm font-bold">{beat.key}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 text-center">Seleccionar Licencia</h3>

            {[
              { id: "MP3", name: "MP3 Standard", desc: "Uso básico / Streaming limitado", p: mp3Price },
              { id: "WAV", name: "WAV Premium", desc: "Alta calidad / Uso comercial", p: wavPrice },
              { id: "Unlimited", name: "Unlimited", desc: "Uso ilimitado / Stems", p: unlimitedPrice }
            ].map((lic) => (
              <button 
                key={lic.id}
                disabled={loading}
                onClick={() => buy(lic.name)}
                className={`w-full group flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] transition-all
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.07] hover:border-red-600/50'}
                  ${preferenceId && 'opacity-30'}
                `}
              >
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest group-hover:text-red-500 transition-colors">{lic.name}</p>
                  <p className="text-[9px] text-zinc-500 uppercase mt-1 font-bold">{lic.desc}</p>
                </div>
                <span className="text-xl font-black italic tracking-tighter">${lic.p.toLocaleString('es-AR')}</span>
              </button>
            ))}
          </div>

          {/* ÁREA DE PAGO MERCADO PAGO */}
          <div className="mt-8">
            {loading && (
              <div className="flex flex-col items-center justify-center p-4 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Generando orden...</p>
              </div>
            )}
          
            {preferenceId && (
              <div className="animate-fade-in bg-white p-6 rounded-[2rem] shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-black text-[10px] font-black uppercase tracking-widest">
                    Pagar con Mercado Pago
                  </p>
                  <button onClick={() => setPreferenceId(null)} className="text-black hover:text-red-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <Wallet initialization={{ preferenceId }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
