import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 border",
  {
    variants: {
      variant: {
        default:
          "bg-primary/20 text-primary-foreground border-primary/40 backdrop-blur-sm hover:bg-primary/30 hover:border-primary/60",
        destructive:
          "bg-destructive/20 text-destructive-foreground border-destructive/40 backdrop-blur-sm hover:bg-destructive/30 hover:border-destructive/60",
        outline:
          "border-2 border-border/40 backdrop-blur-sm hover:bg-accent/10 hover:border-border/60",
        secondary:
          "bg-secondary/20 text-secondary-foreground border-secondary/40 backdrop-blur-sm hover:bg-secondary/30 hover:border-secondary/60",
        ghost: "border-transparent hover:bg-accent/10",

        // Status variants matching your image
        todo: "bg-purple-500/20 text-purple-300 border-purple-500/40 backdrop-blur-sm hover:bg-purple-500/30 hover:border-purple-500/60",
        "in-review":
          "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 backdrop-blur-sm hover:bg-yellow-500/30 hover:border-yellow-500/60",
        "design-review":
          "bg-violet-500/20 text-violet-300 border-violet-500/40 backdrop-blur-sm hover:bg-violet-500/30 hover:border-violet-500/60",
        done: "bg-green-500/20 text-green-300 border-green-500/40 backdrop-blur-sm hover:bg-green-500/30 hover:border-green-500/60",
        blocked:
          "bg-rose-500/20 text-rose-300 border-rose-500/40 backdrop-blur-sm hover:bg-rose-500/30 hover:border-rose-500/60",
        "on-hold":
          "bg-blue-500/20 text-blue-300 border-blue-500/40 backdrop-blur-sm hover:bg-blue-500/30 hover:border-blue-500/60",
        archived:
          "bg-gray-500/20 text-gray-300 border-gray-500/40 backdrop-blur-sm hover:bg-gray-500/30 hover:border-gray-500/60",
      },
      size: {
        default: "min-h-9 px-5 py-2",
        sm: "min-h-8 px-4 py-1.5 text-xs",
        lg: "min-h-11 px-6 py-2.5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
