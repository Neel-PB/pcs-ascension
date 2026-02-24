import { Link } from "react-router-dom";
import AscensionLogo from "@/assets/Ascension-Emblem.svg";

export function OrganizationSwitcher() {
  return (
    <Link to="/staffing" data-tour="org-switcher" className="flex items-center justify-center w-11 h-11 rounded-lg transition-colors cursor-pointer">
      <img 
        src={AscensionLogo} 
        alt="Ascension" 
        className="w-10 h-10 object-contain"
      />
    </Link>
  );
}
