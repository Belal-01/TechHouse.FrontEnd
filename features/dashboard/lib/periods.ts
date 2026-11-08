import { endOfMonth, format, startOfMonth, startOfWeek, subMonths } from "date-fns"

export const PERIODS = ["today", "week", "month", "lastMonth", "3months", "6months", "custom"] as const
export type PeriodKey = (typeof PERIODS)[number]

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "اليوم",
  week: "هذا الأسبوع",
  month: "هذا الشهر",
  lastMonth: "الشهر الماضي",
  "3months": "آخر 3 أشهر",
  "6months": "آخر 6 أشهر",
  custom: "فترة مخصصة",
}

const iso = (d: Date) => format(d, "yyyy-MM-dd")

/** Inclusive local dates for a preset. Weeks start on Saturday, as in Syria. "Last N months" includes this month. */
export function periodRange(key: Exclude<PeriodKey, "custom">, today = new Date()): { from: string; to: string } {
  switch (key) {
    case "today":
      return { from: iso(today), to: iso(today) }
    case "week":
      return { from: iso(startOfWeek(today, { weekStartsOn: 6 })), to: iso(today) }
    case "month":
      return { from: iso(startOfMonth(today)), to: iso(today) }
    case "lastMonth": {
      const last = subMonths(today, 1)
      return { from: iso(startOfMonth(last)), to: iso(endOfMonth(last)) }
    }
    case "3months":
      return { from: iso(startOfMonth(subMonths(today, 2))), to: iso(today) }
    case "6months":
      return { from: iso(startOfMonth(subMonths(today, 5))), to: iso(today) }
  }
}
