export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export function isValidGstin(gstin: string): boolean {
  return GSTIN_REGEX.test(gstin.trim().toUpperCase())
}

export function isValidOptionalGstin(gstin: string): boolean {
  const normalized = gstin.trim()
  return normalized.length === 0 || isValidGstin(normalized)
}
