// Copies the design-system tokens from the kit into this app.
// Drops the Google Fonts @import: next/font self-hosts Archivo and Noto Kufi Arabic, and a remote @import
// inlined after other rules is invalid CSS ("@import rules must precede all rules") and breaks `next dev`.
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = resolve(root, "../tech-house-claude-code-kit/design-system/tokens.css")
const target = resolve(root, "design-system/tokens.css")

const css = readFileSync(source, "utf8")
const output = css
  .split("\n")
  .filter((line) => !/^\s*@import\s+url\(\s*["']?https?:\/\//.test(line))
  .join("\n")

writeFileSync(
  target,
  output.replace(
    /^(\/\*.*?\*\/)/,
    "$1\n/* Synced by scripts/sync-tokens.mjs (pnpm tokens:sync). Fonts are self-hosted via next/font. */",
  ),
)
console.log(`tokens.css synced (${css.length - output.length} bytes of remote @import removed)`)
