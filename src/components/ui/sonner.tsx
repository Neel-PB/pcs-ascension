import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      duration={2500}
      visibleToasts={1}
      closeButton={true}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-none group-[.toaster]:shadow-md group-[.toaster]:rounded-xl group-[.toaster]:p-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton: "group-[.toast]:border group-[.toast]:border-foreground/20 group-[.toast]:bg-transparent group-[.toast]:text-foreground group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:uppercase group-[.toast]:tracking-wide",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:opacity-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
