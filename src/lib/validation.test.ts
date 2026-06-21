import { describe, expect, it } from 'vitest'
import {
  getGstinCheckDigit,
  getGstinStateCode,
  gstinMatchesStateCode,
  hasValidGstinChecksum,
  isValidGstin,
  isValidOptionalGstin,
} from './validation'

const VALID_GSTINS = [
  '27AAAAA0000A1Z2',
  '27AAPFU0939F1ZV',
  '09AAACH7409R1ZZ',
  '29AABCT1332L1ZA',
  '07AABCU9603R1ZP',
  '33AAACB1234A1ZQ',
  '24AAEPM1234C1ZF',
]

const INVALID_GSTINS = [
  '',
  '123',
  'INVALID-GSTIN',
  '27AAAAA0000A1Z',
  '27AAAAA0000A1Z55',
  '2AAAAA0000A1Z5',
  '27AAAA0000A1Z5',
  '27AAAAA0000A1Z',
  'GSTIN-TOO-LONG-XXXXX',
  '27AAAAA0000A1Z5',
]

describe('getGstinCheckDigit', () => {
  it('computes the official GSTIN check digit', () => {
    expect(getGstinCheckDigit('09AAACH7409R1Z')).toBe('Z')
    expect(getGstinCheckDigit('27AAAAA0000A1Z')).toBe('2')
  })
})

describe('hasValidGstinChecksum', () => {
  it('accepts GSTINs with a valid check digit', () => {
    expect(hasValidGstinChecksum('09AAACH7409R1ZZ')).toBe(true)
    expect(hasValidGstinChecksum('27AAAAA0000A1Z2')).toBe(true)
  })

  it('rejects GSTINs with an invalid check digit', () => {
    expect(hasValidGstinChecksum('27AAAAA0000A1Z5')).toBe(false)
  })
})

describe('gstinMatchesStateCode', () => {
  it('matches the first two digits of the GSTIN to the selected state', () => {
    expect(getGstinStateCode('27AAAAA0000A1Z2')).toBe('27')
    expect(gstinMatchesStateCode('27AAAAA0000A1Z2', '27')).toBe(true)
    expect(gstinMatchesStateCode('27AAAAA0000A1Z2', '29')).toBe(false)
  })

  it('allows empty state codes during partial entry', () => {
    expect(gstinMatchesStateCode('27AAAAA0000A1Z2', '')).toBe(true)
  })
})

describe('isValidGstin', () => {
  it.each(VALID_GSTINS)('accepts valid GSTIN %s', (gstin) => {
    expect(isValidGstin(gstin)).toBe(true)
    expect(isValidGstin(gstin.toLowerCase())).toBe(true)
    expect(isValidGstin(`  ${gstin}  `)).toBe(true)
  })

  it.each(INVALID_GSTINS.filter(Boolean))('rejects invalid GSTIN %s', (gstin) => {
    expect(isValidGstin(gstin)).toBe(false)
  })

  it('rejects empty GSTIN', () => {
    expect(isValidGstin('')).toBe(false)
    expect(isValidGstin('   ')).toBe(false)
  })
})

describe('isValidOptionalGstin', () => {
  it('allows empty buyer GSTIN', () => {
    expect(isValidOptionalGstin('')).toBe(true)
    expect(isValidOptionalGstin('   ')).toBe(true)
  })

  it('validates non-empty buyer GSTIN', () => {
    expect(isValidOptionalGstin('27AAAAA0000A1Z2')).toBe(true)
    expect(isValidOptionalGstin('bad')).toBe(false)
  })
})
