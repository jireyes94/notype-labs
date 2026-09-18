import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estado de la compra",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}
