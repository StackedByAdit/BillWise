const ONES = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
] as const

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
] as const

function wordsBelow100(value: number): string {
  if (value < 20) {
    return ONES[value] ?? ''
  }

  const tens = Math.floor(value / 10)
  const ones = value % 10

  if (ones === 0) {
    return TENS[tens] ?? ''
  }

  return `${TENS[tens]} ${ONES[ones]}`
}

function wordsBelow1000(value: number): string {
  if (value === 0) {
    return ''
  }

  if (value < 100) {
    return wordsBelow100(value)
  }

  const hundreds = Math.floor(value / 100)
  const remainder = value % 100
  const hundredPart = `${ONES[hundreds]} Hundred`

  if (remainder === 0) {
    return hundredPart
  }

  return `${hundredPart} ${wordsBelow100(remainder)}`
}

function wordsForIndianRupees(rupees: number): string {
  if (rupees === 0) {
    return 'Zero'
  }

  let remaining = rupees
  const parts: string[] = []

  const crores = Math.floor(remaining / 10_000_000)
  remaining %= 10_000_000
  if (crores > 0) {
    parts.push(`${wordsBelow100(crores)} Crore`)
  }

  const lakhs = Math.floor(remaining / 100_000)
  remaining %= 100_000
  if (lakhs > 0) {
    parts.push(`${wordsBelow100(lakhs)} Lakh`)
  }

  const thousands = Math.floor(remaining / 1000)
  remaining %= 1000
  if (thousands > 0) {
    parts.push(`${wordsBelow100(thousands)} Thousand`)
  }

  const belowThousand = wordsBelow1000(remaining)
  if (belowThousand) {
    parts.push(belowThousand)
  }

  return parts.join(' ')
}

export function numberToWords(amount: number): string {
  const normalized = Math.round(Math.abs(amount) * 100) / 100
  const rupees = Math.floor(normalized)
  const paise = Math.round((normalized - rupees) * 100)

  const rupeeWords = wordsForIndianRupees(rupees)
  let result = `${rupeeWords} Rupees`

  if (paise > 0) {
    result += ` and ${wordsBelow100(paise)} Paise`
  }

  return `${result} Only`
}
