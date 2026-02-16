import { useState } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackTableRow } from '@/components/feedback/FeedbackTableRow';
import { SearchField } from '@/components/ui/search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { LogoLoader } from '@/components/ui/LogoLoader';
import { MessageSquare } from '@/lib/icons';
import { useTour } from '@/hooks/useTour';
import { TourTooltip } from '@/components/tour/TourTooltip';
import { feedbackPageTourSteps } from '@/components/tour/tourSteps';

export default function FeedbackPage() {
  const { feedback, isLoading, deleteFeedback } = useFeedback();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pcsStatusFilter, setPcsStatusFilter] = useState<string>('all');
  const [pbStatusFilter, setPbStatusFilter] = useState<string>('all');
  const { run, setRun, completeTour } = useTour('feedback-page');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTour();
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesPcsStatus = pcsStatusFilter === 'all' || item.pcs_status === pcsStatusFilter;
    const matchesPbStatus = pbStatusFilter === 'all' || item.pb_status === pbStatusFilter;
    return matchesSearch && matchesType && matchesPcsStatus && matchesPbStatus;
  });

  const handleDelete = async (id: string) => {
    await deleteFeedback.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LogoLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Joyride
        steps={feedbackPageTourSteps}
        run={run}
        continuous
        showSkipButton
        scrollToFirstStep
        disableOverlayClose
        callback={handleTourCallback}
        tooltipComponent={TourTooltip}
        styles={{
          options: {
            zIndex: 10001,
            arrowColor: 'hsl(var(--card))',
            backgroundColor: 'hsl(var(--card))',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            primaryColor: 'hsl(var(--primary))',
          },
          spotlight: {
            borderRadius: 12,
          },
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Feedback</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all submitted feedback
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div data-tour="feedback-search" className="flex-1 max-w-sm">
            <SearchField
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3" data-tour="feedback-filters">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pcsStatusFilter} onValueChange={setPcsStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="PCS Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PCS Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="disregard">Disregard</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pbStatusFilter} onValueChange={setPbStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="PB Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PB Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback found</p>
          </div>
        ) : (
          <div className="border border-border/50 rounded-xl overflow-hidden" data-tour="feedback-table">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/50 sticky top-0 z-10">
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="w-[80px]">Screenshot</TableHead>
                  <TableHead className="w-[140px]">Author</TableHead>
                  <TableHead className="w-[120px]">PCS Status</TableHead>
                  <TableHead className="w-[110px]">PB Status</TableHead>
                  <TableHead className="w-[80px]">Priority</TableHead>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[90px]">Comments</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item, index) => (
                  <FeedbackTableRow
                    key={item.id}
                    feedback={item}
                    onDelete={handleDelete}
                    isFirstRow={index === 0}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
