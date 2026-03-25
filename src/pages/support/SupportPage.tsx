import { useState } from "react";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "@/lib/icons";
import { toast } from "sonner";
import { UserGuidesTab } from "@/components/support/UserGuidesTab";
import { TrainingVideosTab } from "@/components/support/TrainingVideosTab";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useRBAC } from "@/hooks/useRBAC";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiFetch";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("guides");
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch();
  const [showAddFaqDialog, setShowAddFaqDialog] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  const { hasPermission, userId } = useRBAC();
  
  const queryClient = useQueryClient();

  const tabs = [
    { id: "guides", label: "User Guides" },
    { id: "faqs", label: "FAQs" },
    { id: "videos", label: "Training Videos" },
  ];


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
          <div>
            <UserGuidesTab />
          </div>
        )}

        {activeTab === "faqs" && (
          <div>
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

          <Accordion type="single" collapsible className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border border-border/60 border-l-[3px] border-l-primary bg-primary/5 rounded-lg overflow-hidden">
                <AccordionTrigger className="hover:no-underline hover:bg-primary/10 px-4 py-3 transition-colors [&>svg]:text-primary">
                  <span className="text-left font-medium text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground bg-background/60 border-t border-border/40 px-4 pb-4 pt-3">
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
          <div>
            <TrainingVideosTab />
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
