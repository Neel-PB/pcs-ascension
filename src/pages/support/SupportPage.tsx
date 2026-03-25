import { useState } from "react";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { FileText, MessageSquare, ExternalLink, Plus } from "@/lib/icons";
import { toast } from "sonner";
import { UserGuidesTab } from "@/components/support/UserGuidesTab";
import { TrainingVideosTab } from "@/components/support/TrainingVideosTab";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useRBAC } from "@/hooks/useRBAC";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

const GOOGLE_CHAT_WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAQANHVwNj8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=kCFviCb1lEHdQ2uobep6zSXuomIdNtrLaifZBB00YqY";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("guides");
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch();
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddFaqDialog, setShowAddFaqDialog] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  const { hasPermission, userId } = useRBAC();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tabs = [
    { id: "guides", label: "User Guides" },
    { id: "faqs", label: "FAQs" },
    { id: "videos", label: "Training Videos" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "report", label: "Report Issue" },
  ];

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      const payload = {
        text: `🚨 *New Issue Reported*\n\n*Reporter:* ${user?.firstName ?? ''} ${user?.lastName ?? ''} (${user?.email ?? 'unknown'})\n*Title:* ${issueTitle}\n*Description:* ${issueDescription}\n*Submitted:* ${timestamp}`,
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
    } catch {
      toast.error("Failed to submit issue", {
        description: "Please try again or contact support directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch DB FAQs
  const { data: dbFaqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: () => apiFetch<{ id: string; question: string; answer: string; created_at: string; author?: { first_name: string; last_name: string } }[]>('/faqs'),
  });

  // Insert FAQ mutation
  const addFaqMutation = useMutation({
    mutationFn: async ({ question, answer }: { question: string; answer: string }) => {
      await apiFetch('/faqs', { method: 'POST', body: JSON.stringify({ question, answer }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success("FAQ Added", { description: "Your FAQ has been published." });
      setShowAddFaqDialog(false);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    },
    onError: () => {
      toast.error("Failed to add FAQ");
    },
  });

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    addFaqMutation.mutate({ question: newFaqQuestion, answer: newFaqAnswer });
  };

  const filteredFaqs = dbFaqs.filter(faq =>
    debouncedSearch === "" ||
    faq.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(debouncedSearch.toLowerCase())
  );


  const troubleshootingTopics = [
    {
      issue: "Data not loading or showing blank screens",
      solution: "Try refreshing your browser or clearing your cache. If the issue persists, check your internet connection and ensure you're logged in properly."
    },
    {
      issue: "Unable to export reports",
      solution: "Make sure you have the necessary permissions for the data you're trying to export. Contact your administrator if you need additional access rights."
    },
    {
      issue: "Filters not working correctly",
      solution: "Clear all filters and reapply them one at a time. Ensure you're starting with the highest level (Region) before applying more specific filters."
    },
    {
      issue: "Employee records not updating",
      solution: "Check that all required fields are filled in correctly. Wait a few moments for the system to sync, then refresh the page."
    },
    {
      issue: "Performance issues or slow loading",
      solution: "Close unnecessary browser tabs, ensure you're using a supported browser (Chrome, Firefox, Safari, or Edge), and check your internet speed."
    }
  ];

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Tabs */}
      <div className="flex justify-center flex-shrink-0">
        <ToggleButtonGroup
          items={tabs}
          activeId={activeTab}
          onSelect={setActiveTab}
          layoutId="supportToggle"
        />
      </div>

      <div className="min-h-0 max-h-full overflow-auto">
        {activeTab === "guides" && (
          <div className="bg-shell-elevated rounded-xl px-4 pb-4 shadow-md">
            <UserGuidesTab />
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1">
              <SearchField
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {hasPermission('support.add_faq') && (
              <Button size="sm" onClick={() => setShowAddFaqDialog(true)} className="gap-1.5 flex-shrink-0">
                <Plus className="h-4 w-4" />
                Add FAQ
              </Button>
            )}
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border border-shell-elevated rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-shell-muted">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-shell-muted">No FAQs match your search. Try different keywords or browse all topics.</p>
            </div>
          )}
        </div>
        )}

        {activeTab === "videos" && (
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
            <TrainingVideosTab />
          </div>
        )}

        {activeTab === "troubleshooting" && (
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
          <div className="space-y-4">
            {troubleshootingTopics.map((topic, index) => (
              <div key={index} className="p-4 bg-shell-elevated rounded-lg border border-shell-elevated">
                <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  {topic.issue}
                </h3>
                <p className="text-sm text-shell-muted ml-7">{topic.solution}</p>
              </div>
            ))}
          </div>
        </div>
        )}

        {activeTab === "report" && (
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
          <form onSubmit={handleSubmitIssue} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Issue Title</label>
              <Input
                type="text"
                placeholder="Brief description of the issue"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <Textarea
                placeholder="Please provide detailed information about the issue you're experiencing..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                required
                rows={6}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                <FileText className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </Button>
              <Button type="button" variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                View My Tickets
              </Button>
            </div>
          </form>
        </div>
        )}
      </div>

      {/* Add FAQ Dialog */}
      <Dialog open={showAddFaqDialog} onOpenChange={setShowAddFaqDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add FAQ</DialogTitle>
            <DialogDescription>Create a new frequently asked question entry.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddFaq} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Question</label>
              <Input
                placeholder="Enter the question"
                value={newFaqQuestion}
                onChange={(e) => setNewFaqQuestion(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Answer</label>
              <Textarea
                placeholder="Enter the answer"
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                required
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddFaqDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={addFaqMutation.isPending}>
                {addFaqMutation.isPending ? "Adding..." : "Add FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
