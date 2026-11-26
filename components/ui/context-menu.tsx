// Inline SVG icons from Lucide (https://lucide.dev), ISC License, Copyright (c) Lucide Icons and Contributors.
import { type ComponentProps } from "@solidjs/web"
import {
  Menu as SdkMenu,
  MenuContextTrigger as SdkMenuContextTrigger,
  MenuContent as SdkMenuContent,
  MenuGroup as SdkMenuGroup,
  MenuGroupLabel as SdkMenuGroupLabel,
  MenuItem as SdkMenuItem,
  MenuSub as SdkMenuSub,
  MenuSubTrigger as SdkMenuSubTrigger,
  MenuSubContent as SdkMenuSubContent,
  MenuCheckboxItem as SdkMenuCheckboxItem,
  MenuItemIndicator as SdkMenuItemIndicator,
  MenuRadioGroup as SdkMenuRadioGroup,
  MenuRadioItem as SdkMenuRadioItem,
  MenuSeparator as SdkMenuSeparator
} from "@ui-sdk/solid/menu"
import { createUniqueId, merge, omit } from "solid-js"

import { cn } from "@/lib/utils"
type ContextMenuProps = ComponentProps<typeof SdkMenu>
const ContextMenu = (props: ContextMenuProps) => <SdkMenu {...props} />
type ContextMenuTriggerProps = Omit<
  ComponentProps<typeof SdkMenuContextTrigger>,
  "class"
> & {
  class?: string
}
const ContextMenuTrigger = (props: ContextMenuTriggerProps) => (
  <SdkMenuContextTrigger
    {...props}
    class={cn("select-none", props.class)}
  />
)
type ContextMenuContentProps = Omit<
  ComponentProps<typeof SdkMenuContent>,
  "class"
> & {
  class?: string
}
const ContextMenuContent = (props: ContextMenuContentProps) => (
  <>
    <SdkMenuContent
      {...props}
      class={cn(
        "min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none",
        props.class
      )}
    />
  </>
)
type ContextMenuGroupProps = Omit<
  ComponentProps<typeof SdkMenuGroup>,
  "class"
> & {
  class?: string
}
const ContextMenuGroup = (props: ContextMenuGroupProps) => (
  <SdkMenuGroup {...props} class={props.class} />
)
type ContextMenuLabelProps = (Omit<
  ComponentProps<typeof SdkMenuGroupLabel>,
  "class"
> & {
  class?: string
}) & {
  inset?: boolean
}
const ContextMenuLabel = (props: ContextMenuLabelProps) => {
  const others = omit(props, "class", "inset")
  return (
    <SdkMenuGroupLabel
      class={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground data-inset:pl-7 data-inset:pl-8", props.class)}
      data-inset={props.inset}
      {...others}
    />
  )
}
type ContextMenuItemProps = (Omit<
  ComponentProps<typeof SdkMenuItem>,
  "class"
> & {
  class?: string
}) & {
  inset?: boolean
  variant?: "default" | "destructive"
}
const ContextMenuItem = (rawProps: ContextMenuItemProps) => {
  const local = merge(
    { variant: "default" } as ContextMenuItemProps,
    rawProps
  ) as ContextMenuItemProps
  const others = omit(rawProps, "class", "inset", "variant")
  return (
    <SdkMenuItem
      class={cn(
        "group/context-menu-item gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg:not([class*='size-'])]:size-4 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive relative flex cursor-default items-center outline-hidden select-none data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        local.class
      )}
      data-inset={local.inset}
      data-variant={local.variant}
      {...others}
    />
  )
}
type ContextMenuSubProps = ComponentProps<typeof SdkMenuSub>
const ContextMenuSub = (props: ContextMenuSubProps) => <SdkMenuSub {...props} />
type ContextMenuSubTriggerProps = (Omit<
  ComponentProps<typeof SdkMenuSubTrigger>,
  "class"
> & {
  class?: string
}) & {
  inset?: boolean
}
const ContextMenuSubTrigger = (props: ContextMenuSubTriggerProps) => {
  const others = omit(props, "class", "children", "inset")
  return (
    <SdkMenuSubTrigger
      class={cn(
        "gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      data-inset={props.inset}
      {...others}
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
        class="ml-auto"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </SdkMenuSubTrigger>
  )
}
type ContextMenuSubContentProps = Omit<
  ComponentProps<typeof SdkMenuSubContent>,
  "class"
> & {
  class?: string
}
const ContextMenuSubContent = (props: ContextMenuSubContentProps) => (
  <>
    <SdkMenuSubContent
      {...props}
      class={cn(
        "min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 min-w-32 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg duration-100 data-ending-style:animate-out data-ending-style:fade-out-0 data-ending-style:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 shadow-lg z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none",
        props.class
      )}
    />
  </>
)
type ContextMenuCheckboxItemProps = Omit<
  Omit<ComponentProps<typeof SdkMenuCheckboxItem>, "value"> & {
    value?: string
  },
  "class"
> & {
  class?: string
}
const ContextMenuCheckboxItem = (props: ContextMenuCheckboxItemProps) => {
  const others = omit(props, "class", "children", "value")
  const value = createUniqueId()
  return (
    <SdkMenuCheckboxItem
      value={props.value ?? value}
      class={cn(
        "gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      {...others}
    >
      <span class="absolute right-2 pointer-events-none">
        <SdkMenuItemIndicator>
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
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </SdkMenuItemIndicator>
      </span>
      {props.children}
    </SdkMenuCheckboxItem>
  )
}
type ContextMenuRadioGroupProps = Omit<
  ComponentProps<typeof SdkMenuRadioGroup>,
  "class"
> & {
  class?: string
}
const ContextMenuRadioGroup = (props: ContextMenuRadioGroupProps) => (
  <SdkMenuRadioGroup {...props} class={props.class} />
)
type ContextMenuRadioItemProps = Omit<
  ComponentProps<typeof SdkMenuRadioItem>,
  "class"
> & {
  class?: string
}
const ContextMenuRadioItem = (props: ContextMenuRadioItemProps) => {
  const others = omit(props, "class", "children")
  return (
    <SdkMenuRadioItem
      class={cn(
        "gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        props.class
      )}
      {...others}
    >
      <span class="absolute right-2 pointer-events-none">
        <SdkMenuItemIndicator>
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
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </SdkMenuItemIndicator>
      </span>
      {props.children}
    </SdkMenuRadioItem>
  )
}
type ContextMenuSeparatorProps = Omit<
  ComponentProps<typeof SdkMenuSeparator>,
  "class"
> & {
  class?: string
}
const ContextMenuSeparator = (props: ContextMenuSeparatorProps) => (
  <SdkMenuSeparator
    {...props}
    class={cn("-mx-1 my-1 h-px bg-border", props.class)}
  />
)
type ContextMenuShortcutProps = ComponentProps<"span">
const ContextMenuShortcut = (props: ContextMenuShortcutProps) => (
  <span {...props} class={cn("ml-auto text-xs tracking-widest text-muted-foreground group-focus/context-menu-item:text-accent-foreground", props.class)} />
)
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
}
