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

export function formatDistance(km: number, unit: "km" | "mi" = "km"): string {
  const value = unit === "mi" ? km * 0.621371 : km;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value);
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

export function formatPace(distanceKm: number, seconds: number, unit: "km" | "mi" = "km"): string {
  if (distanceKm === 0) return "-";
  const distance = unit === "mi" ? distanceKm * 0.621371 : distanceKm;
  const paceSeconds = seconds / distance;
  const min = Math.floor(paceSeconds / 60);
  const sec = Math.floor(paceSeconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")} /${unit}`;
}
