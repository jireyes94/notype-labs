"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  calculateLicensePrice,
  type LicenseId,
} from "@/lib/licenses";

const CART_STORAGE_KEY = "notype-labs-cart-v1";

export type CartBeat = {
  id?: number | string;
  slug: string;
  title: string;
  coverUrl?: string;
  basePrice: number;
};

export type CartItem = CartBeat & {
  licenseId: LicenseId;
  unitPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (beat: CartBeat, licenseId: LicenseId) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isStoredCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<CartItem>;

  return (
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.basePrice === "number" &&
    Number.isFinite(item.basePrice) &&
    (item.licenseId === "mp3" ||
      item.licenseId === "wav" ||
      item.licenseId === "unlimited")
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart: unknown = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          const validItems = parsedCart
            .filter(isStoredCartItem)
            .map((item) => ({
              ...item,
              unitPrice: calculateLicensePrice(
                item.basePrice,
                item.licenseId,
              ),
            }));

          setItems(validItems);
        }
      }
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  const addItem = useCallback((beat: CartBeat, licenseId: LicenseId) => {
    const nextItem: CartItem = {
      ...beat,
      licenseId,
      unitPrice: calculateLicensePrice(beat.basePrice, licenseId),
    };

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        ({ slug }) => slug === beat.slug,
      );

      if (existingIndex === -1) {
        return [...currentItems, nextItem];
      }

      return currentItems.map((item, index) =>
        index === existingIndex ? nextItem : item,
      );
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.slug !== slug),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      subtotal: items.reduce((total, item) => total + item.unitPrice, 0),
      isHydrated,
      addItem,
      removeItem,
      clearCart,
    }),
    [items, isHydrated, addItem, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
