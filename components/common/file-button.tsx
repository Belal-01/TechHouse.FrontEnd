"use client"

import { useRef, type ComponentProps } from "react"
import { Button } from "@/components/ui/button"

type FileButtonProps = Omit<ComponentProps<typeof Button>, "onClick" | "type"> & {
  /** e.g. "application/pdf" or "image/png,image/jpeg". */
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
}

/** A button that opens the file chooser. The native input stays hidden; the button is what users focus and press. */
export function FileButton({ accept, multiple = false, onFiles, children, ...props }: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <Button type="button" onClick={() => inputRef.current?.click()} {...props}>
        {children}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        tabIndex={-1}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          // Reset so choosing the same file again still fires onChange.
          event.target.value = ""
          if (files.length > 0) onFiles(files)
        }}
      />
    </>
  )
}
