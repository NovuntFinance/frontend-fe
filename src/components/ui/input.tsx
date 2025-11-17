import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Glassmorphism base
        "w-full min-w-0 rounded-xl md:rounded-2xl border px-4 py-3 h-11 md:h-12",
        // Glass effect with backdrop blur
        "bg-white/40 dark:bg-gray-900/40 backdrop-blur-md",
        // Premium borders
        "border-white/30 dark:border-white/10",
        // Shadows for depth
        "shadow-sm shadow-black/5 dark:shadow-black/10",
        // Text styling
        "text-base md:text-sm font-medium",
        // Placeholder styling
        "placeholder:text-muted-foreground/60 placeholder:font-normal",
        // Selection styling
        "selection:bg-primary selection:text-primary-foreground",
        // Focus state with glow
        "focus-visible:border-primary/50 focus-visible:ring-primary/30 focus-visible:ring-4",
        "focus-visible:bg-white/60 dark:focus-visible:bg-gray-900/60",
        "focus-visible:shadow-lg focus-visible:shadow-primary/10",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Smooth transitions
        "transition-all duration-300 ease-out",
        // File input styling
        "file:inline-flex file:h-8 file:border-0 file:bg-primary/10 file:text-primary",
        "file:px-3 file:py-1.5 file:rounded-lg file:text-sm file:font-semibold file:mr-3",
        "file:hover:bg-primary/20 file:transition-colors",
        // Mobile optimization
        "touch-manipulation",
        // Outline
        "outline-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
