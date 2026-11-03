# TechHouse frontend — project rules

These rules apply to all work in `techhouse.frontend/`. Follow them exactly. If a rule blocks a task, ask before breaking it.

Design system rules (colors, type, logo, flat UI) are imported here and are mandatory:

@../tech-house-claude-code-kit/CLAUDE.md

## 1. Reusable, dynamic components — no boilerplate

- Never copy-paste markup between screens. When the same UI shape is needed a second time, extract a shared component first, then use it in both places.
- Before creating a component, search `components/` for one that already does the job. Extend it with a prop or a variant instead of writing a near-duplicate.
- Make components data-driven: configure them with props and config objects (`columns`, `fields`, `actions`, `filters`) instead of hardcoding content. A new list or form screen should be mostly configuration.
- Express visual variations with `cva` variants, not ad-hoc `className` conditionals.
- Every component accepts `className` and forwards the remaining props to its root element.
- Shared components contain no feature logic and no hardcoded copy; pass labels and text in as props.
- Type every prop. Generic components use TypeScript generics (for example `DataTable<TRow>`). No `any`.
- One responsibility per component. Split it when it grows past ~150 lines, or when it mixes data fetching with presentation.

## 2. shadcn/ui is the component base

- Build UI from shadcn components: `pnpm dlx shadcn@latest add <component>`. The style is `base-nova` (Base UI primitives) with `rtl: true`, as set in `components.json`.
- Don't hand-write a primitive that shadcn provides (button, input, label, field, select, checkbox, dialog, sheet, dropdown-menu, popover, table, tabs, badge, skeleton, sonner, and so on).
- Generated files go to `components/ui/`. Adapt each one to the design system in the same change:
  - Remove every shadow (`shadow-*`) and ring style (`ring-*`, `focus-visible:ring-*`, and `outline-none` on focusable elements). The global `:focus-visible` rule from `tokens.css` draws the focus outline.
  - Use only `rounded-sm` (inputs, tags) and `rounded-md` (buttons, cards, panels).
  - Use colors only through the mapped Tailwind names: `bg-primary`, `bg-secondary`, `bg-card`, `bg-muted`, `border-input`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-red`, `text-blue`, `bg-blue-tint`. No hex, no `oklch`, no Tailwind palette colors (`red-500`, `gray-200`, ...).
  - Replace physical direction classes with logical ones: `ms/me/ps/pe`, `inset-s/inset-e`, `text-start/text-end`, `border-s/border-e`.
- Exception: dropdown and menu items keep shadcn's highlight-on-focus (`focus:bg-accent`) instead of an outline; inside the sidebar the outline is drawn inset (`-outline-offset-2`) so the scroll container doesn't clip it.
- When editing generated class strings, check that no two class names got glued together (missing space).
- Navigation that looks like a button uses `ButtonLink` (`components/common/button-link.tsx`), never `<Button render={<Link/>}>`: Base UI then adds `role="button"` and the link is announced as a button.
- Don't edit a `components/ui` file for one screen's needs. Compose it, or add a variant that is useful everywhere.
- Reusable blocks composed from shadcn primitives go in `components/common/` (for example `data-table`, `page-header`, `empty-state`, `confirm-dialog`, form-field adapters for react-hook-form).

## 3. Feature-based architecture

```
app/                     routes only: compose feature components, no business logic, no fetching
features/<name>/
  api/                   request functions, React Query hooks, query-key factory
  actions/               server actions ("use server")
  components/            feature UI, built from shared components
  schemas/               zod schemas (Arabic messages)
  lib/                   feature helpers
  server/                server-only code (session reads, etc.)
  types.ts               backend DTO types for this feature
  index.ts               public client-safe API
  server/index.ts        public server-only API
components/ui/           shadcn primitives (adapted to the design system)
components/common/       reusable composite components (page-header, empty-state, ...)
components/layout/       app shell: data-driven app-sidebar, app-header, shell skeleton
components/brand/        logo
config/                  app-level config data, e.g. navigation.ts (sidebar items)
hooks/                   shared React hooks
lib/                     shared infrastructure (api client, auth cookies, env, format, utils)
```

- Import a feature only through `@/features/<name>` or `@/features/<name>/server`. Inside a feature, use relative imports.
- New screens are added to the sidebar by editing `config/navigation.ts` only (remove `disabled` when a screen ships). Never hand-write sidebar markup.
- Shared code (`components/`, `lib/`) never imports a feature.
- A feature never imports another feature's internals. If two features need the same thing, move it into shared code.
- These import rules are enforced by ESLint (`eslint.config.mjs`). Don't disable them.

## 4. Data and API

- The browser talks to the backend only through `api` from `@/lib/api/client` (the `/api/proxy/admin/**` BFF). Never call the backend URL from the browser.
- Never store tokens in JavaScript, `localStorage` or `sessionStorage`. Tokens live only in httpOnly cookies set on the server.
- Each feature defines a query-key factory (for example `productKeys.list(filter)`). Mutations invalidate by those keys.
- Show errors with `errorMessage(code)` from `@/lib/api/errors`. Add every new backend error code there with an Arabic message. Map `fieldErrors` from the backend onto the matching form fields.
- Forms use react-hook-form with the zod schema from `schemas/`. Server actions validate with the same schema again; never trust the client.

## 5. Design system, Arabic and RTL

- `design-system/tokens.css` is a synced copy of the kit's file. Never edit it by hand: change `tokens.json` in the kit, regenerate there, then run `pnpm tokens:sync`. The sync strips the Google Fonts `@import` (fonts are self-hosted by `next/font`; that import breaks `next dev`).
- UI copy is Arabic. Pages are `dir="rtl"`; use `dir="ltr"` on emails, SKUs, codes and other Latin or numeric fields.
- Use the type classes from `tokens.css` (`h1`, `h2`, `h3`, `body`, `small`) for text styles.
- Never apply letter-spacing to Arabic text: it breaks letter joining. For buttons and labels use 14px / semibold instead of the `label` class.
- One primary (red) action per view. Secondary actions use `secondary`, `outline` or `ghost`.
- Format numbers, money and dates through one shared formatter in `lib/` (`Intl`), never by hand.
- Every screen must work in light and dark themes and at 375px width without horizontal scrolling.

## 6. Next.js 16 specifics

- Route protection lives in `proxy.ts` (`middleware.ts` is deprecated in this version).
- `cacheComponents` is on. Reads of `cookies()`, the session or `searchParams` must sit inside `<Suspense>`; push dynamic access down instead of awaiting it at the top of a layout. Don't add a `runtime` export.
- Never import a constant or function value from a `"use client"` module into a Server Component: the server receives a client reference, not the value. Put shared constants in a plain module (e.g. `components/ui/sidebar.constants.ts`).
- Server-only modules start with `import "server-only"`. Client components never import `@/features/<name>/server`.
- Don't build `--font-sans` from `next/font` `--font-*` variables: their Arial fallback renders Arabic instead of Noto Kufi Arabic. The `tokens.css` font stack is the one to use.
- This Next.js version differs from older documentation. When unsure about an API, read `node_modules/next/dist/docs/` first.

## 7. Done means verified

Before reporting a task as done:

- `pnpm lint`, `npx tsc --noEmit` and `pnpm build` all pass, and the page also loads under `pnpm dev` (dev is stricter than build for some CSS errors).
- UI changes are checked in a real browser in light and dark themes, and at 375px width.
- Forms are accessible: every input has a label, errors use `aria-invalid` and `aria-describedby`, and everything works from the keyboard.
