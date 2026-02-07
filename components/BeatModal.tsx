"use client";
import { useEffect, useState } from "react";
import { useAudio, Beat } from "./AudioContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);

export default function BeatModal({ beat, onClose }: { beat: Beat; onClose: () => void }) {
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://notypelabs.vercel.app';
  const [showPaymentBrick, setShowPaymentBrick] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [selectedLicenseName, setSelectedLicenseName] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

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

  const buy = async (license: string, price: number) => {
    setLoading(true);
    setPreferenceId(null);
    setShowPaymentBrick(false);
    setSelectedLicenseName(license);
    setSelectedAmount(price);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "create_preference", 
          beatId: beat.id, 
          licenseType: license 
        }),
      });
      const data = await response.json();
      setPreferenceId(data.id);
      setShowPaymentBrick(true);
      
      setTimeout(() => {
        const container = document.getElementById('payment-area');
        container?.scrollIntoView({ behavior: 'smooth'});
      }, 100);
    } catch (error) {
      console.error("Error al crear preferencia:", error);
    } finally {
      setLoading(false);
    }
  };

  const initialization = {
    amount: selectedAmount,
    preferenceId: preferenceId!, // CRUCIAL para mostrar MP
  };

  const customization = {
    paymentMethods: {
      creditCard: "all" as const,
      debitCard: "all" as const,
      mercadoPago: "all" as const,
      bankTransfer: "all" as const, // Agregado para las 4 opciones
    },
    visual: {
      style: {
        theme: 'dark' as const,
      }
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    setPaymentError(null); // Limpiamos errores previos
    return new Promise<void>(async (resolve, reject) => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formData,
            beatId: beat.id,
            licenseType: selectedLicenseName,
          }),
        });

        const paymentResult = await res.json();

        // Verificamos si el pago fue aprobado exitosamente
        if (res.ok && paymentResult.status === 'approved') {
          router.push(`/success?payment_id=${paymentResult.id}`);
          resolve();
        } else {
          // Manejo de rechazo sin salir del modal
          const statusDetail = paymentResult.status_detail || "error_desconocido";

          // Mapeo de errores para que el usuario entienda qué pasó
          const errorMessages: { [key: string]: string } = {
            cc_rejected_insufficient_amount: "Fondos insuficientes en la tarjeta.",
            cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto.",
            cc_rejected_call_for_authorize: "Debes autorizar el pago con tu banco.",
            default: "El pago fue rechazado. Intenta con otro medio."
          };

          setPaymentError(errorMessages[statusDetail] || errorMessages.default);
          setLoading(false);
          reject(); // Esto mantiene el Brick activo para reintentar
        }
      } catch (error) {
        console.error(error);
        setPaymentError("Hubo un problema técnico al procesar el pago.");
        setLoading(false);
        reject();
      }
    });
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
                onClick={() => buy(lic.name, lic.p)}
                className={`w-full group flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] transition-all
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.07] hover:border-red-600/50'}
                  ${showPaymentBrick && selectedLicenseName === lic.name ? 'border-red-600 bg-white/[0.08]' : ''}
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

          <div id="payment-area" className="mt-8 scroll-mt-24">
            {paymentError && (
              <div className="mb-4 p-4 bg-red-600/10 border border-red-600/50 rounded-2xl animate-fade-in">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                  {paymentError}
                </p>
              </div>
            )}
            {showPaymentBrick && preferenceId && (
              <div className="animate-fade-in bg-zinc-900/50 border border-white/10 p-2 rounded-[2rem] shadow-2xl">
                <div className="flex justify-between items-center p-4">
                  <div>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">
                      Checkout Seguro
                    </p>
                    <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-wider">
                      {selectedLicenseName} • ${selectedAmount.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <button onClick={() => setShowPaymentBrick(false)} className="text-zinc-500 hover:text-red-600 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                <Payment 
                  initialization={initialization}
                  customization={customization}
                  onSubmit={onSubmit}
                  onError={(error) => console.error(error)}
                  onReady={() => setLoading(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-left { animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}