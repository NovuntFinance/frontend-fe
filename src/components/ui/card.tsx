import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Glassmorphism base - iOS 21 inspired
        "relative flex flex-col gap-6 py-6",
        // Light mode: frosted glass effect
        "bg-white/80 dark:bg-gray-900/80",
        // Backdrop blur for glassmorphism
        "backdrop-blur-xl backdrop-saturate-150",
        // Premium borders with gradient
        "border border-white/30 dark:border-white/10",
        // Rounded corners - modern & friendly
        "rounded-2xl md:rounded-3xl",
        // Premium shadows with depth
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        // Smooth hover effect with lift
        "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        "hover:-translate-y-0.5 hover:border-white/50 dark:hover:border-white/20",
        // Smooth transitions
        "transition-all duration-300 ease-out",
        // Inner glow for depth
        "before:absolute before:inset-0 before:rounded-2xl md:before:rounded-3xl",
        "before:bg-gradient-to-br before:from-white/10 before:to-transparent",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        // Text color
        "text-card-foreground",
        // Mobile optimization
        "touch-manipulation",
        // GPU acceleration for smooth animations
        "transform-gpu will-change-transform",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
