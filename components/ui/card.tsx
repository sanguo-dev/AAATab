import { type ComponentProps } from "@solidjs/web"
import { merge, omit } from "solid-js"

import { cn } from "@/lib/utils"

type CardProps = ComponentProps<"div"> & {
  size?: "default" | "sm"
}

const Card = (props: CardProps) => {
  const local = merge({ size: "default" } as const, props)
  const others = omit(props, "class", "size")
  return (
    <div
      class={cn("gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col", local.class)}
      data-size={local.size}
      data-slot="card"
      {...others}
    />
  )
}

const CardHeader = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-header"
    {...props}
    class={cn(
      "gap-1 rounded-t-xl px-(--card-spacing) [.border-b]:pb-(--card-spacing) group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
      props.class
    )}
  />
)

const CardTitle = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-title"
    {...props}
    class={cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", props.class)}
  />
)

const CardDescription = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-description"
    {...props}
    class={cn("text-sm text-muted-foreground", props.class)}
  />
)

const CardAction = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-action"
    {...props}
    class={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      props.class
    )}
  />
)

const CardContent = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-content"
    {...props}
    class={cn("px-(--card-spacing)", props.class)}
  />
)

const CardFooter = (props: ComponentProps<"div">) => (
  <div
    data-slot="card-footer"
    {...props}
    class={cn("rounded-b-xl border-t bg-muted/50 p-(--card-spacing) flex items-center", props.class)}
  />
)

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps
}
