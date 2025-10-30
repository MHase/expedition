import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Task: Username -> hex color utility (name or name+id)
export function userStringToColorHex(input: string): string {
  // djb2 hash
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  // Normalize to [0, 360) for hue
  const hue = Math.abs(hash) % 360
  // Fixed saturation/lightness for readability
  const saturation = 65
  const lightness = 50
  // Convert HSL to HEX
  const toRgb = (h: number, s: number, l: number) => {
    s /= 100
    l /= 100
    const k = (n: number) => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    const r = Math.round(255 * f(0))
    const g = Math.round(255 * f(8))
    const b = Math.round(255 * f(4))
    return { r, g, b }
  }
  const { r, g, b } = toRgb(hue, saturation, lightness)
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
