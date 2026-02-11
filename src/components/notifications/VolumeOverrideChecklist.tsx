import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  label: string;
  completed: boolean;
  type: "mandatory" | "expiring" | "incomplete" | "review";
}

const mockFacilityTasks = {
  facilityName: "Downtown Medical Center",
  tasks: [
    {
      id: "1",
      label: "Set override volume for Emergency Department",
      completed: false,
      type: "mandatory" as const,
    },
    {
      id: "2",
      label: "Set override volume for ICU",
      completed: false,
      type: "mandatory" as const,
    },
    {
      id: "3",
      label: "Renew expiring override for Radiology",
      completed: true,
      type: "expiring" as const,
    },
    {
      id: "4",
      label: "Set expiry date for Cardiology override",
      completed: false,
      type: "incomplete" as const,
    },
    {
      id: "5",
      label: "Review target volume for Pediatrics",
      completed: true,
      type: "review" as const,
    },
  ],
};

export function MonthlyVolumeChecklist() {
  const [tasks, setTasks] = useState<Task[]>(mockFacilityTasks.tasks);
  const navigate = useNavigate();

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleGoToSettings = () => {
    navigate("/staffing?tab=settings");
  };

  return (
    <div className="py-4">
      <div className="border rounded-lg p-4 space-y-4 hover:bg-accent/5 transition-colors">
        {/* Header with facility name and progress */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{mockFacilityTasks.facilityName}</p>
            <p className="text-sm text-muted-foreground">
              Monthly Volume Checklist
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">December 2025</p>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} complete
            </span>
          </div>
        </div>

        {/* Checklist items - clean, no icons */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id)}
                className="mt-0.5"
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.label}
              </span>
            </label>
          ))}
        </div>

        {/* Redirect button with arrow left */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleGoToSettings}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to Settings</span>
        </Button>
      </div>
    </div>
  );
}
