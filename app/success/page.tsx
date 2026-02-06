// app/success/page.tsx
export default function SuccessPage({ searchParams }: { searchParams: { payment_id: string } }) {
  const paymentId = searchParams.payment_id;

  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold text-green-500">¡Pago Exitoso!</h1>
      <p className="mt-4 text-gray-400">Gracias por tu compra. Ya puedes descargar tus archivos.</p>
      
      {/* Botón que llama a nuestra API de descarga segura */}
      <a 
        href={`/api/download?payment_id=${paymentId}`}
        className="mt-8 inline-block bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700 transition"
      >
        Descargar Beats & Stems
      </a>
    </div>
  );
}