import { type ComponentProps } from "@solidjs/web"

import { cn } from "@/lib/utils"

type LabelProps = ComponentProps<"label">

const Label = (props: LabelProps) => (
  <label
    data-slot="label"
    {...props}
    class={cn(
      "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
      props.class
    )}
  />
)

export { Label, type LabelProps }
