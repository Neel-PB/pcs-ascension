import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ToggleButtonGroupProps {
  items: readonly { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  activeId: string;
  onSelect: (id: string) => void;
  layoutId?: string;
  className?: string;
}

export function ToggleButtonGroup({
  items,
  activeId,
  onSelect,
  layoutId = "toggleIndicator",
  className,
}: ToggleButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center rounded-full border-2 border-primary p-1 gap-0.5",
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "text-primary-foreground"
                : "text-foreground hover:bg-muted/50"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary"
                initial={false}
                transition={{
                  type: "tween",
                  duration: 0.2,
                  ease: "easeOut",
                }}
              />
            )}
            {Icon && <Icon className="relative z-10 h-4 w-4" />}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
