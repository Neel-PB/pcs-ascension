import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, LayoutGroup } from "framer-motion";

import { cn } from "@/lib/utils";

const TabsContext = React.createContext<string>("tabs");

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ ...props }, ref) => {
  const id = React.useId();
  return (
    <TabsContext.Provider value={id}>
      <TabsPrimitive.Root ref={ref} {...props} />
    </TabsContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const id = React.useContext(TabsContext);
  return (
    <LayoutGroup id={id}>
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center gap-4 border-b border-border text-muted-foreground",
          className,
        )}
        {...props}
      />
    </LayoutGroup>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const internalRef = React.useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = React.useState(false);
  const tabsId = React.useContext(TabsContext);

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
        "relative inline-flex items-center justify-center whitespace-nowrap pb-2.5 pt-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors",
        isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId={`tabIndicator-${tabsId}`}
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
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
      "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
