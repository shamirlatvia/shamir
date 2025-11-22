import * as React from "react"
import { cn } from "../../lib/utils"

export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  content: string;
  children: React.ReactNode;
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ className, content, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("relative group cursor-help", className)}
        {...props}
      >
        {children}
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-sm max-w-xs bg-lightfg dark:bg-darkfg text-lightbg dark:text-darkbg rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
          {content}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-lightfg dark:border-t-darkfg"></span>
        </span>
      </span>
    );
  }
);
Tooltip.displayName = "Tooltip";
