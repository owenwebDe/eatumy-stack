import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  return `http://45.76.132.8:5000${path}`;
}
