import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// USD to RWF conversion (1 USD = 1350 RWF — matches model training rate)
const USD_TO_RWF = 1350;

export function usdToRwf(usd: number): number {
  return Math.round(usd * USD_TO_RWF);
}

export function rwfToUsd(rwf: number): number {
  return Math.round((rwf / USD_TO_RWF) * 100) / 100;
}

export function formatPrice(amount: number, currency: "RWF" | "USD"): string {
  if (currency === "RWF") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

export function formatRwf(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
