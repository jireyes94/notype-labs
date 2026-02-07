// app/success/page.tsx
export default function SuccessPage({ searchParams }: { searchParams: { payment_id: string } }) {
  const paymentId = searchParams.payment_id;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-10 bg-[#050505] text-white">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-green-500 mb-4">¡Pago Exitoso!</h1>
      <p className="mt-4 text-zinc-400 font-bold uppercase text-xs tracking-widest">Gracias por tu compra. Ya puedes descargar tus archivos.</p>
      
      <a 
        href={`/api/download?payment_id=${paymentId}`}
        className="mt-8 inline-block bg-red-600 px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-black transition-all"
      >
        Descargar Beats & Stems
      </a>

      <a href="/" className="mt-6 text-zinc-600 text-[9px] uppercase font-black hover:text-white transition-colors">Volver a la tienda</a>
    </div>
  );
}