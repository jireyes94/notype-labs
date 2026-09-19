"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatArs, getLicense } from "@/lib/licenses";

export default function CheckoutPage() {
  const { items, itemCount, subtotal, isHydrated } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
        <div className="mx-auto max-w-6xl text-center text-sm text-zinc-500">
          Cargando checkout...
        </div>
      </main>
    );
  }

  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center md:p-16">
          <h1 className="text-3xl font-black uppercase italic">
            No hay beats para comprar
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            Agregá al menos un beat antes de iniciar el checkout.
          </p>
          <Link
            href="/#catalogo"
            className="mt-8 inline-flex rounded-full bg-red-600 px-7 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-red-700"
          >
            Volver al catálogo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-red-500"
        >
          ← Volver al carrito
        </Link>

        <div className="mb-10 mt-8 border-b border-white/10 pb-6">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
            Compra segura
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
            Checkout
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 md:p-8">
            <h2 className="text-xl font-black uppercase italic">
              Tus datos
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Usaremos este correo para enviarte la confirmación y el acceso a
              tus archivos.
            </p>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Nombre
                </span>
                <input
                  type="text"
                  autoComplete="name"
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-sm outline-none transition-colors focus:border-red-600"
                  placeholder="Tu nombre"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Correo electrónico
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={customer.email}
                  onChange={(event) =>
                    setCustomer((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-sm outline-none transition-colors focus:border-red-600"
                  placeholder="nombre@email.com"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-900 bg-black/50 p-4">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 accent-red-600"
                />
                <span className="text-xs leading-relaxed text-zinc-500">
                  Leí y acepto los{" "}
                  <Link href="/terms" className="text-white hover:text-red-500">
                    términos
                  </Link>{" "}
                  y las condiciones de la licencia seleccionada.
                </span>
              </label>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                Pago en configuración
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                En el próximo paso conectaremos la nueva pasarela. Este botón
                permanecerá deshabilitado hasta validar el flujo completo.
              </p>
            </div>
          </section>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-zinc-950 p-6 lg:sticky lg:top-28">
            <h2 className="text-sm font-black uppercase tracking-widest">
              Resumen del pedido
            </h2>
            <div className="mt-6 space-y-5">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-start justify-between gap-4 border-b border-white/10 pb-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black uppercase italic">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      {getLicense(item.licenseId).name}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black italic">
                    {formatArs(item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Total
              </span>
              <span className="text-2xl font-black italic">
                {formatArs(subtotal)}
              </span>
            </div>

            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-800 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500"
            >
              Elegir medio de pago
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
