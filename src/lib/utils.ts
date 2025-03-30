import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function setMostRecentMandalartCell(cellId: string) {
  if (typeof window === 'undefined') return null;
  localStorage.setItem('recent-mandalart-cell', cellId);
}

export function getMostRecentMandalartCell() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('recent-mandalart-cell');
}
