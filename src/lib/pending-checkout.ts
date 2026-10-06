export const PENDING_CHECKOUT_STORAGE_KEY = "cark_pending_checkout";

export type PendingCheckoutData = {
  vin: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function savePendingCheckout(data: PendingCheckoutData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, JSON.stringify(data));
}

export function readPendingCheckout(): PendingCheckoutData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingCheckoutData;
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
}
