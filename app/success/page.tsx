// app/success/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) return <p>Cargando orden...</p>;

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