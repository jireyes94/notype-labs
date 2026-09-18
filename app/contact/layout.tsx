import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto y beats personalizados",
  description:
    "Contactá a NOTYPE.LABS desde Argentina para consultar por beats, licencias, instrumentales exclusivas y producción musical.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
