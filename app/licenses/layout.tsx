import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Licencias de beats: MP3, WAV y Unlimited",
  description:
    "Compará las licencias de beats de NOTYPE.LABS y elegí la opción indicada para Spotify, YouTube y tus lanzamientos musicales.",
  alternates: { canonical: "/licenses" },
};

export default function LicensesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
