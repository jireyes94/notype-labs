"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // Estado para evitar el parpadeo del formulario
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Si ya hay sesión, mandarlo directo al dashboard
        router.push("/admin/dashboard");
      } else {
        // Si no hay sesión, dejar de cargar y mostrar el formulario
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/admin/dashboard");
    }
  };

  // Mientras verifica la sesión, mostramos un fondo negro o un spinner sutil
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-black text-white uppercase italic mb-6">
          Admin <span className="text-red-600">Access</span>
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition-all"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Constraseña</label>
            <input 
              type="password" 
              required
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-red-600 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-red-700 transition-all mt-8 shadow-lg shadow-red-900/20">
          Entrar al Panel
        </button>
        
        <p className="text-center text-[9px] text-zinc-600 uppercase font-bold mt-6 tracking-widest">
          No Type Labs • Restricted Area
        </p>
      </form>
    </div>
  );
}