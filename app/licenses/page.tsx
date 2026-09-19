import Link from "next/link";

const licenses = [
  {
    name: "MP3 Lease",
    description: "Una opción accesible para demos, primeras publicaciones y proyectos con distribución limitada.",
    features: ["Archivo MP3 320 kbps", "Hasta 50.000 reproducciones", "Distribución limitada", "Licencia no exclusiva"],
    highlight: false,
  },
  {
    name: "WAV Premium",
    description: "Audio sin compresión para mezclar, masterizar y publicar un lanzamiento profesional.",
    features: ["Archivo WAV en alta calidad", "Hasta 250.000 reproducciones", "Monetización y plataformas", "Licencia no exclusiva"],
    highlight: true,
  },
  {
    name: "Unlimited",
    description: "Mayor alcance comercial para artistas que necesitan una licencia sin límite de reproducciones.",
    features: ["WAV y stems cuando estén disponibles", "Reproducciones ilimitadas", "Monetización completa", "Licencia no exclusiva"],
    highlight: false,
  },
];

export default function LicensesPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-16 max-w-4xl text-center">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Elegí según tu proyecto</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">Licencias de beats</h1>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-zinc-400">
            La licencia define qué archivos recibís y hasta dónde podés explotar comercialmente tu canción. La compra no transfiere la propiedad del beat.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {licenses.map((license) => (
            <article key={license.name} className={`relative flex flex-col rounded-3xl border p-8 ${license.highlight ? "border-red-600 bg-zinc-900 shadow-[0_0_30px_rgba(185,28,28,0.16)]" : "border-zinc-800 bg-zinc-950/40"}`}>
              {license.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-[9px] font-black uppercase tracking-widest">Más elegida</span>}
              <h2 className="text-2xl font-black uppercase italic tracking-tight">{license.name}</h2>
              <p className="mt-4 min-h-20 text-sm leading-relaxed text-zinc-400">{license.description}</p>
              <ul className="mt-7 flex-grow space-y-4">
                {license.features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-zinc-300"><span className="text-red-600">✓</span>{feature}</li>)}
              </ul>
              <Link href="/#catalogo" className={`mt-9 rounded-full px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest ${license.highlight ? "bg-red-600 hover:bg-red-700" : "border border-zinc-700 hover:border-white"}`}>Elegir un beat</Link>
            </article>
          ))}
        </div>

        <section className="mt-20 grid gap-8 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Qué significa no exclusiva</h2>
            <p className="mt-5 leading-relaxed text-zinc-400">El productor conserva la propiedad del beat y puede licenciarlo a otros artistas mientras no sea vendido en exclusiva. Vos conservás los derechos sobre tu letra y tu interpretación.</p>
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Antes de publicar</h2>
            <p className="mt-5 leading-relaxed text-zinc-400">Guardá el comprobante y las condiciones de tu licencia. No registres el beat en Content ID ni excedas los límites de distribución sin actualizarla.</p>
          </div>
        </section>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-zinc-500">
          Los alcances definitivos son los informados al momento de comprar y en los términos de la licencia. Si tu proyecto requiere televisión, publicidad, sincronización o exclusividad, consultá antes de publicar.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/faq" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white">Preguntas frecuentes →</Link>
          <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Términos completos →</Link>
        </div>
      </div>
    </main>
  );
}
