"use client";
import Link from "next/link";

export default function DevolucionesPage() {
  return (
    <div className="bg-black text-white py-20 px-6 min-h-screen pt-30 flex items-center">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-8">
          Reembolsos <span className="text-red-600">&</span> Devoluciones
        </h1>
        
        <div className="bg-zinc-900 border border-red-600/30 p-10 rounded-3xl shadow-[0_0_50px_rgba(185,28,28,0.1)]">
          <p className="text-xl text-zinc-200 mb-6 font-bold uppercase tracking-tight">
            Productos Digitales e Irrevocables
          </p>
          <p className="text-zinc-400 leading-relaxed mb-8 text-left">
            Debido a la naturaleza de los productos digitales (archivos descargables), <strong>no se ofrecen reembolsos</strong> una vez que el enlace de descarga ha sido generado o enviado al cliente. 
            <br /><br />
            Cada beat puede escucharse en su totalidad de forma gratuita en nuestra web antes de la compra, asegurando que el cliente esté conforme con el producto antes de pagar.
          </p>

          <div className="space-y-4 text-left border-t border-zinc-800 pt-8">
            <h3 className="text-red-600 font-bold uppercase text-sm tracking-widest">¿Tuviste un problema técnico?</h3>
            <p className="text-zinc-500 text-sm">
              Si experimentas errores en la descarga, archivos dañados o el link no te llegó, contactanos inmediatamente. No devolveremos el dinero, pero nos aseguraremos de que recibas el material que compraste de forma manual y rápida.
            </p>
          </div>

          <div className="mt-10">
            <Link href="/contact" className="inline-block border border-white text-white hover:bg-white hover:text-black transition-all font-black uppercase px-10 py-4 rounded-full tracking-tighter">
              Reportar Error Técnico
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}