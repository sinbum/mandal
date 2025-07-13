import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRightIcon, HomeIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid"

import { cn } from "@/lib/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" className="flex" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      role="list"
      data-slot="breadcrumb-list"
      className={cn(
        "flex items-center space-x-4",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("text-sm font-medium text-gray-500", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("flex items-center", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <EllipsisHorizontalIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
      <span className="sr-only">More</span>
    </span>
  )
}

function BreadcrumbHome({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"
  
  return (
    <Comp
      data-slot="breadcrumb-home"
      className={cn("text-gray-400 hover:text-gray-500", className)}
      {...props}
    >
      <div className="flex items-center">
        <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
        <span className="sr-only">Home</span>
      </div>
    </Comp>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbHome,
}
