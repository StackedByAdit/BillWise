import { describe, expect, it } from 'vitest'
import { numberToWords } from './numberToWords'

describe('numberToWords', () => {
  it('converts zero', () => {
    expect(numberToWords(0)).toBe('Zero Rupees Only')
  })

  it('converts small numbers', () => {
    expect(numberToWords(1)).toBe('One Rupees Only')
    expect(numberToWords(42)).toBe('Forty Two Rupees Only')
    expect(numberToWords(99)).toBe('Ninety Nine Rupees Only')
  })

  it('converts thousands', () => {
    expect(numberToWords(1000)).toBe('One Thousand Rupees Only')
    expect(numberToWords(5000)).toBe('Five Thousand Rupees Only')
    expect(numberToWords(12345)).toBe(
      'Twelve Thousand Three Hundred Forty Five Rupees Only',
    )
  })

  it('converts lakhs', () => {
    expect(numberToWords(100000)).toBe('One Lakh Rupees Only')
    expect(numberToWords(123456)).toBe(
      'One Lakh Twenty Three Thousand Four Hundred Fifty Six Rupees Only',
    )
  })

  it('converts crores', () => {
    expect(numberToWords(10000000)).toBe('One Crore Rupees Only')
    expect(numberToWords(12345678)).toBe(
      'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Rupees Only',
    )
  })

  it('converts paise and decimal amounts', () => {
    expect(numberToWords(100.5)).toBe('One Hundred Rupees and Fifty Paise Only')
    expect(numberToWords(1234.56)).toBe(
      'One Thousand Two Hundred Thirty Four Rupees and Fifty Six Paise Only',
    )
    expect(numberToWords(0.75)).toBe('Zero Rupees and Seventy Five Paise Only')
  })
})
