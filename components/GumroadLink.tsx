"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

export default function GumroadLink({
  href,
  product,
  locale,
  placement,
  className,
  children,
}: {
  href: string;
  product: string;
  locale: "es" | "en";
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        trackEvent("gumroad_click", {
          product,
          placement,
          language: locale,
          destination: "gumroad",
        })
      }
    >
      {children}
    </a>
  );
}
