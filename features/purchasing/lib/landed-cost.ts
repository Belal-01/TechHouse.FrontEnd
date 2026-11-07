// Preview of the backend's landed-cost allocation (PurchaseInvoiceService.allocateExtra), so the form can show
// each unit's real cost before saving. The server recomputes it; this only has to match closely.
// Amounts are BigInt in 1/10,000 dollar units: no floating-point drift, and large invoices stay exact.

// BigInt() calls instead of 10n literals: the project targets ES2017.
const ZERO = BigInt(0)
const ONE = BigInt(1)
const TWO = BigInt(2)
const HUNDRED = BigInt(100)
const SCALE = BigInt(10_000)

export type CostLine = { quantity: number; unitPrice: string }

export type LineCost = {
  /** This line's share of the extra costs, in dollars. */
  extra: number
  /** Supplier price + share per unit, in dollars. */
  landedUnitCost: number
  lineValue: number
}

/** "12.5" → 125000. Returns null for anything that isn't a plain non-negative amount with ≤ 4 decimals. */
export function toUnits(value: string): bigint | null {
  const match = /^(\d{1,15})(?:\.(\d{1,4}))?$/.exec(value.trim())
  if (!match) return null
  return BigInt(match[1]) * SCALE + BigInt((match[2] ?? "").padEnd(4, "0"))
}

/** a / b rounded half-to-even, like Java's RoundingMode.HALF_EVEN (both non-negative). */
function divideHalfEven(a: bigint, b: bigint): bigint {
  const quotient = a / b
  const twiceRemainder = (a % b) * TWO
  if (twiceRemainder > b || (twiceRemainder === b && quotient % TWO === ONE)) return quotient + ONE
  return quotient
}

const toDollars = (units: bigint, scale: bigint = SCALE) => Number(units) / Number(scale)

/**
 * Spreads `extra` (shipping + customs) over the lines by value. Lines with an invalid quantity or price
 * yield null and are left out of the split until they are fixed.
 */
export function allocateLandedCost(lines: CostLine[], extra: string): (LineCost | null)[] {
  const extraUnits = toUnits(extra === "" ? "0" : extra) ?? ZERO
  const values = lines.map((line) => {
    const price = toUnits(line.unitPrice)
    const valid = price !== null && price > ZERO && Number.isInteger(line.quantity) && line.quantity > 0
    return valid ? { price, quantity: BigInt(line.quantity), value: price * BigInt(line.quantity) } : null
  })
  const total = values.reduce((sum, v) => sum + (v?.value ?? ZERO), ZERO)
  const lastValid = values.findLastIndex((v) => v !== null)

  let allocated = ZERO
  return values.map((v, index) => {
    if (!v) return null
    let share = ZERO
    if (extraUnits > ZERO && total > ZERO) {
      share = index === lastValid ? extraUnits - allocated : divideHalfEven(v.value * extraUnits, total)
    }
    allocated += share
    // landed per unit at 6 decimals: price + share / quantity
    const landed = v.price * HUNDRED + divideHalfEven(share * HUNDRED, v.quantity)
    return { extra: toDollars(share), landedUnitCost: toDollars(landed, SCALE * HUNDRED), lineValue: toDollars(v.value) }
  })
}
