import "./globals.css";
import { Metadata } from "next";
import { AudioProvider } from "@/components/AudioContext";
import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import { SITE_URL } from "@/lib/site";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NOTYPE.LABS | Beat Store & Producción Musical",
    template: "%s | NOTYPE.LABS",
  },
  description:
    "Beats originales de trap, reggaetón, drill, rap y R&B para artistas de Argentina. Licencias claras, precios en pesos y entrega digital.",

  applicationName: "NOTYPE.LABS",

  appleWebApp: {
    title: "NOTYPE.LABS",
    statusBarStyle: "default",
    capable: true,
  },

  keywords: [
    "comprar beats en Argentina",
    "instrumentales",
    "trap beats",
    "reggaetón beats",
    "licencias de beats",
    "NOTYPE.LABS",
  ],
  authors: [{ name: "NOTYPE.LABS" }],

  verification: {
    google: "199ikbjNqZ38QLsL-mX6bOY7HFKPlShP0QUB-iGtNRA",
  },

  openGraph: {
    title: "NOTYPE.LABS | Beat Store",
    description: "Instrumentales profesionales para tu próximo proyecto musical.",
    url: "/",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className="bg-black">
      <body className="flex min-h-screen flex-col bg-black text-white antialiased">
        <Analytics />
        <CartProvider>
          <AudioProvider>
            <Navbar />
            <main className="w-full flex-grow">{children}</main>
            <Footer />
            <AudioPlayer />
          </AudioProvider>
        </CartProvider>
      </body>
    </html>
  );
}
