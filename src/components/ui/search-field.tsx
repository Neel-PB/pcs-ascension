import * as React from "react";
import { Search, X } from "@/lib/icons";
import { ICON_CHROME, ICON_SEARCH_FIELD } from "@/lib/iconSizes";
import { cn } from "@/lib/utils";

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, value, onChange, onClear, ...props }, ref) => {
    const hasValue = value !== undefined && value !== "";

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn("relative", className)}>
        <input
          type="text"
          className={cn(
            "flex w-full rounded-full border-2 border-input bg-background pl-4 pr-[5.5rem] h-11 text-base ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm transition-all"
          )}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className={ICON_CHROME} />
          </button>
        )}
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label="Search"
        >
          <Search className={ICON_SEARCH_FIELD} />
        </button>
      </div>
    );
  }
);
SearchField.displayName = "SearchField";

export { SearchField };
