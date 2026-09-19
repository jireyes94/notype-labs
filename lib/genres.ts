export type GenreConfig = {
  slug: string;
  name: string;
  aliases: string[];
  title: string;
  description: string;
  intro: string;
  uses: string[];
};

export const GENRES: GenreConfig[] = [
  {
    slug: "trap",
    name: "Trap",
    aliases: ["trap"],
    title: "Beats de trap en Argentina",
    description: "Escuchá beats de trap originales, compará BPM y tonalidad y elegí una licencia en pesos argentinos para tu próximo lanzamiento.",
    intro: "Instrumentales de trap con espacio para la voz, graves definidos y arreglos pensados para singles, freestyle y proyectos urbanos.",
    uses: ["Singles y EP", "Freestyle", "Contenido audiovisual"],
  },
  {
    slug: "reggaeton",
    name: "Reggaetón",
    aliases: ["reggaeton", "reggaetón"],
    title: "Beats de reggaetón en Argentina",
    description: "Encontrá beats de reggaetón originales con licencias claras, precios en pesos y opciones MP3, WAV y Unlimited.",
    intro: "Dembow, melodías y bajos trabajados para canciones bailables sin perder identidad. Escuchá cada instrumental antes de elegir la licencia.",
    uses: ["Singles comerciales", "Canciones urbanas", "Contenido para redes"],
  },
  {
    slug: "drill",
    name: "Drill",
    aliases: ["drill"],
    title: "Beats de drill en Argentina",
    description: "Catálogo de beats de drill para artistas argentinos: instrumentales originales, precios en ARS y licencias para distintos proyectos.",
    intro: "Beats oscuros y dinámicos, con percusión precisa y bajos con movimiento para flows agresivos, melódicos o experimentales.",
    uses: ["Drill argentino", "Freestyle", "Videoclips"],
  },
  {
    slug: "rap",
    name: "Rap",
    aliases: ["rap", "hip hop", "hip-hop", "boom bap", "boombap"],
    title: "Beats de rap y hip hop en Argentina",
    description: "Comprá beats de rap y hip hop originales en Argentina. Revisá BPM, tonalidad y licencia antes de grabar tu canción.",
    intro: "Instrumentales enfocadas en la interpretación y la narrativa, desde texturas clásicas hasta producciones de rap contemporáneo.",
    uses: ["Canciones de rap", "Cyphers", "Proyectos conceptuales"],
  },
  {
    slug: "rnb",
    name: "R&B",
    aliases: ["r&b", "rnb", "r and b"],
    title: "Beats de R&B en Argentina",
    description: "Beats de R&B originales para cantar y componer. Escuchá el catálogo y elegí una licencia con precio en pesos argentinos.",
    intro: "Armonías, texturas y grooves pensados para voces melódicas, canciones íntimas y cruces entre R&B, soul y música urbana.",
    uses: ["Canciones melódicas", "R&B alternativo", "Pop urbano"],
  },
];

export function getGenre(slug: string) {
  return GENRES.find((genre) => genre.slug === slug);
}

export function normalizeMood(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function beatMatchesGenre(mood: string | string[], genre: GenreConfig) {
  const moods = (Array.isArray(mood) ? mood : mood.split(",")).map(normalizeMood);
  const aliases = genre.aliases.map(normalizeMood);

  return moods.some((item) => aliases.some((alias) => item === alias || item.includes(alias)));
}
