export type PluginLocale = "es" | "en";

type PluginCopy = {
  eyebrow: string;
  headline: string;
  shortDescription: string;
  description: string[];
  featureTitle: string;
  features: Array<{ title: string; description: string }>;
  idealFor: string[];
  faq: Array<{ question: string; answer: string }>;
};

export type AudioPlugin = {
  slug: "micmodeler" | "puretype";
  name: string;
  version: string;
  tagline: string;
  image: string;
  gumroadUrl: string;
  price: string;
  format: string;
  operatingSystem: string;
  testedHosts: string[];
  accent: "light" | "dark";
  copy: Record<PluginLocale, PluginCopy>;
};

export const GUMROAD_CATALOG_URL = "https://notyperef.gumroad.com/";

export const AUDIO_PLUGINS: AudioPlugin[] = [
  {
    slug: "micmodeler",
    name: "MicModeler",
    version: "1.0",
    tagline: "References Series",
    image: "/plugins/micmodeler.jpeg",
    gumroadUrl: "https://notyperef.gumroad.com/l/micmodeler",
    price: "0.99",
    format: "VST3",
    operatingSystem: "Windows",
    testedHosts: ["FL Studio", "Ableton Live", "REAPER"],
    accent: "light",
    copy: {
      es: {
        eyebrow: "Corrección y carácter para voces",
        headline: "Hacé que tu micrófono trabaje a favor de la voz",
        shortDescription:
          "Plugin VST3 para Windows que combina corrección tonal, control de resonancias, suavizado de frecuencias agresivas y modelado de carácter para grabaciones vocales de home studio.",
        description: [
          "Una voz puede estar bien interpretada y aun así sentirse lejana, encerrada o demasiado metálica. MicModeler fue diseñado para atacar esos problemas frecuentes de las grabaciones caseras desde una interfaz directa: primero equilibra la señal y después permite elegir el carácter que mejor encaje en la producción.",
          "Su motor reúne una cadena de doce bandas de fase mínima, controles dedicados para resonancias graves, cuerpo y aspereza, saturación mediante Input Drive y procesamiento interno de hasta 8x el sample rate del proyecto. El objetivo es conseguir una voz más firme, clara y fácil de ubicar en la mezcla sin convertir la sesión en una cadena interminable de plugins.",
          "Los perfiles Vintage U87, Modern C800G y Manley Ref están inspirados en el balance tonal asociado a micrófonos de estudio reconocidos. No reemplazan el comportamiento físico de esos equipos: ofrecen tres puntos de partida musicales para aportar calidez, presencia o aire después de corregir la grabación original.",
        ],
        featureTitle: "Un flujo completo en un solo plugin",
        features: [
          { title: "Room Reso", description: "Localiza y reduce acumulaciones graves entre 40 y 100 Hz que pueden hacer que una voz se sienta retumbante o poco definida." },
          { title: "Mic Fix", description: "Recupera cuerpo y balance tonal para combatir el sonido encerrado habitual en micrófonos y espacios de entrada." },
          { title: "De-Harsh", description: "Suaviza sibilancia y dureza en la zona alta procurando conservar definición y presencia." },
          { title: "Tres caracteres", description: "Elegí entre perfiles orientados a calidez clásica, claridad moderna o una respuesta abierta con mayor sensación de aire." },
          { title: "Input Drive", description: "Agrega densidad y saturación para que la voz gane peso y se sostenga mejor dentro de la instrumental." },
          { title: "Hasta 8x oversampling", description: "Procesamiento interno de alta resolución pensado para una saturación más limpia y controlada." },
        ],
        idealFor: ["Voces grabadas en habitaciones sin tratamiento", "Micrófonos económicos o de entrada", "Rap, trap, pop, reggaetón y contenido hablado", "Productores que buscan resultados rápidos sin una cadena extensa"],
        faq: [
          { question: "¿MicModeler convierte mi micrófono exactamente en un U87 o C800G?", answer: "No. Los perfiles aportan curvas y carácter inspirados en referencias conocidas, pero ningún plugin puede reemplazar las propiedades físicas completas de otro micrófono, preamplificador y espacio de grabación." },
          { question: "¿Puedo usarlo mientras grabo?", answer: "Está diseñado para monitoreo de baja latencia y reporta 0 samples de latencia interna. El rendimiento final también depende del buffer, el driver y la configuración de tu DAW." },
          { question: "¿Dónde recibo el plugin?", answer: "La compra, el pago y la descarga digital se realizan en Gumroad. Después de pagar vas a recibir acceso al archivo del plugin y sus instrucciones." },
        ],
      },
      en: {
        eyebrow: "Vocal correction and character",
        headline: "Make your microphone work for the vocal",
        shortDescription:
          "A Windows VST3 plugin combining tonal correction, resonance control, harshness reduction and microphone-inspired character for home-studio vocals.",
        description: [
          "A strong performance can still sound distant, boxed-in or metallic. MicModeler targets the problems commonly found in home recordings through a focused workflow: balance the source first, then choose the character that serves the production.",
          "Its engine combines a twelve-band minimum-phase chain, dedicated controls for low-frequency room buildup, vocal body and harshness, Input Drive saturation and internal processing at up to 8x the project sample rate. The goal is a firmer, clearer vocal that is easier to place in the mix without building an endless plugin chain.",
          "Vintage U87, Modern C800G and Manley Ref are tonal profiles inspired by the character associated with renowned studio microphones. They do not reproduce every physical property of the original hardware; they provide three musical starting points for warmth, modern clarity or open high-frequency air.",
        ],
        featureTitle: "A complete vocal workflow in one plugin",
        features: [
          { title: "Room Reso", description: "Finds and reduces low-frequency buildup between 40 and 100 Hz that can make vocals sound boomy or unfocused." },
          { title: "Mic Fix", description: "Restores body and tonal balance to reduce the boxed-in quality often found in entry-level microphones and rooms." },
          { title: "De-Harsh", description: "Softens sibilance and aggressive highs while preserving useful definition and presence." },
          { title: "Three characters", description: "Choose a profile aimed at classic warmth, modern clarity or an open response with extra air." },
          { title: "Input Drive", description: "Adds density and saturation so the vocal carries more weight and holds its place in the instrumental." },
          { title: "Up to 8x oversampling", description: "High-resolution internal processing designed for cleaner, more controlled saturation." },
        ],
        idealFor: ["Vocals recorded in untreated rooms", "Budget and entry-level microphones", "Rap, trap, pop, reggaeton and spoken content", "Producers who want fast results without a long plugin chain"],
        faq: [
          { question: "Does MicModeler turn my microphone into an actual U87 or C800G?", answer: "No. The profiles provide curves and character inspired by familiar references, but software cannot replace every physical property of another microphone, preamp and recording space." },
          { question: "Can I use it while recording?", answer: "It is designed for low-latency monitoring and reports 0 samples of internal latency. Final performance also depends on your buffer, driver and DAW configuration." },
          { question: "How do I receive the plugin?", answer: "Purchase, payment and digital delivery are handled by Gumroad. After checkout you receive access to the plugin file and its instructions." },
        ],
      },
    },
  },
  {
    slug: "puretype",
    name: "Pure Type",
    version: "1.0",
    tagline: "The all-in-one vocal finisher",
    image: "/plugins/pure-type.jpeg",
    gumroadUrl: "https://notyperef.gumroad.com/l/puretype",
    price: "0.99",
    format: "VST3",
    operatingSystem: "Windows",
    testedHosts: ["FL Studio", "Ableton Live", "REAPER"],
    accent: "dark",
    copy: {
      es: {
        eyebrow: "Finalizador vocal todo en uno",
        headline: "Llevá tus voces de la habitación a la mezcla",
        shortDescription:
          "Plugin VST3 para Windows con limpieza inteligente, ecualización dinámica y saturación asimétrica para terminar voces grabadas en home studios.",
        description: [
          "Pure Type está pensado para el momento en que la voz ya fue grabada pero todavía no se siente terminada. Reúne herramientas de limpieza, enfoque tonal, densidad y brillo en una interfaz compacta para transformar una toma difícil en una señal más controlada y lista para convivir con la instrumental.",
          "Smart Cleaner ayuda a reducir ruido constante y parte de la sensación de ambiente presente en grabaciones domésticas. Focus trabaja sobre dureza y acumulación de medios-graves; Heat incorpora saturación asimétrica para sumar peso y movimiento; Air abre la zona superior para recuperar detalle y una sensación más pulida.",
          "No intenta reemplazar una grabación cuidada ni una sala tratada. Funciona como un finalizador rápido para productores y artistas que necesitan tomar decisiones musicales sin perderse entre múltiples ecualizadores, reductores de ruido y saturadores.",
        ],
        featureTitle: "Cuatro movimientos para terminar la voz",
        features: [
          { title: "Smart Cleaner", description: "Reduce ruido estable y atenúa parte del ambiente que distrae alrededor de la interpretación." },
          { title: "Focus", description: "Controla dureza y barro para que la voz gane definición sin quedar artificialmente delgada." },
          { title: "Heat", description: "Saturación asimétrica para agregar armónicos, densidad y una sensación más cercana a una etapa analógica." },
          { title: "Air", description: "Extiende el brillo superior para aportar detalle y un acabado más abierto cuando la grabación lo necesita." },
          { title: "Modern / Vintage", description: "Dos modos de circuito para adaptar el comportamiento general al color de la producción." },
          { title: "Interfaz inmediata", description: "Controles macroscópicos para llegar rápido a un resultado y después decidir por oído, no por números." },
        ],
        idealFor: ["Artistas que producen sus propias voces", "Home studios y habitaciones sin tratamiento profesional", "Voces urbanas, pop, podcasts y demos", "Sesiones donde importa trabajar rápido y conservar una dirección clara"],
        faq: [
          { question: "¿Pure Type elimina completamente la reverberación o cualquier ruido?", answer: "No. Puede reducir ruido constante y atenuar parte de la sensación de ambiente, pero el resultado depende de la grabación. Ningún procesador recupera por completo una señal muy contaminada o distorsionada." },
          { question: "¿Es solamente para voces?", answer: "Su flujo y sus decisiones tonales fueron diseñados para voces. También puede producir resultados creativos en otras fuentes, aunque ese no es su uso principal." },
          { question: "¿Cómo se entrega?", answer: "Gumroad procesa el pago y habilita la descarga digital después de la compra." },
        ],
      },
      en: {
        eyebrow: "All-in-one vocal finisher",
        headline: "Take your vocals from the bedroom into the mix",
        shortDescription:
          "A Windows VST3 plugin with smart cleanup, dynamic EQ and asymmetric saturation for finishing vocals recorded in home studios.",
        description: [
          "Pure Type is built for the moment when a vocal has been recorded but still does not feel finished. It brings cleanup, tonal focus, density and high-frequency polish into a compact interface, helping turn a difficult take into a more controlled signal that sits naturally against the instrumental.",
          "Smart Cleaner helps reduce steady background noise and part of the room sensation found in domestic recordings. Focus targets harshness and low-mid buildup; Heat uses asymmetric saturation to add weight and movement; Air opens the upper range to restore detail and a more polished finish.",
          "It is not a substitute for a careful recording or a treated room. It is a fast vocal finisher for producers and artists who want musical decisions without getting lost across multiple EQs, noise reducers and saturation plugins.",
        ],
        featureTitle: "Four moves to finish the vocal",
        features: [
          { title: "Smart Cleaner", description: "Reduces steady noise and softens some of the distracting room sound around the performance." },
          { title: "Focus", description: "Controls harshness and mud so the vocal gains definition without becoming unnaturally thin." },
          { title: "Heat", description: "Asymmetric saturation adds harmonics, density and some of the weight associated with an analog stage." },
          { title: "Air", description: "Extends the upper range to add detail and a more open finish when the recording needs it." },
          { title: "Modern / Vintage", description: "Two circuit modes let the overall response follow the color of the production." },
          { title: "Immediate interface", description: "Macro controls help you reach a result quickly and make decisions by ear instead of numbers." },
        ],
        idealFor: ["Artists producing their own vocals", "Home studios and untreated bedrooms", "Urban vocals, pop, podcasts and demos", "Sessions where speed and a clear direction matter"],
        faq: [
          { question: "Does Pure Type completely remove room reverb or every kind of noise?", answer: "No. It can reduce steady noise and soften some room character, but the result depends on the recording. No processor can fully restore a heavily contaminated or distorted signal." },
          { question: "Is it only for vocals?", answer: "Its workflow and tonal decisions were designed for voices. It may produce creative results on other sources, although that is not its primary purpose." },
          { question: "How is it delivered?", answer: "Gumroad processes the payment and provides the digital download after purchase." },
        ],
      },
    },
  },
];

export function getPlugin(slug: string) {
  return AUDIO_PLUGINS.find((plugin) => plugin.slug === slug);
}
