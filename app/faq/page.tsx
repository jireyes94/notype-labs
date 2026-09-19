import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas frecuentes sobre compra y licencias de beats",
  description: "Cómo comprar beats en NOTYPE.LABS, qué licencia elegir, cómo funcionan los pagos en pesos y qué archivos recibe cada artista.",
  alternates: { canonical: "/faq" },
};

const questions = [
  { question: "¿Cómo compro un beat?", answer: "Abrí la ficha del beat, escuchá la preview y elegí la licencia adecuada. El checkout te mostrará el precio en pesos argentinos y los medios de pago disponibles." },
  { question: "¿Qué diferencia hay entre MP3, WAV y Unlimited?", answer: "Cambian el formato entregado y el alcance de uso. MP3 cubre proyectos iniciales, WAV ofrece audio de alta calidad para lanzamientos y Unlimited amplía los usos e incluye stems cuando estén indicados." },
  { question: "¿Puedo publicar mi canción en Spotify y YouTube?", answer: "Sí, siempre que la licencia seleccionada contemple ese uso y respetes sus límites. Revisá la comparación de licencias antes de comprar." },
  { question: "¿Los precios están en pesos argentinos?", answer: "Sí. Los importes publicados en la tienda están expresados en ARS, salvo que se indique explícitamente otra moneda." },
  { question: "¿Qué pasa si un beat aparece como vendido?", answer: "Un beat vendido bajo modalidad exclusiva deja de estar disponible para nuevas compras. Su ficha puede permanecer visible, pero no permite adquirir nuevas licencias." },
  { question: "¿Puedo registrar la canción en Content ID?", answer: "No registres una canción creada con una licencia no exclusiva en Content ID sin autorización expresa, porque podría generar reclamos contra otros artistas que hayan licenciado el mismo beat." },
];

export default function FAQPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };

  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="mx-auto max-w-4xl">
        <header className="mb-14 text-center">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.45em] text-red-600">Antes de comprar</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-7xl">Preguntas frecuentes</h1>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-zinc-400">Respuestas directas sobre licencias, pagos, archivos y uso de los beats.</p>
        </header>
        <div className="divide-y divide-zinc-900 border-y border-zinc-900">
          {questions.map(({ question, answer }) => (
            <section key={question} className="py-8">
              <h2 className="text-xl font-black uppercase italic tracking-tight">{question}</h2>
              <p className="mt-4 leading-relaxed text-zinc-400">{answer}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/licenses" className="rounded-full bg-red-600 px-7 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Ver licencias</Link>
          <Link href="/contact" className="rounded-full border border-zinc-700 px-7 py-3 text-[10px] font-black uppercase tracking-widest hover:border-white">Necesito ayuda</Link>
        </div>
      </div>
    </main>
  );
}
