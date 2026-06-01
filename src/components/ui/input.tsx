import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "text-copy-16 md:text-label-14 h-8 w-full min-w-0 rounded-[var(--radius-geist-base)] border border-input bg-background px-2.5 py-1 outline-none transition-[background-color,border-color,box-shadow,opacity] duration-150 ease-out file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-label-13 file:font-medium file:text-foreground placeholder:text-muted-foreground focus-geist disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
