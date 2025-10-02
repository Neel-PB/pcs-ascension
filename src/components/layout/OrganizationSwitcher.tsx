import AscensionLogo from "@/assets/Ascension-Emblem.png";
import { GlassButton } from "@/components/ui/glass-button";

export function OrganizationSwitcher() {
  return (
    <GlassButton size="icon" className="w-10 h-10">
      <img 
        src={AscensionLogo} 
        alt="Ascension" 
        className="w-6 h-6 object-contain"
      />
    </GlassButton>
  );
}
