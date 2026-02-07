'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  // Si no hay ID, mostramos un mensaje de error en lugar de dejar la pantalla vacía
  if (!paymentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-[#050505] text-white">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-red-500 mb-4">Error de Verificación</h1>
        <p className="text-zinc-400 font-bold uppercase text-[9px] tracking-widest">No pudimos encontrar los datos de tu compra.</p>
        <a href="/" className="mt-8 text-white text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-8 py-3 rounded-full">Volver a la tienda</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-[#050505] text-white">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-green-500 mb-4">¡Pago Exitoso!</h1>
      <p className="mt-4 text-zinc-400 font-bold uppercase text-xs tracking-widest">Gracias por tu compra. Ya puedes descargar tus archivos.</p>
      
      <a 
        href={`/api/download?payment_id=${paymentId}`}
        className="mt-8 inline-block bg-red-600 px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all"
      >
        Descargar Contenido
      </a>

      <a href="/" className="mt-6 text-zinc-600 text-[9px] uppercase font-black hover:text-white transition-colors">Volver a la tienda</a>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}