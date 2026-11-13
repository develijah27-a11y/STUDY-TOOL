import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format exact integer UGX amounts according to Bank of Uganda / East African convention.
 * e.g., 5000 -> "UGX 5,000"
 */
export function formatUGX(amount: number | bigint): string {
  const intAmount = typeof amount === "bigint" ? Number(amount) : Math.round(amount);
  return `UGX ${new Intl.NumberFormat("en-UG").format(intAmount)}`;
}

/**
 * Format date in clear readable format: e.g. "06 Nov 2026, 14:30"
 */
export function formatDate(date: string | Date | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Truncate long strings safely with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

