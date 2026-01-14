import "./globals.css";
import { Metadata } from "next";
import { AudioProvider } from "@/components/AudioContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";

export const metadata: Metadata = {
  metadataBase: new URL("https://notypelabs.vercel.app"),
  title: {
    default: "NOTYPE.LABS | Beat Store & Producción Musical",
    template: "%s | NOTYPE.LABS",
  },
  description:
    "Venta de Beats de alta calidad: Trap, Reggaeton, Drill y R&B. Sonido profesional para artistas independientes. NoType Labs - Tu próximo hit empieza acá.",
  
  // 1. ESTANDARIZAMOS EL NOMBRE (Esto es lo que lee Google para el título del sitio)
  applicationName: 'NOTYPE.LABS',
  
  // 2. AGREGAMOS ESTO PARA APPLE Y MÓVILES (Ayuda a la indexación de marca)
  appleWebApp: {
    title: 'NOTYPE.LABS',
    statusBarStyle: 'default',
    capable: true,
  },

  keywords: [
    "Beats", "Instrumentales", "Trap Beats", "Reggaeton Beats", "Venta de beats", "NoType Labs", "Productores musicales",
  ],
  authors: [{ name: "NOTYPE.LABS" }],

  verification: {
    google: "199ikbjNqZ38QLsL-mX6bOY7HFKPlShP0QUB-iGtNRA",
  },
  
  openGraph: {
    title: "NOTYPE.LABS | Beat Store",
    description: "Instrumentales profesionales para tu próximo proyecto musical.",
    url: "https://notypelabs.vercel.app",
    // 3. ASEGURAMOS QUE EL SITENAME SEA EXACTO
    siteName: "NOTYPE.LABS",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "NOTYPE.LABS - Beat Store",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOTYPE.LABS | Beat Store",
    description: "Sonido profesional para artistas independientes.",
    images: ["/og-image.jpg"],
  },
};

// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="bg-black">
      {/* Volvemos a un body normal que crece con su contenido */}
      <body className="antialiased min-h-screen bg-black text-white flex flex-col">
        <AudioProvider>
          <Navbar />
          
          {/* El main ya no tiene scroll interno, el scroll es de la página completa */}
          <main className="flex-grow w-full">
            {children}
          </main>
          <Footer />
          {/* El reproductor ahora es el último elemento, como un footer */}
          <AudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}