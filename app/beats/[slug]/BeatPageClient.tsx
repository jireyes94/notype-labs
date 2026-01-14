"use client";

import { useEffect, useState } from "react";
import { useAudio, Beat } from "@/components/AudioContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BeatPageClient({ beatFromDB }: { beatFromDB: Beat }) {
  const { playBeat, currentBeat } = useAudio();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [editData, setEditData] = useState({
    title: beatFromDB.title,
    slug: beatFromDB.slug,
    bpm: beatFromDB.bpm.toString(),
    key: beatFromDB.key,
    mood: Array.isArray(beatFromDB.mood) ? beatFromDB.mood.join(", ") : beatFromDB.mood,
    price: beatFromDB.price.toString()
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAdmin(true);
    };
    checkAdmin();
  }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  const handleSave = async () => {
    if (!editData.title || !editData.bpm || !editData.price) {
      alert("Campos obligatorios vacíos");
      return;
    }
    setLoading(true);
    try {
      const tagsArray = editData.mood.split(",").map(t => t.trim().toLowerCase()).filter(t => t !== "");
      const { error } = await supabase
        .from('beats')
        .update({
          title: editData.title,
          slug: editData.slug,
          bpm: parseInt(editData.bpm),
          key: editData.key,
          mood: tagsArray,
          price: parseFloat(editData.price)
        })
        .eq('slug', beatFromDB.slug);

      if (error) throw error;
      setIsEditing(false);
      if (editData.slug !== beatFromDB.slug) {
        router.push(`/beats/${editData.slug}`);
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      title: beatFromDB.title,
      slug: beatFromDB.slug,
      bpm: beatFromDB.bpm.toString(),
      key: beatFromDB.key,
      mood: Array.isArray(beatFromDB.mood) ? beatFromDB.mood.join(", ") : beatFromDB.mood,
      price: beatFromDB.price.toString()
    });
  };

  const handleBuy = (licenseType: string) => {
    const phoneNumber = "5492214379913";
    const message = `Hola! Me contacto para adquirir la licencia *${licenseType}* de *${editData.title}*.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  useEffect(() => {
    if (beatFromDB?.mp3_url && currentBeat?.slug !== beatFromDB.slug) {
      playBeat({ ...beatFromDB, preview: beatFromDB.mp3_url });
    }
  }, [beatFromDB, currentBeat, playBeat]);

  if (!beatFromDB) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">Error.</div>;

  return (
    <div className="relative min-h-screen bg-black text-white pb-32 pt-24 px-4 md:px-8">
      
      {/* FONDO: Bajamos el z-index para que NADA del fondo tape la Navbar ni el contenido */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={beatFromDB.cover_url} 
          className="w-full h-full object-cover opacity-80 blur-2xl scale-110" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col flex-1 justify-center py-10 pb-40 md:pb-20">
        
        <div className="mb-4">
          <Link 
        href="/" 
        className="group inline-flex items-center gap-2 mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-red-600 transition-all"
      >
        <svg 
          className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Volver al Catálogo</span>
      </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-4 justify-between items-center w-full">
          
          {/* LADO IZQUIERDO: TÍTULO E IMAGEN */}
          <div className="flex flex-col gap-10 w-full lg:max-w-[65%] z-10"> {/* Aumentamos el max-w del 55% al 65% para dar más aire al título */}
            <div className="flex flex-col gap-2">
              {isEditing ? (
                <input 
                  className="bg-transparent border-b border-red-600 text-5xl md:text-8xl font-black uppercase italic outline-none w-full tracking-tighter"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value, slug: generateSlug(e.target.value) })}
                />
              ) : (
                <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-black uppercase italic leading-[0.8] tracking-tighter whitespace-nowrap"> 
                  {/* Agregamos 'whitespace-nowrap' para forzar que el título se mantenga en una sola línea en desktop */}
                  {editData.title}
                </h1>
              )}
              
              <div className="flex items-center gap-3 mt-4 text-zinc-400 font-bold text-xs tracking-[0.2em] opacity-60">
                {isEditing ? (
                  <div className="flex gap-4 bg-zinc-900/50 p-2 rounded-lg">
                    <input type="number" className="bg-transparent w-20 border-b border-red-600 outline-none text-center" value={editData.bpm} onChange={e => setEditData({...editData, bpm: e.target.value})} />
                    <input type="text" className="bg-transparent w-20 border-b border-red-600 outline-none text-center" value={editData.key} onChange={e => setEditData({...editData, key: e.target.value})} />
                  </div>
                ) : (
                  <p className="opacity-80 italic">{editData.bpm} BPM • Key: {editData.key}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="w-44 h-44 md:w-52 md:h-52 rounded-xl overflow-hidden border border-zinc-800/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                <img src={beatFromDB.cover_url} className="w-full h-full object-cover" alt={editData.title} />
              </div>

              {/* Busca esta sección en tu BeatPageClient.tsx */}
              <div className="flex flex-col gap-3">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 ml-1">EXPLORAR VIBE</p>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="bg-zinc-900 border border-red-600 p-2 rounded-lg w-full max-w-xs text-xs" 
                      value={editData.mood} 
                      onChange={e => setEditData({...editData, mood: e.target.value})} 
                    />
                  ) : (
                    (Array.isArray(beatFromDB.mood) ? beatFromDB.mood : [beatFromDB.mood]).map((tag, i) => (
                      <Link 
                        key={i} 
                        href={`/?search=${tag.toLowerCase()}`} // Enlace al catálogo con el tag
                        className="px-4 py-1.5 bg-zinc-950/50 border border-zinc-900 rounded-lg text-[11px] font-bold text-zinc-500 hover:text-white hover:border-red-600 hover:bg-red-600/10 transition-all cursor-pointer"
                      >
                        #{tag.toLowerCase()}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: Licencias / Checkout */}
          <div className="w-full lg:max-w-[400px]">
            <div className="bg-zinc-900/30 border border-zinc-900 p-8 rounded-[2rem] backdrop-blur-xl sticky top-24 shadow-2xl">

              {/* CAMBIO AQUÍ: Bloqueo por venta exclusiva */}
              {beatFromDB.is_sold ? (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-block px-4 py-1 bg-red-600/20 border border-red-600/50 rounded-full">
                    <span className="text-red-500 font-black uppercase text-[10px] tracking-widest italic">
                      Sold Out
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic">Vendido</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    Este beat ya fue adquirido bajo una licencia exclusiva y no está disponible para nuevas ventas.
                  </p>
                  <div className="pt-4">
                    <Link 
                      href="/beats" 
                      className="text-white text-[10px] font-black uppercase tracking-widest border-b border-white hover:text-red-500 hover:border-red-500 transition-all"
                    >
                      Explorar otros beats
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-center">Seleccionar Licencia</h3>

                  <div className="grid gap-4">
                    {/* MP3 Lease */}
                    <button 
                      onClick={() => handleBuy("MP3 Lease")}
                      className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all text-left group"
                    >
                      <div>
                        <p className="font-black text-sm uppercase group-hover:text-red-500 transition-colors italic">MP3 Lease</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Uso limitado</p>
                      </div>
                      <span className="font-black text-xl italic">${Number(editData.price).toLocaleString('es-AR')}</span>
                    </button>
              
                    {/* WAV Premium */}
                    <button 
                      onClick={() => handleBuy("WAV Premium")}
                      className="flex items-center justify-between p-5 bg-red-600 rounded-2xl hover:bg-red-700 transition-all text-left shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                    >
                      <div>
                        <p className="font-black text-sm uppercase text-white italic">WAV Premium</p>
                        <p className="text-[9px] text-red-100 uppercase font-black tracking-widest">Alta calidad</p>
                      </div>
                      <span className="font-black text-xl text-white italic">${(Number(editData.price) * 1.5).toLocaleString('es-AR')}</span>
                    </button>
              
                    {/* Unlimited */}
                    <button 
                      onClick={() => handleBuy("Unlimited")}
                      className="flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-red-600 transition-all text-left group"
                    >
                      <div>
                        <p className="font-black text-sm uppercase group-hover:text-red-500 transition-colors italic">Unlimited</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Uso ilimitado / Stems</p>
                      </div>
                      <span className="font-black text-xl italic">${(Number(editData.price) * 4).toLocaleString('es-AR')}</span>
                    </button>
                  </div>
              
                  <p className="text-center text-zinc-600 text-[9px] uppercase font-bold tracking-widest mt-8">
                    Entrega instantánea vía WhatsApp
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ADMIN CONTROLS */}
      {isAdmin && (
        <div className="fixed bottom-32 right-6 md:right-10 z-[300] flex flex-col md:flex-row gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-red-600 hover:text-white transition-all">Editar Beat</button>
          ) : (
            <>
              <button onClick={handleCancel} className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
              <button onClick={handleSave} disabled={loading} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">{loading ? "..." : "Guardar"}</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}