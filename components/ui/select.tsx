// Inline SVG icons from Lucide (https://lucide.dev), ISC License, Copyright (c) Lucide Icons and Contributors.
import type { ComponentProps, JSX } from "@solidjs/web"
import {
  Select as SdkSelect,
  SelectTrigger as SdkSelectTrigger,
  SelectValue as SdkSelectValue,
  SelectContent as SdkSelectContent,
  SelectList as SdkSelectList,
  SelectGroup as SdkSelectGroup,
  SelectGroupLabel as SdkSelectGroupLabel,
  SelectItem as SdkSelectItem,
  SelectItemText as SdkSelectItemText,
  SelectItemIndicator as SdkSelectItemIndicator,
  SelectSeparator as SdkSelectSeparator
} from "@ui-sdk/solid/select"
import { omit } from "solid-js"

import { cn } from "@/lib/utils"
const Select = SdkSelect
const SelectGroup = (
  props: Omit<ComponentProps<typeof SdkSelectGroup>, "class" | "children"> & {
    class?: string
    children?: JSX.Element
  }
) => <SdkSelectGroup {...props} class={cn("scroll-my-1 p-1", props.class)} />
const SelectLabel = (
  props: Omit<
    ComponentProps<typeof SdkSelectGroupLabel>,
    "class" | "children"
  > & {
    class?: string
    children?: JSX.Element
  }
) => (
  <SdkSelectGroupLabel {...props} class={cn("px-1.5 py-1 text-xs text-muted-foreground", props.class)} />
)
const SelectValue = (
  props: Omit<ComponentProps<typeof SdkSelectValue>, "class"> & {
    class?: string
  }
) => <SdkSelectValue {...props} class={cn("flex flex-1 text-left", props.class)} />
type SelectTriggerProps = Omit<
  ComponentProps<typeof SdkSelectTrigger>,
  "class"
> & {
  class?: string
  size?: "sm" | "default"
}
const SelectTrigger = (props: SelectTriggerProps) => {
  const rest = omit(props, "class", "size", "children")
  return (
    <SdkSelectTrigger
      {...rest}
      data-size={props.size ?? "default"}
      class={cn(
        "gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
    >
      {props.children}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="size-4 text-muted-foreground pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SdkSelectTrigger>
  )
}
const SelectContent = (
  props: Omit<ComponentProps<typeof SdkSelectContent>, "class" | "children"> & {
    class?: string
    children?: JSX.Element
  }
) => {
  const rest = omit(props, "class", "children")
  return (
    <SdkSelectContent
      sideOffset={4}
      align="center"
      {...rest}
      class={cn(
        "min-w-36 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 relative z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto",
        props.class
      )}
    >
      <SdkSelectList class="has-[>[data-slot=select-item]]:p-1">{props.children}</SdkSelectList>
    </SdkSelectContent>
  )
}
const SelectItem = (
  props: Omit<ComponentProps<typeof SdkSelectItem>, "class" | "children"> & {
    class?: string
    children?: JSX.Element
  }
) => {
  const rest = omit(props, "class", "children")
  return (
    <SdkSelectItem
      {...rest}
      class={cn(
        "gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
    >
      <SdkSelectItemText class="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
        {props.children}
      </SdkSelectItemText>
      <SdkSelectItemIndicator class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          class="pointer-events-none"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </SdkSelectItemIndicator>
    </SdkSelectItem>
  )
}
const SelectSeparator = (
  props: Omit<
    ComponentProps<typeof SdkSelectSeparator>,
    "class" | "children"
  > & {
    class?: string
    children?: JSX.Element
  }
) => (
  <SdkSelectSeparator
    {...props}
    class={cn("-mx-1 my-1 h-px bg-border pointer-events-none", props.class)}
  />
)
export {
  Select,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator
}
