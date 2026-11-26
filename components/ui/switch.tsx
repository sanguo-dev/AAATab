import type { ComponentProps } from "@solidjs/web"
import {
  Switch as SdkSwitch,
  SwitchThumb as SdkSwitchThumb
} from "@ui-sdk/solid/switch"
import { omit } from "solid-js"

import { cn } from "@/lib/utils"
type SwitchProps = Omit<ComponentProps<typeof SdkSwitch>, "class"> & {
  class?: string
  size?: "sm" | "default"
}
const Switch = (props: SwitchProps) => {
  const rest = omit(props, "class", "children", "size")
  return (
    <SdkSwitch
      {...rest}
      data-size={props.size ?? "default"}
      class={cn(
        "shrink-0 rounded-full border border-transparent group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 peer group/switch relative inline-flex items-center justify-start p-0 transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        props.class
      )}
    >
      <SdkSwitchThumb
        class={cn(
          "rounded-full bg-background group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:ltr:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:ltr:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-checked:rtl:-translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:rtl:-translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:ltr:translate-x-0 group-data-[size=sm]/switch:data-unchecked:ltr:translate-x-0 group-data-[size=default]/switch:data-unchecked:rtl:-translate-x-0 group-data-[size=sm]/switch:data-unchecked:rtl:-translate-x-0 dark:data-unchecked:bg-foreground pointer-events-none block rounded-[inherit] ring-0 transition-transform"
        )}
      />
    </SdkSwitch>
  )
}
export { Switch, type SwitchProps }
