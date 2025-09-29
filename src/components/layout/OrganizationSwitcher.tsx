import AscensionLogo from "@/assets/Ascension-Emblem.png";

export function OrganizationSwitcher() {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <img 
        src={AscensionLogo} 
        alt="Ascension" 
        className="w-8 h-8 object-contain"
      />
    </div>
  );
}
