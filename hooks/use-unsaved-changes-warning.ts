import { useEffect } from "react"

/** Asks the browser to confirm before closing or reloading the tab while `when` is true. */
export function useUnsavedChangesWarning(when: boolean) {
  useEffect(() => {
    if (!when) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [when])
}
