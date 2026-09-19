"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatArs, getLicense } from "@/lib/licenses";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    isHydrated,
    removeItem,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
        <div className="mx-auto max-w-5xl text-center text-sm text-zinc-500">
          Cargando carrito...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-40 pt-32 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#catalogo"
          className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-red-500"
        >
          ← Volver al catálogo
        </Link>

        <div className="mb-10 mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600">
              Tu selección
            </p>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
              Carrito
            </h1>
          </div>
          {itemCount > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {itemCount === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-10 text-center md:p-16">
            <h2 className="text-2xl font-black uppercase italic">
              Tu carrito está vacío
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
              Explorá el catálogo, elegí un beat y seleccioná la licencia que
              mejor se adapte a tu lanzamiento.
            </p>
            <Link
              href="/#catalogo"
              className="mt-8 inline-flex rounded-full bg-red-600 px-7 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-red-700"
            >
              Explorar beats
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {items.map((item) => {
                const license = getLicense(item.licenseId);

                return (
                  <article
                    key={item.slug}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 md:items-center"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                      {item.coverUrl ? (
                        <Image
                          src={item.coverUrl}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/beats/${item.slug}`}
                        className="truncate text-lg font-black uppercase italic transition-colors hover:text-red-500"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {license.name}
                      </p>
                      <p className="mt-3 font-black italic">
                        {formatArs(item.unitPrice)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      aria-label={`Eliminar ${item.title} del carrito`}
                      className="self-start p-2 text-zinc-600 transition-colors hover:text-red-500 md:self-center"
                    >
                      Eliminar
                    </button>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-zinc-950 p-6 lg:sticky lg:top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Subtotal
                </span>
                <span className="text-2xl font-black italic">
                  {formatArs(subtotal)}
                </span>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-zinc-500">
                El pago todavía no está habilitado mientras integramos la nueva
                pasarela segura.
              </p>
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-800 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500"
              >
                Continuar al checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
