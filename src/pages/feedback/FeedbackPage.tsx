import { useState, useMemo, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useFeedback } from '@/hooks/useFeedback';
import { useFeedbackCommentCounts } from '@/hooks/useFeedbackCommentCounts';
import { SearchField } from '@/components/ui/search-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditableTable } from '@/components/editable-table/EditableTable';
import { createFeedbackColumns } from '@/config/feedbackColumns';
import { LogoLoader } from '@/components/ui/LogoLoader';
import { MessageSquare } from '@/lib/icons';
import { useTour } from '@/hooks/useTour';
import { TourTooltip } from '@/components/tour/TourTooltip';
import { feedbackPageTourSteps } from '@/components/tour/tourSteps';
import { useRBAC } from '@/hooks/useRBAC';

export default function FeedbackPage() {
  const {
    feedback,
    isLoading,
    deleteFeedback,
    updatePcsStatus,
    updatePbStatus,
    updateFeedbackType,
    updateFeedbackPriority,
  } = useFeedback();
  const { hasPermission } = useRBAC();
  const canManageFeedback = hasPermission('approvals.feedback');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pcsStatusFilter, setPcsStatusFilter] = useState<string>('all');
  const [pbStatusFilter, setPbStatusFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { run, setRun, completeTour } = useTour('feedback-page');

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      completeTour();
    }
  };

  const handleSort = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    setSortColumn(columnId);
    setSortDirection(direction);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteFeedback.mutateAsync(id);
  }, [deleteFeedback]);

  const handleTypeChange = useCallback((id: string, type: string) => {
    updateFeedbackType.mutate({ id, type: type as any });
  }, [updateFeedbackType]);

  const handlePcsStatusChange = useCallback((id: string, status: string) => {
    updatePcsStatus.mutate({ id, pcs_status: status as any });
  }, [updatePcsStatus]);

  const handlePbStatusChange = useCallback((id: string, status: string) => {
    updatePbStatus.mutate({ id, pb_status: status as any });
  }, [updatePbStatus]);

  const handlePriorityChange = useCallback((id: string, priority: string) => {
    updateFeedbackPriority.mutate({ id, priority: priority as any });
  }, [updateFeedbackPriority]);

  const commentCounts = useFeedbackCommentCounts();

  const filteredFeedback = useMemo(() => {
    let filtered = feedback.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesPcsStatus = pcsStatusFilter === 'all' || item.pcs_status === pcsStatusFilter;
      const matchesPbStatus = pbStatusFilter === 'all' || item.pb_status === pbStatusFilter;
      return matchesSearch && matchesType && matchesPcsStatus && matchesPbStatus;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = (a as any)[sortColumn];
        let bVal = (b as any)[sortColumn];
        if (!aVal) return 1;
        if (!bVal) return -1;
        if (typeof aVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return filtered;
  }, [feedback, searchQuery, typeFilter, pcsStatusFilter, pbStatusFilter, sortColumn, sortDirection]);

  const feedbackColumns = useMemo(
    () =>
      createFeedbackColumns({
        onTypeChange: handleTypeChange,
        onPcsStatusChange: handlePcsStatusChange,
        onPbStatusChange: handlePbStatusChange,
        onPriorityChange: handlePriorityChange,
        onDelete: handleDelete,
        canManageFeedback,
        commentCounts,
      }),
    [handleTypeChange, handlePcsStatusChange, handlePbStatusChange, handlePriorityChange, handleDelete, canManageFeedback, commentCounts]
  );

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
      <div className="shrink-0 py-4 border-b border-border">
        <div className="flex items-center justify-center gap-3">
          <div data-tour="feedback-search" className="w-64">
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
                <SelectValue placeholder="ACS Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ACS Status</SelectItem>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="flex-1 min-h-0 overflow-hidden py-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No feedback found</p>
          </div>
        ) : (
          <div data-tour="feedback-table" className="min-h-0 max-h-full flex flex-col">
            <EditableTable
              columns={feedbackColumns}
              data={filteredFeedback}
              getRowId={(row) => row.id}
              sortField={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              storeNamespace="feedback-columns-v1"
              className="min-h-0 max-h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
