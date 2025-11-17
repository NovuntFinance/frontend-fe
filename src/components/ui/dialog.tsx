"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Premium backdrop with blur - iOS style
        "fixed inset-0 z-50",
        "bg-black/60 dark:bg-black/70",
        "backdrop-blur-md backdrop-saturate-150",
        // Smooth fade animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=open]:duration-300 data-[state=closed]:duration-200",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Position and sizing
          "fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]",
          // Mobile-first sizing with max constraints
          "max-w-[calc(100%-2rem)] max-h-[calc(100vh-2rem)]",
          "sm:max-w-lg md:max-w-xl lg:max-w-2xl",
          // Spacing and layout
          "gap-6 p-6 sm:p-8",
          // Glassmorphism with iOS feel
          "bg-white/95 dark:bg-gray-900/95",
          "backdrop-blur-2xl backdrop-saturate-200",
          // Premium borders
          "border border-white/30 dark:border-white/10",
          // Rounded corners - more generous for modern look
          "rounded-2xl sm:rounded-3xl",
          // Premium shadows with depth
          "shadow-2xl shadow-black/20 dark:shadow-black/40",
          // Smooth animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-top-[2%]",
          "data-[state=open]:slide-in-from-top-[2%]",
          "data-[state=open]:duration-300 data-[state=closed]:duration-200",
          // Scrollable content
          "overflow-y-auto",
          // Custom scrollbar
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-300/70 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-700/70",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              // Position - mobile-friendly size
              "absolute top-4 right-4 sm:top-6 sm:right-6",
              // Glass button style
              "flex items-center justify-center",
              "size-10 sm:size-9",
              "rounded-xl",
              "bg-white/50 dark:bg-gray-800/50",
              "backdrop-blur-sm",
              "border border-white/30 dark:border-white/10",
              // Hover and focus states
              "hover:bg-white/70 dark:hover:bg-gray-800/70",
              "hover:border-white/50 dark:hover:border-white/20",
              "focus:ring-2 focus:ring-primary/30 focus:outline-none",
              // Icon styling
              "text-gray-600 dark:text-gray-400",
              "hover:text-gray-900 dark:hover:text-gray-100",
              // Smooth transitions
              "transition-all duration-200",
              // Touch-friendly
              "touch-manipulation active:scale-95",
              // Disabled state
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <X className="size-5 sm:size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
