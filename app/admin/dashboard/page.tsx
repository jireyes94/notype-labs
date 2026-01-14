"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [uploading, setUploading] = useState(false);
  const [beats, setBeats] = useState<any[]>([]);
  const [selectedBeats, setSelectedBeats] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true); // Control de seguridad visual

  const [formData, setFormData] = useState({
    title: "", slug: "", bpm: "", key: "", mood: "", price: ""
  });
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const router = useRouter();

  // 1. PROTECCIÓN DE RUTA UNIFICADA Y CARGA DE DATOS
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Redirección inmediata si no hay sesión activa
        router.push("/admin");
      } else {
        // Usuario autenticado: permitimos ver la UI y traemos los beats
        const fetchBeats = async () => {
          const { data } = await supabase
            .from('beats')
            .select('*')
            .order('created_at', { ascending: false });
          if (data) setBeats(data);
        };
        
        await fetchBeats();
        setCheckingAuth(false);
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const fetchBeats = async () => {
    const { data } = await supabase.from('beats').select('*').order('created_at', { ascending: false });
    if (data) setBeats(data);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  const filteredBeats = beats.filter(beat => 
    beat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. LÓGICA DE SUBIDA (STORAGE + DB)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      // 1. VALIDACIÓN PREVIA DE SLUG
      const { data: existingBeat } = await supabase
        .from('beats')
        .select('id')
        .eq('slug', formData.slug)
        .single();
      
      if (existingBeat) {
        // Sugerencia: podrías autogenerar uno nuevo sumando un número, 
        // pero por ahora frenamos al usuario para que sea consciente.
        throw new Error("Ya existe un beat con este slug. Cambia el título o añade un diferenciador.");
      }

      
      if (!mp3File || !imgFile) throw new Error("Debes seleccionar el MP3 y la Portada.");

      if (mp3File.size > 15 * 1024 * 1024) { // Limite de 15MB por ejemplo
        throw new Error("El archivo MP3 es demasiado pesado (Máx 15MB). Optimízalo antes de subir.");
      }
      
      if (imgFile.size > 2 * 1024 * 1024) { // Limite de 2MB para la portada
        throw new Error("La portada es demasiado pesada (Máx 2MB).");
      }
      
      const mp3Name = `${Date.now()}_${mp3File.name.replace(/\s+/g, '_')}`;
      const imgName = `${Date.now()}_${imgFile.name.replace(/\s+/g, '_')}`;

      await supabase.storage.from('beats-assets').upload(`previews/${mp3Name}`, mp3File);
      await supabase.storage.from('beats-assets').upload(`covers/${imgName}`, imgFile);

      const mp3Url = supabase.storage.from('beats-assets').getPublicUrl(`previews/${mp3Name}`).data.publicUrl;
      const imgUrl = supabase.storage.from('beats-assets').getPublicUrl(`covers/${imgName}`).data.publicUrl;

      const { error: dbError } = await supabase.from('beats').insert([{
        ...formData,
        bpm: parseInt(formData.bpm),
        price: parseFloat(formData.price),
        mp3_url: mp3Url,
        cover_url: imgUrl
      }]);

      if (dbError) throw dbError;
      alert("¡Beat publicado!");
      fetchBeats();
      setFormData({ title: "", slug: "", bpm: "", key: "", mood: "", price: "" });
      setMp3File(null); setImgFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) { alert(error.message); }
    finally { setUploading(false); }
  };

  const handleToggleSelect = (beat: any) => {
    setSelectedBeats(prev => 
      prev.find(b => b.id === beat.id) ? prev.filter(b => b.id !== beat.id) : [...prev, beat]
    );
  };

  // 3. ELIMINACIÓN TOTAL (STORAGE + DB)
  const handleDelete = async () => {
    const count = selectedBeats.length;
    if (count === 0) return;
    if (confirm(`¿Borrar permanentemente ${count} beat(s) y sus archivos?`)) {
      setUploading(true);
      try {
        for (const beat of selectedBeats) {
          const mp3Path = beat.mp3_url.split('/').pop();
          const imgPath = beat.cover_url.split('/').pop();
          if (mp3Path) await supabase.storage.from('beats-assets').remove([`previews/${mp3Path}`]);
          if (imgPath) await supabase.storage.from('beats-assets').remove([`covers/${imgPath}`]);
          await supabase.from('beats').delete().eq('id', beat.id);
        }
        alert("Eliminado.");
        setSelectedBeats([]);
        fetchBeats();
      } catch (error: any) { alert(error.message); }
      finally { setUploading(false); }
    }
  };

  const handleToggleSold = async (e: React.MouseEvent, beatId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Evita seleccionar el beat para borrar
    try {
      const { error } = await supabase
        .from('beats')
        .update({ is_sold: !currentStatus })
        .eq('id', beatId);
      
      if (error) throw error;
      fetchBeats(); // Refrescar lista
    } catch (error: any) { alert(error.message); }
  };

  // 4. FILTRO DE SEGURIDAD VISUAL
  if (checkingAuth) {
    return <div className="min-h-screen bg-black" />; // Evita el parpadeo de la UI privada
  }

  return (
    <div className="relative min-h-screen bg-black text-white pt-30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 w-full flex-1 px-6 pb-10">
        
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <section className="flex flex-col space-y-6">
          <header>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
              Subida <span className="text-red-600">Total</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 font-mono italic">Sync: Storage & Database</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-zinc-950 p-6 md:p-8 rounded-3xl border border-zinc-900 shadow-2xl space-y-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Título</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" 
                  value={formData.title} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({
                      ...formData, 
                      title: val, 
                      slug: generateSlug(val)
                    });
                  }} 
                />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">BPM</label>
                <input type="number" required className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" value={formData.bpm} onChange={e => setFormData({...formData, bpm: e.target.value})} />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Key</label>
                <input type="text" required className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Mood / Género</label>
                <input type="text" required className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Precio AR$</label>
                <input type="number" required className="w-full bg-black border border-zinc-800 p-3 rounded-xl focus:border-red-600 outline-none transition-all" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="p-4 border border-dashed border-zinc-800 rounded-2xl bg-black/50">
                <input type="file" required accept="audio/mpeg" onChange={e => setMp3File(e.target.files?.[0] || null)} className="w-full text-xs file:bg-red-600 file:border-0 file:rounded-lg file:text-white file:px-4 file:py-2 file:font-black cursor-pointer" />
              </div>
              <div className="p-4 border border-dashed border-zinc-800 rounded-2xl bg-black/50">
                <input type="file" required accept="image/*" onChange={e => setImgFile(e.target.files?.[0] || null)} className="w-full text-xs file:bg-zinc-800 file:border-0 file:rounded-lg file:text-white file:px-4 file:py-2 file:font-black cursor-pointer" />
              </div>
            </div>

            <button disabled={uploading} className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg">
              {uploading ? "Sincronizando..." : "Publicar Beat"}
            </button>
          </form>
        </section>

        {/* PANEL DERECHO: GESTOR PRO */}
        <section className="flex flex-col h-full min-h-[500px] lg:h-auto overflow-hidden mt-10 lg:mt-0">
          <div className="flex justify-between items-end mb-6">
            <div className="text-left">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gestor <span className="text-red-600">Pro</span></h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 font-mono">{beats.length} Beats en línea</p>
            </div>
            {selectedBeats.length > 0 && (
              <button onClick={handleDelete} className="bg-red-600 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter animate-bounce shadow-xl">
                Borrar ({selectedBeats.length})
              </button>
            )}
          </div>

          <div className="mb-4">
            <input 
              type="text" 
              placeholder="BUSCAR BEAT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 p-4 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-red-600 transition-all placeholder:text-zinc-700"
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden flex-1 relative shadow-2xl min-h-[400px]">
            <div className="absolute inset-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredBeats.map(beat => {
                const isSelected = selectedBeats.find(b => b.id === beat.id);
                return (
                  <div key={beat.id} 
                    onClick={() => handleToggleSelect(beat)}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected ? 'bg-red-950/20 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'bg-black border-zinc-900 hover:border-zinc-700'
                    }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 border-red-600' : 'border-zinc-800'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <img src={beat.cover_url} className="w-12 h-12 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-black text-sm uppercase truncate italic">{beat.title}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{beat.bpm} BPM • ${beat.price}</p>
                    </div>
                    {/* BOTÓN PARA MARCAR COMO VENDIDO */}
                    <button 
                      onClick={(e) => handleToggleSold(e, beat.id, beat.is_sold)}
                      className={`p-2 rounded-lg border transition-colors ${beat.is_sold ? 'bg-red-600 border-red-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'}`}
                      title={beat.is_sold ? "Marcar como disponible" : "Marcar como vendido"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}