import { INDIAN_STATES } from './constants'

export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const GSTIN_CHECKSUM_FACTORS = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2] as const

export function getGstinCheckDigit(gstinPrefix: string): string {
  let sum = 0

  for (let index = 0; index < 14; index += 1) {
    const codePoint = GSTIN_CHARS.indexOf(gstinPrefix[index] ?? '')
    const product = codePoint * GSTIN_CHECKSUM_FACTORS[index]
    sum += Math.floor(product / 36) + (product % 36)
  }

  const checkCodePoint = (36 - (sum % 36)) % 36
  return GSTIN_CHARS[checkCodePoint] ?? ''
}

export function hasValidGstinChecksum(gstin: string): boolean {
  const normalized = gstin.trim().toUpperCase()

  if (normalized.length !== 15) {
    return false
  }

  return normalized[14] === getGstinCheckDigit(normalized.slice(0, 14))
}

export function getGstinStateCode(gstin: string): string {
  return gstin.trim().toUpperCase().slice(0, 2)
}

export function getStateNameByCode(stateCode: string): string | undefined {
  return INDIAN_STATES.find((state) => state.code === stateCode)?.name
}

export function isKnownGstinStateCode(stateCode: string): boolean {
  return INDIAN_STATES.some((state) => state.code === stateCode)
}

export function gstinMatchesStateCode(gstin: string, stateCode: string): boolean {
  const normalizedStateCode = stateCode.trim()

  if (!normalizedStateCode) {
    return true
  }

  return getGstinStateCode(gstin) === normalizedStateCode
}

export function getGstinValidationError(
  gstin: string,
  options: { required?: boolean; stateCode?: string } = {},
): string | undefined {
  const normalized = gstin.trim().toUpperCase()
  const { required = false, stateCode = '' } = options

  if (!normalized) {
    return required ? 'GSTIN is required.' : undefined
  }

  if (normalized.length !== 15) {
    return 'GSTIN must be exactly 15 characters.'
  }

  if (!GSTIN_REGEX.test(normalized)) {
    return 'Enter a valid GSTIN format (e.g. 22AAAAA0000A1ZC).'
  }

  if (!hasValidGstinChecksum(normalized)) {
    return 'GSTIN check digit is invalid.'
  }

  const encodedStateCode = getGstinStateCode(normalized)

  if (!isKnownGstinStateCode(encodedStateCode)) {
    return `Unknown state code "${encodedStateCode}" in GSTIN.`
  }

  if (stateCode && !gstinMatchesStateCode(normalized, stateCode)) {
    const expectedState = getStateNameByCode(encodedStateCode) ?? encodedStateCode
    return `GSTIN implies ${expectedState} (${encodedStateCode}). Update GSTIN or state.`
  }

  return undefined
}

export function isValidGstin(gstin: string): boolean {
  if (!gstin.trim()) {
    return false
  }

  return getGstinValidationError(gstin) === undefined
}

export function isValidOptionalGstin(gstin: string): boolean {
  const normalized = gstin.trim()
  return normalized.length === 0 || isValidGstin(normalized)
}

export function applyStateFromGstin<T extends { gstin: string; state: string; stateCode: string }>(
  party: T,
): T {
  const normalized = party.gstin.trim().toUpperCase()

  if (!isValidGstin(normalized)) {
    return party
  }

  const stateCode = getGstinStateCode(normalized)
  const stateName = getStateNameByCode(stateCode)

  if (!stateName) {
    return { ...party, gstin: normalized }
  }

  return {
    ...party,
    gstin: normalized,
    stateCode,
    state: stateName,
  }
}
