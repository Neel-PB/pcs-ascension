import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Task as TaskType } from '@/types/contentBlock';

interface TaskProps {
  task: TaskType;
  onToggle?: (taskId: string) => void;
}

const statusColors = {
  pending: 'bg-muted',
  'in-progress': 'bg-yellow-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
};

export const Task = ({ task, onToggle }: TaskProps) => {
  const isChecked = task.status === 'completed';

  const handleToggle = () => {
    onToggle?.(task.id);
  };

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border border-border',
      'hover:bg-accent/50 transition-colors group'
    )}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="mt-0.5"
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium',
            isChecked && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', statusColors[task.status])} />
            <span className="text-xs text-muted-foreground">
              {statusLabels[task.status]}
            </span>
          </div>
        </div>
        {task.description && (
          <p className={cn(
            'text-sm text-muted-foreground',
            isChecked && 'line-through'
          )}>
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};
