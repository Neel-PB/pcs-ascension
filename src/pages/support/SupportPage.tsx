import { useState } from "react";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchField } from "@/components/ui/search-field";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, FileText, AlertCircle, MessageSquare, ExternalLink } from "@/lib/icons";
import { toast } from "sonner";
import { UserGuidesTab } from "@/components/support/UserGuidesTab";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("guides");
  const { inputValue: searchQuery, debouncedValue: debouncedSearch, setInputValue: setSearchQuery } = useDebouncedSearch();
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  

  const tabs = [
    { id: "guides", label: "User Guides" },
    { id: "faqs", label: "FAQs" },
    { id: "videos", label: "Training Videos" },
    { id: "troubleshooting", label: "Troubleshooting" },
    { id: "report", label: "Report Issue" },
  ];

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Issue Submitted", {
      description: "Your issue has been reported. Our support team will contact you soon.",
    });
    setIssueTitle("");
    setIssueDescription("");
  };

  const faqs = [
    {
      question: "How do I add a new employee to the system?",
      answer: "Navigate to the Positions page, click on the Employees tab, and use the 'Add Employee' button. Fill in the required information including name, department, position, and start date."
    },
    {
      question: "How can I view staffing analytics by region?",
      answer: "Go to the Analytics page and select the 'Region' tab. You'll see comprehensive metrics including total staff, fill rates, and performance scores for each region."
    },
    {
      question: "What's the difference between Contractors and Employees?",
      answer: "Employees are permanent staff on your payroll, while Contractors are temporary workers hired for specific projects or time periods. They have different management workflows and reporting requirements."
    },
    {
      question: "How do I generate a staffing report?",
      answer: "Visit the Reports page and select the appropriate level (Region, Market, Facility, or Department). Choose the report type you need and click the 'Export' button to download it."
    },
    {
      question: "Can I filter data by multiple criteria?",
      answer: "Yes! Use the filter bar at the top of each page to select Region, Market, Facility, and Department. The filters cascade, so selecting a region will show only markets within that region."
    },
    {
      question: "How do I track open requisitions?",
      answer: "Go to the Positions page and click on the Requisitions tab. You'll see all open positions, their status, priority level, and how long they've been open."
    }
  ];

  const trainingVideos = [
    {
      title: "Getting Started with the Platform",
      duration: "5:30",
      description: "Learn the basics of navigating the workforce management platform",
      thumbnail: "🎯"
    },
    {
      title: "Managing Employee Records",
      duration: "8:15",
      description: "Complete guide to adding, editing, and managing employee information",
      thumbnail: "👥"
    },
    {
      title: "Understanding Analytics Dashboard",
      duration: "6:45",
      description: "How to read and interpret workforce analytics and KPIs",
      thumbnail: "📊"
    },
    {
      title: "Creating and Managing Requisitions",
      duration: "7:20",
      description: "Step-by-step process for opening and tracking position requisitions",
      thumbnail: "📝"
    },
    {
      title: "Generating Reports",
      duration: "4:50",
      description: "Learn how to create, customize, and export various reports",
      thumbnail: "📈"
    },
    {
      title: "Using Advanced Filters",
      duration: "3:40",
      description: "Master the filter system to find exactly what you need",
      thumbnail: "🔍"
    }
  ];

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

  const filteredFaqs = faqs.filter(faq =>
    debouncedSearch === "" ||
    faq.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    faq.answer.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Contact Support Banner */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-md flex-shrink-0 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Need Help?</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-shell-muted">Email: <span className="text-primary">support@company.com</span></span>
          <span className="text-shell-muted">Phone: <span className="text-primary">1-800-555-0123</span></span>
        </div>
      </div>

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
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
            <UserGuidesTab />
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="bg-shell-elevated rounded-xl px-4 py-4 shadow-md">
          <div className="mb-4">
            <SearchField
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingVideos.map((video, index) => (
              <div key={index} className="group bg-shell-elevated rounded-lg p-4 hover:shadow-medium transition-all cursor-pointer">
                <div className="flex items-center justify-center bg-gradient-primary rounded-lg h-32 mb-4 text-4xl">
                  {video.thumbnail}
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-shell-muted mb-3">{video.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-shell-muted">{video.duration}</span>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Play className="h-3 w-3" />
                    Watch
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
              <Button type="submit" className="gap-2">
                <FileText className="h-4 w-4" />
                Submit Issue
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
    </div>
  );
}
