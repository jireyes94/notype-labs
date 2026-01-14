"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Simplificamos los links según tu nueva estrategia
  const links = [
    { name: "Licensing", path: "/licenses" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* CAMBIO: fixed en lugar de sticky para control total y z-[100] alto */}
      <nav className="fixed top-0 left-0 z-[100] w-full h-20 px-6 flex justify-between items-center border-b border-white/5 bg-black/60 backdrop-blur-xl text-white">
        
        {/* Logo unificado con el estilo de la home */}
        <Link href="/" className="flex items-center gap-1 group z-[110]">
          <span className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none flex items-center">
            {/* NOTYPE siempre blanco */}
            <span className="text-white">NOTYPE</span>

            {/* .LABS: Rojo en mobile, blanco en desktop (con hover a rojo) */}
            <span className="
              ml-1 
              transition-all 
              duration-300 
              relative
              /* Estado Mobile: Rojo sólido */
              text-red-600 
              drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]

              /* Estado Desktop: Vuelve a blanco y activa el hover */
              md:text-white 
              md:drop-shadow-none
              md:group-hover:text-red-600 
              md:group-hover:drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]
            ">
              .LABS
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
            {links.map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`transition-colors duration-300 ${isActive(link.path) ? 'text-red-600' : 'text-zinc-500 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Botón de Cart unificado con estilo beats/[slug] */}
          <button className="hidden md:block bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            Cart (0)
          </button>
          
          {/* Admin Section */}
          {user && (
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <Link href="/admin/dashboard" className="flex flex-col items-end group/admin">
                <span className="text-[8px] font-bold uppercase text-zinc-500 group-hover/admin:text-red-500 transition-colors">Admin</span>
                <span className="text-[10px] font-black uppercase italic text-zinc-300">{user.email?.split("@")[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-zinc-500 hover:text-red-600 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          )}
        </div>
      </nav>

            {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden fixed top-6 right-6 z-[200] flex flex-col gap-1.5 p-2 bg-black/20 backdrop-blur-lg rounded-lg border border-white/5"
        aria-label="Toggle Menu"
      >
        <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2 bg-red-600' : 'bg-white'}`}></div>
        <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? 'opacity-0' : 'bg-white'}`}></div>
        <div className={`w-6 h-0.5 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2 bg-red-600' : 'bg-white'}`}></div>
      </button>

      {/* Mobile Menu - Rediseño Premium */}
      <div className={`
        fixed inset-0 bg-black z-[120] 
        flex flex-col items-center justify-center 
        transition-all duration-500 ease-in-out md:hidden
        ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
      `}>

        {/* Link de Beats agregado para regresar al catálogo */}
        <div className="flex flex-col gap-6 text-center">
          <Link 
            href="/" 
            onClick={() => setIsOpen(false)}
            className={`text-4xl font-black uppercase italic tracking-tighter ${pathname === '/' ? 'text-red-600' : 'text-white'}`}
          >
            BEATS
          </Link>
      
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              onClick={() => setIsOpen(false)}
              className={`text-4xl font-black uppercase italic tracking-tighter ${isActive(link.path) ? 'text-red-600' : 'text-white'}`}
            >
              {link.name}
            </Link>
          ))}

          <button className="bg-red-600 text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest mt-6 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            CART (0)
          </button>
        </div>
      </div>
    </>
  );
}