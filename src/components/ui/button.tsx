import * as React from "react"
// class-variance-authority is not installed; using a minimal stub for cva and VariantProps
type VariantProps<T> = T extends (props: infer P) => any ? P : never;

function cva(base: string, config?: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> }) {
  return (props?: Record<string, string>) => {
    let className = base;
    if (config?.variants && props) {
      for (const [key, value] of Object.entries(props)) {
        const variantClass = config.variants[key]?.[value];
        if (variantClass) className += " " + variantClass;
      }
    }
    return className;
  };
}

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#5AFF7F] text-white hover:bg-[#5AFF7F]/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-[#5AFF7F] hover:text-white",
        secondary:
          "bg-bcgames-darkgrey text-white hover:bg-[#5AFF7F]",
        ghost: "hover:bg-[#5AFF7F] hover:text-white",
        link: "text-[#5AFF7F] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }