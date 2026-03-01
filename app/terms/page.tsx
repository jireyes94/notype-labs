"use client";
import Link from "next/link";

export default function TerminosPage() {
  const sections = [
    {
      title: "Propiedad Intelectual",
      content: "Todos los beats disponibles en esta plataforma son propiedad intelectual del productor. La compra de una licencia otorga un derecho de uso limitado, no la propiedad del máster ni de la composición original."
    },
    {
      title: "Licencias No Exclusivas",
      content: "Al comprar una licencia (MP3, WAV o Unlimited), el usuario acepta que el beat seguirá estando disponible para la venta a otros artistas hasta que se venda una licencia exclusiva fuera de la plataforma."
    },
    {
      title: "Restricción de Content ID",
      content: "QUEDA ESTRICTAMENTE PROHIBIDO registrar cualquier canción creada con nuestros beats en sistemas de Content ID (YouTube), Shazam o Facebook Rights Manager. Esto es para evitar reclamos falsos de copyright entre distintos licenciatarios. El incumplimiento resultará en la revocación de la licencia."
    },
    {
      title: "Uso y Distribución",
      content: "Cada licencia tiene límites específicos de streams y monetización detallados en la sección de Licencias. Superar estos límites requiere una actualización de licencia o la compra de una licencia superior."
    }
  ];

  return (
    <div className="bg-black text-white py-20 px-6 min-h-screen pt-30">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-4">
            Términos <span className="text-red-600">&</span> Condiciones
          </h1>
          <p className="text-zinc-400 text-lg uppercase tracking-widest">Reglas de juego para el uso de nuestro material</p>
        </header>

        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={index} className="border-l-2 border-red-600 pl-6">
              <h2 className="text-2xl font-bold uppercase mb-4 tracking-tight">{section.title}</h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-20 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
          <p className="text-zinc-300 mb-6 italic">¿Tenés alguna duda sobre el uso legal de los beats?</p>
          <Link href="/contact" className="bg-red-600 hover:bg-red-700 text-white font-black uppercase px-8 py-3 rounded-full transition-all tracking-widest text-sm">
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  );
}