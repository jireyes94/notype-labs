"use client";

export default function PrivacidadPage() {
  return (
    <div className="bg-black text-white py-20 px-6 min-h-screen pt-30">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-4">
            Privacidad <span className="text-red-600">&</span> Datos
          </h1>
          <p className="text-zinc-400 text-lg uppercase tracking-widest">Cómo protegemos tu información</p>
        </header>

        <div className="grid gap-8">
          <div className="p-8 border border-zinc-800 bg-zinc-900/50 rounded-2xl">
            <h2 className="text-xl font-bold uppercase text-red-600 mb-4">Recopilación de Información</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Solo solicitamos la información necesaria para procesar tu compra y enviarte los archivos: nombre, correo electrónico y datos de facturación. No almacenamos datos sensibles de tarjetas de crédito; toda transacción se procesa de forma segura a través de <strong>MercadoPago</strong>.
            </p>
          </div>

          <div className="p-8 border border-zinc-800 bg-black rounded-2xl">
            <h2 className="text-xl font-bold uppercase text-red-600 mb-4">Uso de los Datos</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Tus datos se utilizan exclusivamente para enviarte el contrato digital y los links de descarga de tus beats. No compartimos, vendemos ni alquilamos tu información personal a terceros, ni realizamos envíos de publicidad no solicitada (spam).
            </p>
          </div>

          <div className="p-8 border border-zinc-800 bg-zinc-900/50 rounded-2xl">
            <h2 className="text-xl font-bold uppercase text-red-600 mb-4">Seguridad</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Implementamos medidas de seguridad digitales para garantizar que tus descargas sean privadas y que tu acceso a los archivos sea único y personal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}