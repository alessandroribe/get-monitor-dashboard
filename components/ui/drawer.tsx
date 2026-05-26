"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextType | undefined>(
  undefined
)

export function Drawer({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function DrawerTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(DrawerContext)

  if (!context) {
    throw new Error("DrawerTrigger must be used within Drawer")
  }

  return (
    <button onClick={() => context.setIsOpen(true)}>
      {children}
    </button>
  )
}

export function DrawerContent({
  children,
  side = "right",
}: {
  children: React.ReactNode
  side?: "left" | "right"
}) {
  const context = React.useContext(DrawerContext)

  if (!context) {
    throw new Error("DrawerContent must be used within Drawer")
  }

  return (
    <>
      {/* Backdrop */}
      {context.isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => context.setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 w-96 bg-white shadow-lg transition-transform duration-300 ease-out z-50",
          side === "right"
            ? "right-0 translate-x-full"
            : "left-0 -translate-x-full",
          context.isOpen && (side === "right" ? "translate-x-0" : "translate-x-0")
        )}
      >
        {children}
      </div>
    </>
  )
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-gray-200 p-4",
        className
      )}
      {...props}
    />
  )
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-bold text-gray-900", className)}
      {...props}
    />
  )
}

export function DrawerClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DrawerContext)

  if (!context) {
    throw new Error("DrawerClose must be used within Drawer")
  }

  return (
    <button
      onClick={() => context.setIsOpen(false)}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto p-4", className)}
      {...props}
    />
  )
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t border-gray-200 p-4",
        className
      )}
      {...props}
    />
  )
}
