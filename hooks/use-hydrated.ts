import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * False during server rendering and hydration, true afterwards. Use it when a query can already be cached by
 * another component on the page (e.g. the header): render the loading state until hydrated, so the first client
 * render matches the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
