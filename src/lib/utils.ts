import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMilhas(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDistance(km: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(km);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}min`;
  }
  return `${minutes}min${secs.toString().padStart(2, "0")}s`;
}

export function formatPace(distanceKm: number, seconds: number): string {
  if (distanceKm === 0) return "-";
  const paceSeconds = seconds / distanceKm;
  const min = Math.floor(paceSeconds / 60);
  const sec = Math.floor(paceSeconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /km`;
}
