"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
      {/* Efecto de luz roja sutil en el fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Columna 1: Branding */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase leading-none">
              NOTYPE<span className="text-red-600">.</span>LABS
            </Link>
            <p className="mt-6 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[250px]">
              Instrumentales de alta calidad, pensados para artistas que quieren sonar diferente. <br/>
              Sonido procesado en nuestro laboratorio.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-[0.4em] mb-8">Navegacion</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Beats</Link></li>
              <li><Link href="/licenses" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Licencias</Link></li>
              <li><Link href="/contact" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-[0.4em] mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Terminos</Link></li>
              <li><Link href="/privacy" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Politica de privacidad</Link></li>
              <li><Link href="/refund" className="text-zinc-400 hover:text-red-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Politica de devoluciones</Link></li>
            </ul>
          </div>
            
          {/* Columna 4: Newsletter / Social */}
          <div>
            <h4 className="text-white text-[11px] font-black uppercase tracking-[0.4em] mb-8">REDES</h4>
            <div className="flex gap-4 mb-8">
              {/* INSTAGRAM */}
              <a 
                href="https://instagram.com/notype.labs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center justify-center text-zinc-500 hover:border-red-600/50 hover:text-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* YOUTUBE */}
              <a 
                href="https://youtube.com/@prod_enar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center justify-center text-zinc-500 hover:border-red-600/50 hover:text-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-300 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} NOTYPE LABS. <br/>ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}