import { type ComponentProps } from "@solidjs/web"
import { omit } from "solid-js"

import { cn } from "@/lib/utils"

type TextareaProps = ComponentProps<"textarea">

const Textarea = (props: TextareaProps) => {
  const others = omit(props, "class", "rows")
  return (
    <textarea
      data-slot="textarea"
      class={cn(
        "rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        props.rows == null && "field-sizing-content",
        props.class
      )}
      rows={props.rows}
      {...others}
    />
  )
}

export { Textarea, type TextareaProps }
