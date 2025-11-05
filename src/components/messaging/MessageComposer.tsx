import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSendMessage, roleGroups } from "@/hooks/useMessages";
import { Send } from "lucide-react";

export function MessageComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const handleRoleToggle = (roleValue: string) => {
    if (roleValue === "all") {
      setSelectedRoles(selectedRoles.includes("all") ? [] : ["all"]);
    } else {
      setSelectedRoles(prev => {
        const filtered = prev.filter(r => r !== "all");
        if (filtered.includes(roleValue)) {
          return filtered.filter(r => r !== roleValue);
        }
        return [...filtered, roleValue];
      });
    }
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Send Message to Team</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Selection */}
        <div className="space-y-3">
          <Label>Send To:</Label>
          <div className="grid grid-cols-2 gap-3">
            {roleGroups.map((role) => (
              <div key={role.value} className="flex items-center space-x-2">
                <Checkbox
                  id={role.value}
                  checked={selectedRoles.includes(role.value)}
                  onCheckedChange={() => handleRoleToggle(role.value)}
                  disabled={role.value !== "all" && selectedRoles.includes("all")}
                />
                <Label
                  htmlFor={role.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="title">Subject</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter message subject"
            maxLength={200}
            required
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            className="min-h-[150px]"
            maxLength={maxChars}
            required
          />
          <div className="text-sm text-muted-foreground text-right">
            {charCount}/{maxChars} characters
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTitle("");
              setMessage("");
              setSelectedRoles([]);
            }}
            disabled={isPending}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isPending || !title || !message || selectedRoles.length === 0}>
            <Send className="mr-2 h-4 w-4" />
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
