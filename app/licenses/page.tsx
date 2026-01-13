"use client";

const licenses = [
  {
    name: "MP3 Lease",
    description: "Ideal para maquetas y YouTube.",
    features: ["Archivo MP3 (320kbps)", "Hasta 50,000 Streams", "Uso para YouTube (No monetizado)", "Distribución limitada"],
    button: "Seleccionar",
    highlight: false
  },
  {
    name: "WAV Lease",
    description: "Para lanzamientos profesionales.",
    features: ["Archivo WAV (Alta Calidad)", "Hasta 250,000 Streams", "Monetización en YouTube", "Uso para Radio", "Distribución en plataformas"],
    button: "Seleccionar",
    highlight: true // Esta tendrá el color bordo más intenso
  },
  {
    name: "Unlimited",
    description: "Uso comercial sin restricciones.",
    features: ["WAV + Stems (Pistas separadas)", "Streams Ilimitados", "Monetización Completa", "Derechos de Radio/TV", "Contrato de por vida"],
    button: "Seleccionar",
    highlight: false
  }
];

export default function LicensesPage() {
  return (
    <div className="bg-black text-white py-20 px-6 pb-32 md:pb-24">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-4">
          Licencias <span className="text-red-600">&</span> Contratos
        </h1>
        <p className="text-zinc-400 text-lg uppercase tracking-widest">
          Elegí el nivel de uso que tu proyecto necesita
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {licenses.map((license) => (
          <div 
            key={license.name}
            className={`relative flex flex-col p-8 rounded-2xl border ${
              license.highlight 
                ? "border-red-600 bg-zinc-900 shadow-[0_0_30px_rgba(185,28,28,0.2)] scale-105 z-10" 
                : "border-zinc-800 bg-black"
            }`}
          >
            {license.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest">
                Más Popular
              </span>
            )}

            <h2 className="text-2xl font-bold uppercase mb-2">{license.name}</h2>
            
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              {license.description}
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {license.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-20 text-center text-zinc-500 text-xs max-w-2xl mx-auto leading-relaxed">
        * Al comprar cualquier licencia, recibís un contrato digital firmado instantáneamente. 
        Para compras exclusivas o consultas personalizadas, contactame directamente.
      </p>
    </div>
  );
}