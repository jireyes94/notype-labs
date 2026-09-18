import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones de las licencias",
  description: "Condiciones de compra y uso de los beats y licencias de NOTYPE.LABS.",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
