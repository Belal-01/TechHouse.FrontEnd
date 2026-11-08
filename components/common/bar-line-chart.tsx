"use client"

import { useState, type KeyboardEvent } from "react"
import { useElementWidth } from "@/hooks/use-element-width"
import { cn } from "@/lib/utils"

export type BarLinePoint = {
  key: string
  /** Short x-axis label, e.g. "8/11". */
  label: string
  /** Longer label for the tooltip and the table, e.g. "8 تشرين الثاني". */
  title: string
  bar: number
  line: number
}

type BarLineChartProps = {
  points: BarLinePoint[]
  /** Context series (gray bars), e.g. revenue. */
  barLabel: string
  /** The series that matters (accent line), e.g. net profit. */
  lineLabel: string
  formatValue: (value: number) => string
  formatAxis: (value: number) => string
  /** Accessible name, and the caption of the data table for screen readers. */
  caption: string
  height?: number
  className?: string
}

const PAD = { top: 12, right: 12, bottom: 28, left: 52 }

/** A step of 1, 2 or 5 × 10ⁿ, so gridlines land on round numbers. */
function niceStep(value: number): number {
  if (value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  return ([1, 2, 5, 10].find((m) => m * power >= value) ?? 10) * power
}

/** Axis from a round floor (≤ 0) to a round ceiling, in 4 equal round steps. */
function niceAxis(min: number, max: number): { bottom: number; top: number; step: number } {
  const low = Math.min(0, min)
  const high = Math.max(0, max)
  const step = niceStep((high - low || 1) / 4)
  return { bottom: Math.floor(low / step) * step, top: Math.ceil(high / step) * step || step, step }
}

/**
 * Emphasis chart on one USD axis: context bars in gray, the key series as a blue line (may go below zero).
 * Hover or arrow keys show a crosshair and tooltip; a hidden table carries the same data for screen readers.
 * Colors: chart-5 (accent) and input (gray), validated as a pair for colour-blind separation in both themes.
 */
export function BarLineChart({ points, barLabel, lineLabel, formatValue, formatAxis, caption, height = 240, className }: BarLineChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const values = points.flatMap((p) => [p.bar, p.line])
  const { bottom, top, step } = niceAxis(Math.min(...values, 0), Math.max(...values, 0))
  const plotW = Math.max(width - PAD.left - PAD.right, 0)
  const plotH = height - PAD.top - PAD.bottom
  const band = points.length ? plotW / points.length : 0
  const x = (i: number) => PAD.left + band * i + band / 2
  const y = (v: number) => PAD.top + ((top - v) / (top - bottom)) * plotH
  const barW = Math.max(Math.min(24, band * 0.6), 1)
  const ticks = Array.from({ length: Math.round((top - bottom) / step) + 1 }, (_, i) => bottom + step * i)
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(plotW / 56))))
  const showMarkers = points.length <= 16
  const linePath = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.line)}`).join(" ")

  const onKey = (event: KeyboardEvent) => {
    if (!points.length) return
    // The chart runs left-to-right (time), so arrows follow the screen, not the reading direction.
    if (event.key === "ArrowRight") setActive((i) => Math.min((i ?? -1) + 1, points.length - 1))
    else if (event.key === "ArrowLeft") setActive((i) => Math.max((i ?? points.length) - 1, 0))
    else if (event.key === "Escape") setActive(null)
    else return
    event.preventDefault()
  }

  const current = active === null ? null : points[active]
  const tipLeft = active === null ? 0 : Math.min(Math.max(x(active), 80), Math.max(width - 80, 80))

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ul className="flex flex-wrap gap-4 small text-muted-foreground" aria-hidden>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-input" />
          {barLabel}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-sm bg-chart-5" />
          {lineLabel}
        </li>
      </ul>

      <div
        ref={ref}
        dir="ltr"
        className="relative"
        role="img"
        aria-label={caption}
        tabIndex={0}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
      >
        {width > 0 ? (
          <svg width={width} height={height} className="block overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-input" : "stroke-border"} strokeWidth={1} />
                <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {formatAxis(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) =>
              p.bar > 0 ? (
                // 4px rounded data end, square at the baseline.
                <path
                  key={p.key}
                  d={`M${x(i) - barW / 2},${y(0)} V${y(p.bar) + Math.min(4, y(0) - y(p.bar))} q0,-4 4,-4 H${x(i) + barW / 2 - 4} q4,0 4,4 V${y(0)} Z`}
                  className="fill-input"
                />
              ) : null,
            )}
            {active !== null ? <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-muted-foreground" strokeWidth={1} /> : null}
            <path d={linePath} fill="none" className="stroke-chart-5" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) =>
              showMarkers || i === active || i === points.length - 1 ? (
                <circle key={p.key} cx={x(i)} cy={y(p.line)} r={i === active ? 5 : 4} className="fill-chart-5 stroke-card" strokeWidth={2} />
              ) : null,
            )}
            {points.map((p, i) =>
              i % labelEvery === 0 ? (
                <text key={p.key} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                  {p.label}
                </text>
              ) : null,
            )}
            {/* Hit areas: a whole column per bucket, wider than any mark. */}
            {points.map((p, i) => (
              <rect key={p.key} x={PAD.left + band * i} y={PAD.top} width={band} height={plotH} fill="transparent" onMouseEnter={() => setActive(i)} />
            ))}
          </svg>
        ) : (
          <div style={{ height }} />
        )}

        {current ? (
          <div
            dir="rtl"
            className="pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 flex-col gap-1 rounded-md border bg-popover px-3 py-2 small"
            style={{ left: tipLeft }}
            aria-live="polite"
          >
            <span className="font-semibold text-foreground">{current.title}</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2.5 rounded-sm bg-input" />
              {barLabel}: <span dir="ltr" className="text-foreground">{formatValue(current.bar)}</span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-0.5 w-3 bg-chart-5" />
              {lineLabel}: <span dir="ltr" className="text-foreground">{formatValue(current.line)}</span>
            </span>
          </div>
        ) : null}
      </div>

      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">الفترة</th>
            <th scope="col">{barLabel}</th>
            <th scope="col">{lineLabel}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <th scope="row">{p.title}</th>
              <td>{formatValue(p.bar)}</td>
              <td>{formatValue(p.line)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
