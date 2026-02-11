import { Users, Check } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecipientMultiSelectProps {
  selectedRoles: string[];
  onRoleChange: (roles: string[]) => void;
  roleGroups: Array<{ value: string; label: string }>;
}

export default function RecipientMultiSelect({
  selectedRoles,
  onRoleChange,
  roleGroups,
}: RecipientMultiSelectProps) {
  const handleToggle = (value: string) => {
    if (value === "all") {
      onRoleChange(["all"]);
    } else {
      const filtered = selectedRoles.filter(r => r !== "all");
      if (filtered.includes(value)) {
        onRoleChange(filtered.filter(r => r !== value));
      } else {
        onRoleChange([...filtered, value]);
      }
    }
  };

  const getRecipientLabel = () => {
    if (selectedRoles.length === 0) return "Select recipients";
    if (selectedRoles.includes("all")) return "All teams";
    if (selectedRoles.length === 1) {
      const role = roleGroups.find(r => r.value === selectedRoles[0]);
      return role?.label || "1 group";
    }
    return `${selectedRoles.length} groups selected`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 gap-2 border-0 bg-accent/50 hover:bg-accent text-xs"
        >
          <Users className="h-3 w-3" />
          {getRecipientLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {roleGroups.map((role) => (
          <DropdownMenuCheckboxItem
            key={role.value}
            checked={selectedRoles.includes(role.value)}
            onCheckedChange={() => handleToggle(role.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {role.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
