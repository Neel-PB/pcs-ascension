import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, LayoutGroup } from "framer-motion";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <LayoutGroup>
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md bg-muted p-0.5 text-muted-foreground",
        className,
      )}
      {...props}
    />
  </LayoutGroup>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    const element = internalRef.current;
    if (!element) return;

    const observer = new MutationObserver(() => {
      const state = element.getAttribute('data-state');
      setIsActive(state === 'active');
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state']
    });

    // Check initial state
    const state = element.getAttribute('data-state');
    setIsActive(state === 'active');

    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        internalRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors",
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="tabIndicator"
          className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary rounded-sm shadow-sm"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
      <span className={cn("relative z-10 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
        {children}
      </span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
