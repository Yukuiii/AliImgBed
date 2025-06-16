import * as React from "react";
import { cn } from "../../lib/utils";

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-muted text-foreground border-border",
      secondary: "bg-secondary text-secondary-foreground border-border",
      destructive: "bg-destructive/10 text-destructive border-destructive/20",
      outline: "border-border bg-background text-muted-foreground",
    };

    return (
      <code
        ref={ref}
        className={cn(
          "relative rounded border px-[0.3rem] py-[0.2rem] font-mono text-sm",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Code.displayName = "Code";

export { Code };
