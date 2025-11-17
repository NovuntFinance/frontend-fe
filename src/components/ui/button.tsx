import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles with premium feel
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] touch-manipulation transform-gpu will-change-transform",
  {
    variants: {
      variant: {
        default: 
          // Premium gradient with glassmorphism
          "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary hover:shadow-lg hover:shadow-primary/30 rounded-xl shadow-md",
        destructive:
          // Modern destructive with glow
          "bg-gradient-to-br from-destructive to-destructive/90 text-white hover:from-destructive/90 hover:to-destructive hover:shadow-lg hover:shadow-destructive/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 rounded-xl shadow-md",
        outline:
          // Glass button with frosted effect
          "border border-white/30 dark:border-white/10 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md hover:bg-white/30 dark:hover:bg-gray-900/30 hover:border-white/50 dark:hover:border-white/20 hover:shadow-lg shadow-black/5 dark:shadow-black/20 rounded-xl",
        secondary:
          // Soft glassmorphism secondary
          "bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary hover:shadow-lg shadow-black/5 rounded-xl",
        ghost:
          // Minimal with hover glow
          "hover:bg-accent/50 backdrop-blur-sm hover:text-accent-foreground dark:hover:bg-accent/30 rounded-xl",
        link: 
          // Clean link style
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4 rounded-xl",
        sm: "h-9 gap-1.5 px-4 py-2 has-[>svg]:px-3 rounded-lg text-xs",
        lg: "h-12 px-7 py-3 has-[>svg]:px-5 rounded-xl text-base",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
