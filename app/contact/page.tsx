"use client";
import { FaWhatsapp, FaInstagram, FaYoutube, FaVideo } from "react-icons/fa";
import { SiKick } from "react-icons/si"; // Necesitarás instalar react-icons o usar FaVideo si no está

export default function ContactPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-black px-6 pb-40 pt-30">
      <div className="max-w-5xl w-full text-center space-y-12">
        
        {/* TEXTO EXPLOSIVO */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-[12vw] leading-[0.8] md:text-9xl font-black uppercase italic tracking-tighter">
            Trabajemos <br />
            <span className="text-red-600">juntos</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-2xl font-medium uppercase tracking-widest max-w-2xl mx-auto">
            Envianos tu demo o idea y trabajemos juntos en tu <span className="text-white">próximo hit</span>.
          </p>
        </div>

        {/* CONTENEDOR DE BOTONES (GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* WHATSAPP */}
          <a
            href="https://wa.me/5492214379913"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 bg-[#25D366] text-black font-bold uppercase tracking-tighter rounded-3xl hover:scale-105 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(37,211,102,0.2)]"
          >
            <FaWhatsapp size={32} />
            <span className="text-lg">WhatsApp</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://instagram.com/prod_enar/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold uppercase tracking-tighter rounded-3xl hover:scale-105 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(238,42,123,0.2)]"
          >
            <FaInstagram size={32} />
            <span className="text-lg">Instagram</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

          {/* YOUTUBE */}
          <a
            href="https://youtube.com/@prod_enar" // REEMPLAZA
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 bg-[#FF0000] text-white font-bold uppercase tracking-tighter rounded-3xl hover:scale-105 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(255,0,0,0.2)]"
          >
            <FaYoutube size={32} />
            <span className="text-lg">YouTube</span>
            <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

          {/* KICK */}
          <a
            href="https://kick.com/notypex" // REEMPLAZA
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center gap-3 px-6 py-8 bg-[#53FC18] text-black font-bold uppercase tracking-tighter rounded-3xl hover:scale-105 transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(83,252,24,0.2)]"
          >
            <SiKick size={32} />
            <span className="text-lg">Kick</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

        </div>

        {/* GLOW DE FONDO */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
        </div>
      </div>
    </div>
  );
}