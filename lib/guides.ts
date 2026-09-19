export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  readingTime: string;
  sections: GuideSection[];
  relatedGenre?: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "como-comprar-un-beat-en-argentina",
    title: "Cómo comprar un beat en Argentina",
    description: "Guía práctica para escuchar, elegir una licencia, pagar en pesos y preparar el lanzamiento de una canción con un beat licenciado.",
    eyebrow: "Compra y lanzamiento",
    readingTime: "6 min",
    relatedGenre: "trap",
    sections: [
      {
        heading: "Primero elegí por canción, no solamente por género",
        paragraphs: [
          "Un buen beat no es solo el que suena bien aislado: es el que deja lugar para tu registro, tu cadencia y la historia que querés contar. Escuchá más de una vez e imaginá dónde entrarían el verso, el estribillo y los silencios.",
          "Usá el género para reducir opciones, pero compará también BPM, tonalidad y estructura. Dos instrumentales de trap pueden pedir interpretaciones completamente diferentes.",
        ],
        bullets: ["Probá melodías y flows sobre la preview", "Revisá BPM y tonalidad", "Pensá si la estructura sirve para tu formato de canción"],
      },
      {
        heading: "Entendé qué estás comprando",
        paragraphs: [
          "En una tienda de beats normalmente comprás una licencia de uso, no la propiedad total del instrumental. La licencia determina el archivo que recibís, dónde podés publicar y los límites comerciales.",
          "Una licencia no exclusiva permite que otros artistas usen el mismo beat. Si un proyecto necesita exclusividad, sincronización audiovisual o una campaña grande, conviene consultar esas condiciones antes de lanzar.",
        ],
      },
      {
        heading: "Pago, comprobante y archivos",
        paragraphs: [
          "Verificá que el importe esté expresado en pesos argentinos y completá el pago desde el checkout de la tienda. Conservá el comprobante y las condiciones vigentes de la licencia.",
          "Antes de entrar a estudio, confirmá qué formato incluye tu opción. Para una maqueta puede alcanzar un MP3; para mezcla y master profesional suele convenir WAV y, si el trabajo lo requiere, stems.",
        ],
      },
      {
        heading: "Antes de publicar tu canción",
        paragraphs: [
          "Acreditá correctamente al productor cuando corresponda y no registres una licencia no exclusiva en Content ID sin autorización. Ese registro puede generar reclamos automáticos contra otros artistas que licenciaron legalmente el mismo beat.",
        ],
        bullets: ["Guardá comprobante y licencia", "Respetá límites de distribución", "No uses Content ID sin autorización expresa", "Consultá antes de televisión, publicidad o sincronización"],
      },
    ],
  },
  {
    slug: "que-licencia-de-beat-necesito",
    title: "Qué licencia de beat necesito: MP3, WAV o Unlimited",
    description: "Comparación clara entre licencias MP3, WAV y Unlimited según calidad de audio, distribución y alcance comercial.",
    eyebrow: "Licencias musicales",
    readingTime: "7 min",
    relatedGenre: "reggaeton",
    sections: [
      {
        heading: "MP3: para empezar y validar una canción",
        paragraphs: [
          "La licencia MP3 suele ser la entrada más económica. Puede servir para demos, primeras publicaciones y proyectos con una distribución acotada.",
          "Aunque un MP3 de 320 kbps puede sonar bien, ya es un archivo comprimido. Si vas a grabar, mezclar y masterizar profesionalmente, trabajar desde WAV ofrece más margen técnico.",
        ],
      },
      {
        heading: "WAV: la opción habitual para un lanzamiento profesional",
        paragraphs: [
          "WAV conserva la calidad del archivo sin la compresión destructiva del MP3. Es la alternativa razonable cuando la canción va a pasar por mezcla, master y distribución en plataformas.",
          "La calidad del archivo no reemplaza una buena grabación, pero evita comenzar el proceso con información de audio ya descartada.",
        ],
      },
      {
        heading: "Unlimited: más alcance, no propiedad automática",
        paragraphs: [
          "Unlimited amplía los usos y elimina o eleva límites de reproducciones según el contrato. Puede incluir stems cuando la ficha lo indique, algo útil para controlar voces, batería, bajo y elementos melódicos durante la mezcla.",
          "Unlimited no significa necesariamente exclusiva. Si necesitás que el beat deje de venderse, buscá una negociación de exclusividad expresamente documentada.",
        ],
      },
      {
        heading: "Elegí según el plan real del lanzamiento",
        paragraphs: ["No pagues solamente por el nombre de la licencia: compará el alcance concreto con lo que realmente vas a hacer durante los próximos meses."],
        bullets: ["Demo o prueba: evaluá MP3", "Single distribuido profesionalmente: priorizá WAV", "Campaña amplia o necesidad de stems: evaluá Unlimited", "Publicidad, TV o exclusividad: consultá condiciones específicas"],
      },
    ],
  },
  {
    slug: "como-elegir-bpm-y-tonalidad",
    title: "Cómo elegir el BPM y la tonalidad de un beat",
    description: "Cómo usar BPM, tonalidad, registro vocal y energía para elegir un beat que funcione con tu manera de cantar o rapear.",
    eyebrow: "Composición y preproducción",
    readingTime: "6 min",
    relatedGenre: "rap",
    sections: [
      {
        heading: "El BPM organiza la energía, pero no decide el flow",
        paragraphs: [
          "El BPM mide pulsos por minuto. Un tempo alto suele sentirse más urgente, pero la percepción también depende del patrón de batería y de si interpretás el pulso completo o a mitad de tiempo.",
          "No descartes un beat solamente por el número. Probá distintas subdivisiones: una métrica relajada puede funcionar sobre una instrumental rápida y un flow con muchas sílabas puede vivir sobre un tempo moderado.",
        ],
      },
      {
        heading: "La tonalidad tiene que convivir con tu voz",
        paragraphs: [
          "Si vas a cantar melodías, la tonalidad condiciona las notas cómodas y los puntos de tensión. Tarareá el estribillo sobre la preview y observá si te obliga constantemente a cantar demasiado grave o demasiado agudo.",
          "En rap también importa: la armonía cambia el color emocional y puede hacer que una interpretación se sienta íntima, oscura, agresiva o luminosa.",
        ],
      },
      {
        heading: "Hacé una prueba antes de grabar en serio",
        paragraphs: [
          "Grabá una nota de voz con verso y estribillo. Escuchar la toma revela choques que no aparecen mientras improvisás: falta de aire, frases apuradas, melodías fuera de registro o arreglos que compiten con la voz.",
        ],
        bullets: ["Probá al menos dos flows", "Grabá un estribillo tentativo", "Escuchá en auriculares y parlantes", "Compará con otro beat de energía similar"],
      },
      {
        heading: "Usá los datos para filtrar, no para limitarte",
        paragraphs: [
          "BPM y tonalidad aceleran la búsqueda, pero la decisión final sigue siendo musical. El mejor beat es el que sostiene la canción completa y deja una identidad reconocible después de sumar tu voz.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}
