"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/components/CartContext";

type PaymentState = "checking" | "paid" | "pending" | "error";
type OrderDownload = { beatTitle: string; licenseName: string; downloadUrl: string };

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();
  const [state, setState] = useState<PaymentState>(() => orderId ? "checking" : "error");
  const [downloads, setDownloads] = useState<OrderDownload[]>([]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    async function verifyPayment() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId!)}`, { cache: "no-store" });
        const result = (await response.json()) as { status?: string; downloads?: OrderDownload[] };
        if (cancelled) return;

        if (response.ok && result.status === "paid") {
          clearCart();
          setDownloads(result.downloads ?? []);
          setState("paid");
          const storageKey = `purchase_tracked_${orderId}`;
          if (!sessionStorage.getItem(storageKey)) {
            trackEvent("purchase", { transaction_id: orderId!, currency: "ARS" });
            sessionStorage.setItem(storageKey, "true");
          }
        } else if (response.ok && (result.status === "processed" || result.status === "payment_pending")) {
          attempt += 1;
          setState(attempt > 5 ? "pending" : "checking");
          timer = setTimeout(verifyPayment, attempt > 15 ? 5000 : 2000);
        } else {
          setState("error");
        }
      } catch {
        if (!cancelled) {
          attempt += 1;
          setState(attempt > 5 ? "pending" : "checking");
          timer = setTimeout(verifyPayment, 5000);
        }
      }
    }

    verifyPayment();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clearCart, orderId]);

  const content = {
    checking: ["Verificando pago", "Estamos consultando el estado directamente con Ualá Bis."],
    paid: ["¡Pago confirmado!", "La compra fue aprobada. Tus archivos ya están disponibles."],
    pending: ["Pago en proceso", "Ualá todavía está procesando la operación. Seguimos verificando automáticamente."],
    error: ["No pudimos verificar el pago", "No se liberó ningún archivo. Si realizaste el pago, conservá el número de orden y volvé a intentar."],
  }[state];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-10 text-center text-white">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Estado de la compra</p>
      <h1 className="text-4xl font-black uppercase italic tracking-tighter">{content[0]}</h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">{content[1]}</p>
      {orderId && <p className="mt-6 text-[9px] uppercase tracking-widest text-zinc-600">Orden {orderId}</p>}
      {state === "paid" && downloads.length > 0 && (
        <div className="mt-8 grid w-full max-w-lg gap-3">
          {downloads.map((download) => (
            <a
              key={download.downloadUrl}
              href={download.downloadUrl}
              onClick={() => trackEvent("file_download", { transaction_id: orderId!, file_type: download.licenseName })}
              className="rounded-full bg-red-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
            >
              Descargar {download.beatTitle} · {download.licenseName}
            </a>
          ))}
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
            Cada enlace admite hasta 5 descargas y vence en 7 días.
          </p>
        </div>
      )}
      <Link href="/#catalogo" className="mt-6 text-[9px] font-black uppercase text-zinc-600 transition-colors hover:text-white">
        Volver al catálogo
      </Link>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050505]" />}>
      <SuccessContent />
    </Suspense>
  );
}
