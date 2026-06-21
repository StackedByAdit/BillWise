export function errorInputClass(hasError: boolean, className: string): string {
  return hasError
    ? `${className} border-red-400 focus:border-red-500 focus:ring-red-500/20`
    : className
}

export function isValidLogoDataUrl(logo?: string): logo is string {
  return Boolean(
    logo &&
      logo.startsWith('data:image/') &&
      logo.includes('base64,') &&
      logo.length > 64,
  )
}
