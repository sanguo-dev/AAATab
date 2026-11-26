import { type ComponentProps } from "@solidjs/web"
import {
  Tabs as SdkTabs,
  TabsList as SdkTabsList,
  TabsTab as SdkTabsTab,
  TabsPanel as SdkTabsPanel
} from "@ui-sdk/solid/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { omit } from "solid-js"

import { cn } from "@/lib/utils"
type TabsProps = Omit<ComponentProps<typeof SdkTabs>, "class"> & {
  class?: string
}
const Tabs = (props: TabsProps) => {
  const others = omit(props, "class", "orientation")
  return (
    <SdkTabs
      data-orientation={props.orientation ?? "horizontal"}
      orientation={props.orientation ?? "horizontal"}
      class={cn(
        "group/tabs gap-2 flex data-[orientation=horizontal]:flex-col",
        props.class
      )}
      {...others}
    />
  )
}
const tabsListVariants = cva(
  "group/tabs-list rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
type TabsListProps = (Omit<ComponentProps<typeof SdkTabsList>, "class"> & {
  class?: string
}) &
  VariantProps<typeof tabsListVariants>
const TabsList = (props: TabsListProps) => {
  const others = omit(props, "variant", "class")
  const variant = () => props.variant ?? "default"
  return (
    <SdkTabsList
      class={cn(tabsListVariants({ variant: variant() }), props.class)}

      data-variant={variant()}
      {...others}
    />
  )
}
type TabTriggerProps = Omit<ComponentProps<typeof SdkTabsTab>, "class"> & {
  class?: string
}
const TabsTrigger = (props: TabTriggerProps) => (
  <SdkTabsTab
    {...props}
    class={cn(
      "gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 group-data-[variant=default]/tabs-list:data-[selected]:shadow-sm group-data-[variant=line]/tabs-list:data-[selected]:shadow-none [&_svg:not([class*='size-'])]:size-4 relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
      "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent",
      "data-[selected]:bg-background data-[selected]:text-foreground dark:data-[selected]:border-input dark:data-[selected]:bg-input/30 dark:data-[selected]:text-foreground",
      "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:-bottom-1.25 group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[selected]:after:opacity-100",
      props.class
    )}
  />
)
type TabsContentProps = Omit<ComponentProps<typeof SdkTabsPanel>, "class"> & {
  class?: string
}
const TabsContent = (props: TabsContentProps) => (
  <SdkTabsPanel
    {...props}
    class={cn("text-sm flex-1 outline-none", props.class)}
  />
)
export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger }
