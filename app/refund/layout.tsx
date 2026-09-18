import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de reembolsos y devoluciones",
  description: "Política de reembolsos, descargas digitales y soporte técnico de NOTYPE.LABS.",
  alternates: { canonical: "/refund" },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
