"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/components/CartContext";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, isHydrated } = useCart();
  const visibleItemCount = isHydrated ? itemCount : 0;

  const links = [
    { name: "Géneros", path: "/generos" },
    { name: "Guías", path: "/guias" },
    { name: "Licencias", path: "/licenses" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/#catalogo");
    router.refresh();
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <nav className="fixed left-0 top-0 z-[100] flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/60 px-6 text-white backdrop-blur-xl">
        <Link href="/" className="group z-[110] flex items-center gap-1">
          <span className="flex items-center text-xl font-black uppercase italic leading-none tracking-tighter md:text-2xl">
            <span className="text-white">NOTYPE</span>
            <span className="relative ml-1 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] transition-all duration-300 md:text-white md:drop-shadow-none md:group-hover:text-red-600 md:group-hover:drop-shadow-[0_0_12px_rgba(220,38,38,0.8)]">
              .LABS
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-6 md:gap-10">
          <div className="hidden gap-8 text-[10px] font-black uppercase tracking-[0.3em] md:flex">
            {links.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors duration-300 ${
                  isActive(link.path)
                    ? "text-red-600"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link
            href="/cart"
            aria-label={`Abrir carrito con ${visibleItemCount} productos`}
            className="group/cart hidden items-center gap-3 rounded-full bg-red-600 px-5 py-2.5 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:bg-red-700 md:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform group-hover/cart:scale-110"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span className="border-l border-white/20 pl-3 text-[10px] font-black uppercase tracking-widest">
              {visibleItemCount}
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <Link
                href="/admin/dashboard"
                className="group/admin flex flex-col items-end"
              >
                <span className="text-[8px] font-bold uppercase text-zinc-500 transition-colors group-hover/admin:text-red-500">
                  Admin
                </span>
                <span className="text-[10px] font-black uppercase italic text-zinc-300">
                  {user.email?.split("@")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="text-zinc-500 transition-colors hover:text-red-600"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-6 z-[200] flex flex-col gap-1.5 rounded-lg border border-white/5 bg-black/20 p-2 backdrop-blur-lg md:hidden"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
      >
        <div
          className={`h-0.5 w-6 transition-all duration-300 ${
            isOpen ? "translate-y-2 rotate-45 bg-red-600" : "bg-white"
          }`}
        />
        <div
          className={`h-0.5 w-6 transition-all duration-300 ${
            isOpen ? "opacity-0" : "bg-white"
          }`}
        />
        <div
          className={`h-0.5 w-6 transition-all duration-300 ${
            isOpen ? "-translate-y-2 -rotate-45 bg-red-600" : "bg-white"
          }`}
        />
      </button>

      <div
        className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black transition-all duration-500 ease-in-out md:hidden ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6 text-center">
          <Link
            href="/#catalogo"
            onClick={() => setIsOpen(false)}
            className={`text-4xl font-black uppercase italic tracking-tighter ${
              pathname === "/" ? "text-red-600" : "text-white"
            }`}
          >
            Beats
          </Link>

          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-4xl font-black uppercase italic tracking-tighter ${
                isActive(link.path) ? "text-red-600" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="mt-6 rounded-full bg-red-600 px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            Carrito ({visibleItemCount})
          </Link>
        </div>
      </div>
    </>
  );
}
