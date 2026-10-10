import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", children, ...props }, ref) => {
    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:opacity-90 shadow-glow-sm border border-primary/40 active:scale-[0.98]",
      secondary:
        "bg-surface-elevated text-foreground hover:bg-surface-elevated/80 border border-surface-border active:scale-[0.98]",
      outline:
        "bg-transparent text-foreground hover:bg-surface border border-surface-border active:scale-[0.98]",
      ghost:
        "bg-transparent text-foreground hover:bg-surface-elevated/60 active:scale-[0.98]",
      danger:
        "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 p-0 rounded-xl justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
