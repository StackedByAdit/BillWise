import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  formatInvoiceNumber,
  getNextCounterState,
  reserveNextInvoiceNumber,
  assignInvoiceNumber,
  clearDraftInvoiceNumber,
} from './invoiceNumber'

function createStorageMock() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe('formatInvoiceNumber', () => {
  it('formats invoice numbers with a zero-padded sequence', () => {
    expect(formatInvoiceNumber(2026, 1)).toBe('INV-2026-0001')
    expect(formatInvoiceNumber(2026, 42)).toBe('INV-2026-0042')
  })
})

describe('getNextCounterState', () => {
  it('starts a new sequence when the year changes', () => {
    expect(getNextCounterState({ year: 2025, sequence: 18 }, 2026)).toEqual({
      year: 2026,
      sequence: 1,
    })
  })

  it('increments the sequence within the same year', () => {
    expect(getNextCounterState({ year: 2026, sequence: 7 }, 2026)).toEqual({
      year: 2026,
      sequence: 8,
    })
  })
})

describe('reserveNextInvoiceNumber', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.stubGlobal('sessionStorage', createStorageMock())
  })

  it('persists an incrementing counter in localStorage', () => {
    const year = new Date().getFullYear()
    const first = reserveNextInvoiceNumber()
    const second = reserveNextInvoiceNumber()

    expect(first).toBe(formatInvoiceNumber(year, 1))
    expect(second).toBe(formatInvoiceNumber(year, 2))
  })
})

describe('assignInvoiceNumber', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock())
    vi.stubGlobal('sessionStorage', createStorageMock())
  })

  it('reuses the same draft number within a session', () => {
    const year = new Date().getFullYear()
    const first = assignInvoiceNumber()
    const second = assignInvoiceNumber()

    expect(first).toBe(formatInvoiceNumber(year, 1))
    expect(second).toBe(formatInvoiceNumber(year, 1))
  })

  it('reserves a new number after the draft is cleared', () => {
    const year = new Date().getFullYear()

    expect(assignInvoiceNumber()).toBe(formatInvoiceNumber(year, 1))
    clearDraftInvoiceNumber()
    expect(assignInvoiceNumber()).toBe(formatInvoiceNumber(year, 2))
  })
})
