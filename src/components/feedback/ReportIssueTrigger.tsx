import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Bug, FileText } from "@/lib/icons";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const GOOGLE_CHAT_WEBHOOK_URL =
  "https://chat.googleapis.com/v1/spaces/AAQANHVwNj8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=kCFviCb1lEHdQ2uobep6zSXuomIdNtrLaifZBB00YqY";

export const ReportIssueTrigger: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const payload = {
        text: `🚨 *New Issue Reported*\n\n*Reporter:* ${user?.firstName ?? ""} ${user?.lastName ?? ""} (${user?.email ?? "unknown"})\n*Title:* ${issueTitle}\n*Description:* ${issueDescription}\n*Submitted:* ${timestamp}`,
      };
      const res = await fetch(GOOGLE_CHAT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Issue Submitted", {
        description: "Your issue has been reported to the support team.",
      });
      setIssueTitle("");
      setIssueDescription("");
      setOpen(false);
    } catch {
      toast.error("Failed to submit issue", {
        description: "Please try again or contact support directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        className="fixed right-0 bottom-[128px] h-12 w-6 rounded-l-xl rounded-r-none bg-primary hover:bg-primary/90 shadow-xl active:scale-95 transition-all duration-300 ease-out z-50 flex items-center justify-center text-white" h-12 w-6 rounded-l-xl rounded-r-none bg-primary hover:bg-primary/90 shadow-xl active:scale-95 transition-all duration-300 ease-out z-50 flex items-center justify-center text-white"
        aria-label="Report Issue"
      >
        <Bug className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Report Issue</SheetTitle>
            <SheetDescription>Describe the issue you're experiencing and we'll look into it.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Issue Title</label>
              <Input
                placeholder="Brief description of the issue"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <Textarea
                placeholder="Please provide detailed information about the issue..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                required
                rows={6}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <FileText className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Issue"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};
