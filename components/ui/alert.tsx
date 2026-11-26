import { type ComponentProps } from "@solidjs/web"
import { cva, type VariantProps } from "class-variance-authority"
import { omit } from "solid-js"

import { cn } from "@/lib/utils"

const alertVariants = cva("group/alert grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type AlertProps = ComponentProps<"div"> & VariantProps<typeof alertVariants>

const Alert = (props: AlertProps) => {
  const others = omit(props, "class", "variant")
  return (
    <div
      class={cn(alertVariants({ variant: props.variant }), props.class)}
      data-slot="alert"
      role="alert"
      {...others}
    />
  )
}

type AlertTitleProps = ComponentProps<"h5">

const AlertTitle = (props: AlertTitleProps) => (
  <h5
    data-slot="alert-title"
    {...props}
    class={cn("font-medium group-has-[>svg]/alert:col-start-2", props.class)}
  />
)

type AlertDescriptionProps = ComponentProps<"div">

const AlertDescription = (props: AlertDescriptionProps) => (
  <div
    data-slot="alert-description"
    {...props}
    class={cn("text-sm text-balance text-muted-foreground md:text-pretty [&_p:not(:last-child)]:mb-4", props.class)}
  />
)

type AlertActionProps = ComponentProps<"div">

const AlertAction = (props: AlertActionProps) => (
  <div
    data-slot="alert-action"
    {...props}
    class={cn("absolute top-2 right-2", props.class)}
  />
)

export {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  alertVariants,
  type AlertActionProps,
  type AlertDescriptionProps,
  type AlertProps,
  type AlertTitleProps
}
