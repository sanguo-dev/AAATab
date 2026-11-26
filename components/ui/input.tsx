import { type ComponentProps } from "@solidjs/web"

import { cn } from "@/lib/utils"

type InputProps = ComponentProps<"input">

const Input = (props: InputProps) => (
  <input
    data-slot="input"
    {...props}
    class={cn(
      "h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      props.class
    )}
  />
)

export { Input, type InputProps }
