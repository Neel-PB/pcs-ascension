import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSendMessage, roleGroups } from "@/hooks/useMessages";
import { Send, X, Users } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Badge } from "@/components/ui/badge";

export function MessageComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const handleRoleSelect = (value: string) => {
    if (value === "all") {
      setSelectedRoles(["all"]);
    } else {
      setSelectedRoles(prev => {
        const filtered = prev.filter(r => r !== "all");
        if (filtered.includes(value)) {
          return filtered.filter(r => r !== value);
        }
        return [...filtered, value];
      });
    }
  };

  const handleClear = () => {
    setTitle("");
    setMessage("");
    setSelectedRoles([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim() || selectedRoles.length === 0) {
      return;
    }

    sendMessage(
      { title: title.trim(), message: message.trim(), targetRoles: selectedRoles },
      {
        onSuccess: () => {
          setTitle("");
          setMessage("");
          setSelectedRoles([]);
        },
      }
    );
  };

  const charCount = message.length;
  const maxChars = 1000;
  const canSend = title.trim() && message.trim() && selectedRoles.length > 0 && !isPending;

  const getRecipientLabel = () => {
    if (selectedRoles.length === 0) return "Select recipients";
    if (selectedRoles.includes("all")) return "All teams";
    if (selectedRoles.length === 1) {
      const role = roleGroups.find(r => r.value === selectedRoles[0]);
      return role?.label || "1 group";
    }
    return `${selectedRoles.length} groups`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Send Message to Team</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm text-muted-foreground">Subject</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter message subject..."
            maxLength={200}
            className="bg-background/95 backdrop-blur-sm border-border/60 focus-visible:ring-primary/20 focus-visible:border-primary/40"
            required
          />
        </div>

        {/* Message Textarea Container */}
        <div className="relative">
          <div className="bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-200">
            <TextareaAutosize
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              maxLength={maxChars}
              minRows={4}
              maxRows={12}
              className="w-full bg-transparent border-0 resize-none outline-none placeholder:text-muted-foreground text-sm p-4 focus:ring-0 focus:border-0"
              required
            />

            {/* Utility Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 border-t border-border/40">
              <div className="flex items-center gap-2">
                {/* Clear Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={isPending}
                  className="h-7 w-7 p-0 rounded-lg hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Recipient Selector */}
                <Select
                  value={selectedRoles.includes("all") ? "all" : selectedRoles[0] || "none"}
                  onValueChange={handleRoleSelect}
                >
                  <SelectTrigger className="h-7 w-auto gap-2 border-0 bg-accent/50 hover:bg-accent text-xs">
                    <Users className="h-3 w-3" />
                    <SelectValue placeholder="Select recipients">
                      {getRecipientLabel()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled className="text-muted-foreground">
                      Select recipients...
                    </SelectItem>
                    {roleGroups.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Roles Badges */}
                {!selectedRoles.includes("all") && selectedRoles.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedRoles.map((roleValue) => {
                      const role = roleGroups.find(r => r.value === roleValue);
                      return (
                        <Badge 
                          key={roleValue} 
                          variant="secondary" 
                          className="text-xs h-6 px-2"
                        >
                          {role?.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Character Counter */}
                <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charCount}/{maxChars}
                </span>

                {/* Send Button */}
                <Button
                  type="submit"
                  disabled={!canSend}
                  size="sm"
                  className="h-7 px-3 gap-1.5"
                >
                  <Send className="h-3 w-3" />
                  {isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
