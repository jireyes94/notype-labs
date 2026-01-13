"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const videos = [
  "/videos/video1.mp4",
  "/videos/video2.mp4"
];

export default function Hero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentVideo((prev) => (prev + 1) % videos.length);
        setFade(true);
      }, 200); // duración del fade
    }, 8000); // tiempo por video

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[calc(100dvh-70px)] w-full flex items-center justify-center overflow-hidden bg-black text-white">

      {/* VIDEO BACKGROUND */}
     <video
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
        fade ? "opacity-20" : "opacity-0"
      } grayscale`}
      src={videos[currentVideo]} // Al cambiar el src sin cambiar la key, la transición es más suave
      autoPlay
      muted
      loop
      playsInline
    />

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px] -translate-x-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[160px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center px-6 animate-fade-in">
        <h1 className="text-5xl md:text-8xl font-black leading-none mb-6 tracking-tighter uppercase italic">
    Tu próximo hit <br /> 
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-900">
      empieza aquí.
    </span>
  </h1>

  <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 font-medium tracking-wide uppercase">
    Sonido Pro para artistas independientes. <br />
    Trap · Reggaeton · Drill · Rap · R&B
  </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/beats"
            className="px-8 py-4 rounded-xl bg-white text-black font-semibold 
              hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Escuchar beats
          </Link>
            
          {/* CAMBIO: De <a> a <Link> para evitar el cierre del AudioPlayer */}
          <Link
            href="/contact"
            className="px-8 py-4 rounded-xl border border-white/30 text-white
              hover:bg-white hover:text-black transition-all duration-300"
          >
            Contacto
          </Link>
        </div>
      </div>
    </section>
  );
}
