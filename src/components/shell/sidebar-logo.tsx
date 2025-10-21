import AscensionLogo from "@/assets/Ascension-Emblem.png";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarLogo() {
  const { open } = useSidebar();

  return (
    <div className="flex items-center gap-2 px-2 py-3">
      <img 
        src={AscensionLogo} 
        alt="Ascension" 
        className="h-8 w-8 object-contain shrink-0"
      />
      {open && (
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">Ascension</span>
          <span className="text-xs text-muted-foreground">Position Control</span>
        </div>
      )}
    </div>
  );
}
