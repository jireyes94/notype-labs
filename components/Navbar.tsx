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

  const links = [
    { name: "Beats", path: "/beats" },
    { name: "Licencias", path: "/licenses" },
    { name: "Contacto", path: "/contact" },
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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full px-6 py-4 flex justify-between items-center border-b border-zinc-800 bg-black/80 text-white backdrop-blur-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group z-[110]">
          <div className="flex flex-col items-start">
            <span className="text-xl md:text-3xl font-black uppercase italic tracking-tighter leading-none flex items-center">
              NO
              <span className="text-red-600 group-hover:text-white transition-colors duration-300">TYPE</span>
              <span className="text-zinc-500 text-[10px] md:text-sm font-bold tracking-[0.2em] md:tracking-[0.3em] ml-1.5 md:ml-2 mt-1 italic">LABS</span>
            </span>
            <div className={`h-[2px] bg-red-600 transition-all duration-500 mt-0.5 md:mt-1 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></div>
          </div>
        </Link>

        {/* Desktop & Admin Section */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
            {links.map((link) => (
              <Link key={link.path} href={link.path} className="relative group py-1">
                <span className={`transition-colors duration-300 ${isActive(link.path) ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>
                  {link.name}
                </span>
                <span className={`absolute bottom-0 left-0 h-[1.5px] bg-red-600 transition-all duration-300 ease-out ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}

            {/* BOTÓN PLUGINS DESKTOP */}
            <a 
              href="https://notyperef.gumroad.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative group py-1 text-zinc-500 hover:text-white transition-colors duration-300"
            >
              <span>Plugins</span>
              <span className="absolute bottom-0 left-0 h-[1.5px] bg-red-600 transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
            </a>
          </div>

          {user && (
            <div className="flex items-center gap-3 md:gap-4 border-l border-zinc-800 pl-4 md:pl-6">
              <Link href="/admin/dashboard" className="relative flex flex-col items-end group/admin py-1">
                <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-tighter transition-colors ${isActive('/admin/dashboard') ? 'text-red-500' : 'text-zinc-500 group-hover/admin:text-red-500'}`}>
                  Admin
                </span>
                <span className={`text-[10px] md:text-xs font-black uppercase italic transition-colors ${isActive('/admin/dashboard') ? 'text-white' : 'text-zinc-400 group-hover/admin:text-white'}`}>
                  {user.email?.split("@")[0]}
                </span>
                <span className={`absolute bottom-0 right-0 h-[1.5px] bg-red-600 transition-all duration-300 ease-out ${isActive('/admin/dashboard') ? 'w-full' : 'w-0 group-hover/admin:w-full'}`}></span>
              </Link>
              
              <button onClick={handleLogout} className="bg-zinc-900 hover:bg-red-600 p-2 rounded-lg transition-all group">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-400 group-hover:text-white">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex flex-col gap-1.5 md:hidden z-[110] p-2"
          >
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-black z-[105] flex flex-col items-center justify-center transition-all duration-500 md:hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 flex items-center gap-2 group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">Cerrar</span>
          <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full group-hover:bg-red-600 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </button>

        <div className="flex flex-col gap-10 text-center">
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`text-5xl font-black uppercase italic tracking-tighter transition-all ${
                isActive(link.path) ? 'text-red-600 scale-110' : 'text-white hover:text-red-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {/* BOTÓN PLUGINS MOBILE */}
          <a 
            href="https://notyperef.gumroad.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-5xl font-black uppercase italic tracking-tighter text-white hover:text-red-600 transition-all"
          >
            Plugins
          </a>

          <button onClick={() => setIsOpen(false)} className="mt-4 text-zinc-600 text-[11px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors">
            — Volver al Inicio —
          </button>
        </div>
      </div>
    </>
  );
}