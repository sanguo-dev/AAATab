import type { ComponentProps } from "@solidjs/web"
import {
  Drawer as SdkDrawer,
  DrawerTrigger as SdkDrawerTrigger,
  DrawerClose as SdkDrawerClose,
  DrawerContent as SdkDrawerContent,
  DrawerBackdrop as SdkDrawerBackdrop,
  DrawerHandle as SdkDrawerHandle,
  DrawerTitle as SdkDrawerTitle,
  DrawerDescription as SdkDrawerDescription
} from "@ui-sdk/solid/drawer"

import { cn } from "@/lib/utils"

export const Drawer = SdkDrawer
export const DrawerTrigger = SdkDrawerTrigger
export const DrawerClose = SdkDrawerClose
export function DrawerOverlay(
  props: Omit<ComponentProps<typeof SdkDrawerBackdrop>, "class"> & {
    class?: string
  }
) {
  return (
    <SdkDrawerBackdrop
      {...props}
      class={cn("bg-black/10 supports-backdrop-filter:backdrop-blur-xs", props.class)}
    />
  )
}
export function DrawerContent(
  props: Omit<ComponentProps<typeof SdkDrawerContent>, "class"> & {
    class?: string
  }
) {
  // The SDK positions and moves the sheet. Only its contents and appearance are styled here.
  //
  // Local edit: the backdrop is NOT rendered here any more. It is a full-screen
  // layer that covered the page and swallowed pointer events (right-click, wheel).
  // Render <DrawerOverlay /> yourself when a drawer really should dim the page.
  return (
    <SdkDrawerContent
      {...props}
      class={cn(
        "flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[side=bottom]:rounded-t-xl data-[side=bottom]:border-t data-[side=left]:rounded-r-xl data-[side=left]:border-r data-[side=right]:rounded-l-xl data-[side=right]:border-l data-[side=top]:rounded-b-xl data-[side=top]:border-b flex max-h-[90svh] flex-col data-[side=left]:max-w-sm data-[side=right]:max-w-sm",
        props.class
      )}
    />
  )
}
export function DrawerHandle(
  props: Omit<ComponentProps<typeof SdkDrawerHandle>, "class"> & {
    class?: string
  }
) {
  return (
    <SdkDrawerHandle
      aria-label="Resize drawer"
      {...props}
      class={cn(
        "mx-auto my-3 h-1 w-24 shrink-0 rounded-full bg-muted",
        props.class
      )}
    />
  )
}
export function DrawerTitle(
  props: Omit<ComponentProps<typeof SdkDrawerTitle>, "class"> & {
    class?: string
  }
) {
  return (
    <SdkDrawerTitle {...props} class={cn("text-base font-medium text-foreground", props.class)} />
  )
}
export function DrawerDescription(
  props: Omit<ComponentProps<typeof SdkDrawerDescription>, "class"> & {
    class?: string
  }
) {
  return (
    <SdkDrawerDescription
      {...props}
      class={cn("text-sm text-muted-foreground", props.class)}
    />
  )
}
export function DrawerHeader(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="drawer-header"
      class={cn("gap-0.5 p-4 md:gap-0.5 md:text-left flex flex-col", props.class)}
    />
  )
}
export function DrawerFooter(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      data-slot="drawer-footer"
      class={cn("gap-2 p-4 mt-auto flex flex-col", props.class)}
    />
  )
}
