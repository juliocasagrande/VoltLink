import { type ClassValue } from "clsx"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge de classes Tailwind com condicionais (padrão shadcn) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}